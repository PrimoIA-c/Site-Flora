/**
 * E-mails transactionnels via Resend.
 * Si RESEND_API_KEY est absente, les e-mails sont simplement journalisés dans la console
 * (pratique en développement).
 */
import "server-only";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import { formatEUR, formatLong } from "./dates";
import { siteUrl } from "./stripe";
import type { Booking } from "./types";

const from = process.env.EMAIL_FROM || `${siteConfig.name} <onboarding@resend.dev>`;

async function send(to: string, subject: string, html: string, replyTo?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email:simulation] → ${to} | ${subject}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from, to, subject, html, replyTo });
  if (error) console.error("[email] échec d'envoi", error);
}

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Gabarit HTML sobre, compatible clients mail (tableaux + styles en ligne). */
function layout(title: string, body: string, lang: "fr" | "en" = "fr") {
  return `<!doctype html><html lang="${lang}"><body style="margin:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif;color:#0e2338">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:4px;overflow:hidden">
<tr><td style="background:#0e2338;padding:28px 32px;color:#f7f5f0">
<div style="font-family:Georgia,serif;font-size:22px">${esc(siteConfig.name)}</div>
<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.7;margin-top:4px">${esc(siteConfig.location.city)}</div>
</td></tr>
<tr><td style="padding:32px">
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e9dfcc;font-size:12px;color:#6b7178">
${esc(siteConfig.name)} · ${esc(siteConfig.location.address)}<br>${lang === "en" ? "Registration no." : "N° d'enregistrement"} : ${esc(siteConfig.registrationNumber)}
</td></tr></table></td></tr></table></body></html>`;
}

function recapEn(b: Booking) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:8px 0;color:#6b7178;font-size:14px">${k}</td><td style="padding:8px 0;text-align:right;font-size:14px">${v}</td></tr>`;
  return `<table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #e9dfcc;border-bottom:1px solid #e9dfcc;margin:16px 0">
${row("Arrival", `${esc(formatLong(b.check_in, "en"))} from ${siteConfig.defaults.checkInTime}`)}
${row("Departure", `${esc(formatLong(b.check_out, "en"))} by ${siteConfig.defaults.checkOutTime}`)}
${row("Guests", `${b.adults} adult${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} child${b.children > 1 ? "ren" : ""}` : ""}`)}
${row(`Accommodation (${b.nights} night${b.nights > 1 ? "s" : ""})`, formatEUR(b.accommodation_total))}
${b.cleaning_fee ? row("End-of-stay cleaning", formatEUR(b.cleaning_fee)) : ""}
${row("Tourist tax", formatEUR(b.tourist_tax))}
${row("<strong style='color:#0e2338'>Total paid</strong>", `<strong>${formatEUR(b.total)}</strong>`)}
</table>`;
}

function recap(b: Booking) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:8px 0;color:#6b7178;font-size:14px">${k}</td><td style="padding:8px 0;text-align:right;font-size:14px">${v}</td></tr>`;
  return `<table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #e9dfcc;border-bottom:1px solid #e9dfcc;margin:16px 0">
${row("Arrivée", `${esc(formatLong(b.check_in))} à partir de ${siteConfig.defaults.checkInTime}`)}
${row("Départ", `${esc(formatLong(b.check_out))} avant ${siteConfig.defaults.checkOutTime}`)}
${row("Voyageurs", `${b.adults} adulte${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} enfant${b.children > 1 ? "s" : ""}` : ""}`)}
${row(`Hébergement (${b.nights} nuit${b.nights > 1 ? "s" : ""})`, formatEUR(b.accommodation_total))}
${b.cleaning_fee ? row("Ménage de fin de séjour", formatEUR(b.cleaning_fee)) : ""}
${row("Taxe de séjour", formatEUR(b.tourist_tax))}
${row("<strong style='color:#0e2338'>Total payé</strong>", `<strong>${formatEUR(b.total)}</strong>`)}
</table>`;
}

export async function sendGuestConfirmation(b: Booking, lang: "fr" | "en" = "fr") {
  if (lang === "en") {
    const body = `<p style="font-size:15px;line-height:1.6">Hello ${esc(b.guest_name)},</p>
<p style="font-size:15px;line-height:1.6">We have received your payment: your stay in ${esc(siteConfig.location.city)} is confirmed. Here is your summary.</p>
${recapEn(b)}
<p style="font-size:14px;line-height:1.6">Reference: <strong>${esc(b.id.slice(0, 8).toUpperCase())}</strong><br>
We will send you the practical details (exact address, key handover) a few days before you arrive.</p>
<p style="font-size:14px;line-height:1.6">Rental terms (in French): <a href="${siteUrl()}/conditions-generales" style="color:#0e2338">${siteUrl()}/conditions-generales</a></p>
<p style="font-size:15px;line-height:1.6">See you soon by the sea!</p>`;
    return send(b.guest_email, `Booking confirmed — ${siteConfig.name}`, layout("Your stay is confirmed", body, "en"));
  }
  const body = `<p style="font-size:15px;line-height:1.6">Bonjour ${esc(b.guest_name)},</p>
<p style="font-size:15px;line-height:1.6">Votre paiement est bien reçu : votre séjour à ${esc(siteConfig.location.city)} est confirmé. Voici le récapitulatif.</p>
${recap(b)}
<p style="font-size:14px;line-height:1.6">Référence : <strong>${esc(b.id.slice(0, 8).toUpperCase())}</strong><br>
Nous vous enverrons les informations pratiques (adresse exacte, remise des clés) quelques jours avant votre arrivée.</p>
<p style="font-size:14px;line-height:1.6">Conditions de location : <a href="${siteUrl()}/conditions-generales" style="color:#0e2338">${siteUrl()}/conditions-generales</a></p>
<p style="font-size:15px;line-height:1.6">À très bientôt face à la mer !</p>`;
  await send(b.guest_email, `Réservation confirmée — ${siteConfig.name}`, layout("Votre séjour est confirmé", body));
}

export async function sendOwnerAlert(b: Booking, to: string | null) {
  if (!to || to.includes("[À COMPLÉTER]")) return console.warn("[email] Aucune adresse d'alerte configurée (admin → Paramètres).");
  const body = `<p style="font-size:15px;line-height:1.6"><strong>${esc(b.guest_name)}</strong> vient de réserver et de payer.</p>
${recap(b)}
<p style="font-size:14px;line-height:1.8">E-mail : <a href="mailto:${esc(b.guest_email)}">${esc(b.guest_email)}</a><br>
Téléphone : ${esc(b.guest_phone) || "—"}<br>
${b.message ? `Message : ${esc(b.message)}<br>` : ""}</p>
<p><a href="${siteUrl()}/admin/reservations/${b.id}" style="display:inline-block;background:#0e2338;color:#fff;padding:12px 20px;text-decoration:none;border-radius:999px;font-size:14px">Voir dans l'admin</a></p>`;
  await send(
    to,
    `Nouvelle réservation : ${formatLong(b.check_in)} → ${formatLong(b.check_out)} (${formatEUR(b.total)})`,
    layout("Nouvelle réservation", body),
    b.guest_email,
  );
}

export async function sendOwnerProblem(b: Booking, to: string | null, reason: string) {
  if (!to) return;
  const body = `<p style="font-size:15px;line-height:1.6">Un paiement a été reçu pour des dates devenues indisponibles. <strong>Le client a été remboursé automatiquement.</strong></p>
<p style="font-size:14px">Motif : ${esc(reason)}</p>${recap(b)}
<p style="font-size:14px">Client : ${esc(b.guest_name)} — ${esc(b.guest_email)} — ${esc(b.guest_phone)}</p>`;
  await send(to, `⚠️ Paiement remboursé (dates indisponibles)`, layout("Réservation remboursée", body));
}

export async function sendGuestRefund(b: Booking, lang: "fr" | "en" = "fr") {
  if (lang === "en") {
    const body = `<p style="font-size:15px;line-height:1.6">Hello ${esc(b.guest_name)},</p>
<p style="font-size:15px;line-height:1.6">We are sorry: the dates from ${esc(formatLong(b.check_in, "en"))} to ${esc(formatLong(b.check_out, "en"))} were booked by someone else while you were paying. You have been <strong>fully refunded (${formatEUR(b.total)})</strong>; it should appear on your account within 5 to 10 days.</p>
<p style="font-size:15px;line-height:1.6">Other dates may still be free: <a href="${siteUrl()}/en/book" style="color:#0e2338">see the calendar</a>.</p>`;
    return send(b.guest_email, `Your booking could not be confirmed — refund issued`, layout("Refund issued", body, "en"));
  }
  const body = `<p style="font-size:15px;line-height:1.6">Bonjour ${esc(b.guest_name)},</p>
<p style="font-size:15px;line-height:1.6">Nous sommes désolés : les dates du ${esc(formatLong(b.check_in))} au ${esc(formatLong(b.check_out))} ont été réservées pendant votre paiement. Nous vous avons <strong>intégralement remboursé (${formatEUR(b.total)})</strong> ; le délai d'apparition sur votre compte est de 5 à 10 jours.</p>
<p style="font-size:15px;line-height:1.6">D'autres dates sont peut-être libres : <a href="${siteUrl()}/reserver" style="color:#0e2338">voir le calendrier</a>.</p>`;
  await send(b.guest_email, `Votre réservation n'a pas pu être confirmée — remboursement`, layout("Remboursement effectué", body));
}

export async function sendGuestCancellation(b: Booking, refunded: boolean) {
  const body = `<p style="font-size:15px;line-height:1.6">Bonjour ${esc(b.guest_name)},</p>
<p style="font-size:15px;line-height:1.6">Votre réservation du ${esc(formatLong(b.check_in))} au ${esc(formatLong(b.check_out))} a été annulée.${
    refunded ? ` Un remboursement de ${formatEUR(b.total)} a été émis ; il apparaîtra sous 5 à 10 jours.` : ""
  }</p><p style="font-size:15px;line-height:1.6">Pour toute question, répondez simplement à cet e-mail.</p>`;
  await send(b.guest_email, `Annulation de votre réservation — ${siteConfig.name}`, layout("Réservation annulée", body));
}

export async function sendContactMessage(
  to: string | null,
  msg: { name: string; email: string; phone?: string; dates?: string; message: string },
) {
  const body = `<p style="font-size:14px;line-height:1.8"><strong>${esc(msg.name)}</strong> — <a href="mailto:${esc(msg.email)}">${esc(msg.email)}</a><br>
${msg.phone ? `Téléphone : ${esc(msg.phone)}<br>` : ""}${msg.dates ? `Dates envisagées : ${esc(msg.dates)}<br>` : ""}</p>
<div style="font-size:15px;line-height:1.6;white-space:pre-wrap;background:#f7f5f0;padding:16px;border-radius:4px">${esc(msg.message)}</div>`;
  await send(to || siteConfig.contact.email, `Message de ${msg.name} via le site`, layout("Nouveau message", body), msg.email);
}
