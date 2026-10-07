import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { finalizeFromSession } from "@/lib/booking";
import { getBooking, transitionBooking } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Webhook Stripe — source de vérité du paiement.
 * Événements à activer dans Stripe : checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.expired.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // Le corps BRUT est indispensable pour vérifier la signature.
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (e) {
    console.error("[webhook] signature invalide", e);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await finalizeFromSession(event.data.object);
        break;
      case "checkout.session.expired": {
        const id = event.data.object.metadata?.booking_id;
        if (id && (await getBooking(id))) {
          await transitionBooking(id, "pending", {
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancel_reason: "Paiement non finalisé (session expirée)",
          });
        }
        break;
      }
    }
  } catch (e) {
    console.error("[webhook] traitement", e);
    // 500 → Stripe réessaiera automatiquement.
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
