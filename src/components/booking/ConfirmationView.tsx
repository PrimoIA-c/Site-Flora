import Link from "next/link";
import { siteConfig } from "@/config/site";
import { FadeUp } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { WordReveal } from "@/components/motion/WordReveal";
import { finalizeFromSession } from "@/lib/booking";
import { formatEUR, formatLong } from "@/lib/dates";
import { getBookingBySession } from "@/lib/db";
import { isStripeConfigured, stripe } from "@/lib/stripe";
import type { Booking } from "@/lib/types";

export async function ConfirmationView({ session_id, lang = "fr" }: { session_id?: string; lang?: "fr" | "en" }) {
  const en = lang === "en";
  let booking: Booking | null = null;

  if (session_id && isStripeConfigured && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      // Confirme immédiatement si le webhook n'est pas encore passé (opération idempotente).
      booking = session.payment_status === "paid" ? await finalizeFromSession(session) : await getBookingBySession(session_id);
    } catch (e) {
      console.error("[confirmation]", e);
    }
  }

  const paid = booking?.status === "paid";
  const refunded = booking?.status === "cancelled";

  return (
    <section className="flex min-h-[80vh] items-center bg-ecume pb-24 pt-32">
      <div className="container-x max-w-3xl">
        <FadeUp immediate>
          <svg aria-hidden viewBox="0 0 64 64" className="mb-8 h-16 w-16">
            <circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-marine)" strokeOpacity=".15" />
            <path d="M18 34c5-6 9 6 14 0s9 6 14 0" fill="none" stroke="var(--color-phare-2)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </FadeUp>
        <WordReveal
          as="h1"
          immediate
          text={en ? (refunded ? "These dates have just been taken" : paid ? "You're booked — see you by the sea" : "Payment received, confirming…") : refunded ? "Ces dates viennent d'être prises" : paid ? "C'est réservé, à bientôt face à la mer" : "Paiement reçu, confirmation en cours"}
          accent={["mer", "prises", "sea", "taken"]}
          className="text-5xl md:text-6xl"
        />
        <FadeUp immediate delay={0.6}>
          {refunded ? (
            <p className="mt-6 text-lg text-marine/80">
              {en ? (
                <>Someone booked these dates while you were paying. You have been <strong>fully refunded</strong> and we have sent you an e-mail. Our apologies.</>
              ) : (
                <>Quelqu&apos;un a réservé ces dates pendant votre paiement. Vous avez été <strong>intégralement remboursé</strong> et un e-mail vous a été envoyé. Toutes nos excuses.</>
              )}
            </p>
          ) : paid && booking ? (
            <>
              <p className="mt-6 text-lg text-marine/80">
                {en ? "Thank you" : "Merci"} {booking.guest_name.split(" ")[0]} ! {en ? "A confirmation e-mail is on its way to" : "Un e-mail de confirmation vient de partir vers"} <strong>{booking.guest_email}</strong>.
              </p>
              <dl className="mt-10 grid gap-px overflow-hidden rounded-sm bg-marine/15 sm:grid-cols-2">
                {[
                  [en ? "Arrival" : "Arrivée", `${formatLong(booking.check_in, lang)} · ${en ? "from" : "dès"} ${siteConfig.defaults.checkInTime}`],
                  [en ? "Departure" : "Départ", `${formatLong(booking.check_out, lang)} · ${en ? "by" : "avant"} ${siteConfig.defaults.checkOutTime}`],
                  [en ? "Guests" : "Voyageurs", en ? `${booking.adults} adult(s), ${booking.children} child(ren)` : `${booking.adults} adulte(s), ${booking.children} enfant(s)`],
                  [en ? "Total paid" : "Total payé", formatEUR(booking.total)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-ecume p-5">
                    <dt className="text-xs uppercase tracking-widest text-granite">{k}</dt>
                    <dd className="mt-1 font-serif text-xl first-letter:uppercase">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-granite">{en ? "Reference" : "Référence"} : {booking.id.slice(0, 8).toUpperCase()}</p>
            </>
          ) : (
            <p className="mt-6 text-lg text-marine/80">
              {en ? (
                <>Your payment has been sent. The final confirmation will reach you by e-mail within a few minutes. If you receive nothing, <Link href="/en/contact" className="underline">write to us</Link>.</>
              ) : (
                <>Votre paiement a bien été transmis. La confirmation définitive vous parviendra par e-mail dans quelques minutes. Si vous ne recevez rien, <Link href="/contact" className="underline">écrivez-nous</Link>.</>
              )}
            </p>
          )}
          <div className="mt-10">
            <ButtonLink href={refunded ? (en ? "/en/book" : "/reserver") : en ? "/en" : "/"} className="group">
              {refunded ? (en ? "Choose other dates" : "Choisir d'autres dates") : en ? "Back to home" : "Retour à l'accueil"} <Arrow />
            </ButtonLink>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
