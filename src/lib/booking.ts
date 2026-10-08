/**
 * Logique métier des réservations : création du paiement, confirmation, annulation.
 *
 * Protection contre la double réservation, en 4 couches :
 *  1. Le calendrier grise les nuits prises (confort, pas sécurité).
 *  2. AVANT paiement : le serveur recalcule prix + disponibilités (réservations + nuits bloquées).
 *  3. La réservation « en attente » bloque les dates pendant le paiement grâce à la contrainte
 *     d'exclusion PostgreSQL (deux réservations actives ne peuvent jamais se chevaucher).
 *  4. APRÈS paiement (webhook) : nouvelle vérification ; si les dates ne sont plus libres
 *     (ex. attente expirée puis reprise, ou blocage iCal entre-temps), remboursement automatique.
 */
import "server-only";
import type Stripe from "stripe";
import { siteConfig } from "@/config/site";
import {
  createPendingBooking,
  expirePendingBookings,
  getAvailabilityData,
  getBooking,
  getBookingBySession,
  getSettings,
  getUnavailableNights,
  pendingHoldMs,
  transitionBooking,
  updateBooking,
} from "./db";
import { formatShort, nightsBetween } from "./dates";
import { sendGuestCancellation, sendGuestConfirmation, sendGuestRefund, sendOwnerAlert, sendOwnerProblem } from "./email";
import { computeQuote, type QuoteInput } from "./pricing";
import { isStripeConfigured, siteUrl, stripe, toCents } from "./stripe";
import type { Booking } from "./types";

export interface CheckoutInput extends QuoteInput {
  name: string;
  email: string;
  phone: string;
  message?: string;
}

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!isStripeConfigured) {
    return { ok: false, error: "Le paiement en ligne n'est pas encore configuré (clé Stripe manquante)." };
  }

  // Libère d'abord les réservations « en attente » expirées pour ne pas bloquer à tort.
  await expirePendingBookings();

  // Couche 2 : recalcul serveur du prix et des disponibilités (on ignore tout montant venu du client).
  const data = await getAvailabilityData();
  const result = computeQuote(input, data);
  if (!result.ok) return result;
  const q = result.quote;

  // Couche 3 : insertion protégée par la contrainte d'exclusion.
  const created = await createPendingBooking({
    check_in: input.checkIn,
    check_out: input.checkOut,
    adults: input.adults,
    children: input.children,
    guest_name: input.name,
    guest_email: input.email,
    guest_phone: input.phone || null,
    message: input.message || null,
    nights: q.nights,
    accommodation_total: q.accommodation,
    cleaning_fee: q.cleaning,
    tourist_tax: q.touristTax,
    total: q.total,
    expires_at: new Date(Date.now() + pendingHoldMs).toISOString(),
    source: "site",
  });
  if (!created.ok) return { ok: false, error: "Ces dates viennent d'être réservées. Choisissez d'autres dates." };
  const booking = created.booking;

  const label = `${formatShort(input.checkIn)} → ${formatShort(input.checkOut)}`;
  const line = (name: string, amount: number, description?: string): Stripe.Checkout.SessionCreateParams.LineItem => ({
    quantity: 1,
    price_data: {
      currency: siteConfig.currency,
      unit_amount: toCents(amount),
      product_data: { name, ...(description ? { description } : {}) },
    },
  });

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "auto", // langue du navigateur (français, anglais…)
      customer_email: input.email,
      client_reference_id: booking.id,
      metadata: { booking_id: booking.id },
      payment_intent_data: { metadata: { booking_id: booking.id }, description: `${siteConfig.name} — ${label}` },
      // Stripe impose au moins 30 minutes : la session expire en même temps que la réservation en attente.
      expires_at: Math.floor((Date.now() + Math.max(pendingHoldMs, 30 * 60_000)) / 1000),
      line_items: [
        line(`Séjour ${siteConfig.name}`, q.accommodation, `${label} · ${q.nights} nuit${q.nights > 1 ? "s" : ""}`),
        ...(q.cleaning > 0 ? [line("Ménage de fin de séjour", q.cleaning)] : []),
        ...(q.touristTax > 0 ? [line("Taxe de séjour", q.touristTax, `${input.adults} adulte(s) × ${q.nights} nuit(s)`)] : []),
      ],
      success_url: `${siteUrl()}/reservation/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/reservation/annulee?booking=${booking.id}`,
    });
    await updateBooking(booking.id, { stripe_session_id: session.id });
    return { ok: true, url: session.url! };
  } catch (e) {
    console.error("[checkout] Stripe", e);
    await updateBooking(booking.id, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "Erreur Stripe à la création du paiement",
    });
    return { ok: false, error: "Le paiement n'a pas pu être initialisé. Réessayez dans un instant." };
  }
}

/**
 * Confirme une réservation à partir d'une session Stripe payée.
 * Appelée par le webhook ET par la page de confirmation : idempotente.
 */
export async function finalizeFromSession(session: Stripe.Checkout.Session): Promise<Booking | null> {
  const bookingId = session.metadata?.booking_id;
  const booking = (bookingId && (await getBooking(bookingId))) || (await getBookingBySession(session.id));
  if (!booking) {
    console.error("[finalize] réservation introuvable pour la session", session.id);
    return null;
  }
  if (session.payment_status !== "paid") return booking;
  if (booking.status === "paid") return booking; // déjà traité

  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const settings = await getSettings();

  // Couche 4 : les nuits sont-elles toujours libres (hors cette réservation) ?
  const taken = await getUnavailableNights(booking.id);
  const conflict = nightsBetween(booking.check_in, booking.check_out).some((n) => taken.has(n));

  let paid: Booking | null = null;
  if (!conflict) {
    const patch: Partial<Booking> = {
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent: paymentIntent,
      stripe_session_id: session.id,
      expires_at: null,
    };
    // Transition conditionnelle : pending → paid (cas normal), ou cancelled → paid
    // (le client a payé juste après l'expiration ; la contrainte d'exclusion refusera s'il y a chevauchement).
    paid = (await transitionBooking(booking.id, "pending", patch)) ?? (await transitionBooking(booking.id, "cancelled", patch));
  }

  if (paid) {
    await Promise.all([sendGuestConfirmation(paid), sendOwnerAlert(paid, settings.alert_email)]);
    return paid;
  }

  // Un autre processus a peut-être déjà confirmé entre-temps.
  const fresh = await getBooking(booking.id);
  if (fresh?.status === "paid") return fresh;

  // Dates devenues indisponibles : remboursement intégral automatique.
  if (paymentIntent) {
    try {
      await stripe().refunds.create({ payment_intent: paymentIntent, reason: "duplicate" }, { idempotencyKey: `refund-${booking.id}` });
    } catch (e) {
      console.error("[finalize] échec du remboursement", e);
    }
  }
  const cancelled =
    (await updateBooking(booking.id, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "Dates indisponibles au moment du paiement — remboursé",
      stripe_payment_intent: paymentIntent,
    })) ?? booking;
  await Promise.all([
    sendGuestRefund(cancelled),
    sendOwnerProblem(cancelled, settings.alert_email, "Dates prises pendant le paiement"),
  ]);
  return cancelled;
}

/** Annulation depuis l'admin, avec remboursement Stripe optionnel. */
export async function cancelBooking(id: string, opts: { refund: boolean; notify: boolean; reason?: string }) {
  const booking = await getBooking(id);
  if (!booking) return { ok: false as const, error: "Réservation introuvable." };
  if (booking.status === "cancelled") return { ok: false as const, error: "Réservation déjà annulée." };

  let refunded = false;
  if (opts.refund && booking.status === "paid" && booking.stripe_payment_intent) {
    try {
      await stripe().refunds.create(
        { payment_intent: booking.stripe_payment_intent },
        { idempotencyKey: `admin-refund-${booking.id}` },
      );
      refunded = true;
    } catch (e) {
      console.error("[cancel] remboursement", e);
      return { ok: false as const, error: "Le remboursement Stripe a échoué : réservation non annulée." };
    }
  }
  if (booking.status === "pending" && booking.stripe_session_id && isStripeConfigured) {
    await stripe().checkout.sessions.expire(booking.stripe_session_id).catch(() => undefined);
  }

  const updated = await updateBooking(id, {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancel_reason: opts.reason || (refunded ? "Annulée et remboursée par le gérant" : "Annulée par le gérant"),
  });
  if (updated && opts.notify) await sendGuestCancellation(updated, refunded);
  return { ok: true as const, refunded };
}

/** Le client a quitté la page de paiement : on libère ses dates tout de suite. */
export async function releaseAbandoned(bookingId: string) {
  const booking = await getBooking(bookingId);
  if (!booking || booking.status !== "pending") return;
  if (booking.stripe_session_id && isStripeConfigured) {
    try {
      const s = await stripe().checkout.sessions.retrieve(booking.stripe_session_id);
      if (s.payment_status === "paid") return; // payé malgré tout : le webhook s'en charge
      if (s.status === "open") await stripe().checkout.sessions.expire(s.id);
    } catch {
      /* session déjà expirée */
    }
  }
  await transitionBooking(bookingId, "pending", {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancel_reason: "Paiement abandonné par le client",
  });
}
