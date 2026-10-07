import type { Metadata } from "next";
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

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Réservation confirmée", robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
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
          text={refunded ? "Ces dates viennent d'être prises" : paid ? "C'est réservé, à bientôt face à la mer" : "Paiement reçu, confirmation en cours"}
          accent={["mer", "prises"]}
          className="text-5xl md:text-6xl"
        />
        <FadeUp immediate delay={0.6}>
          {refunded ? (
            <p className="mt-6 text-lg text-marine/80">
              Quelqu&apos;un a réservé ces dates pendant votre paiement. Vous avez été <strong>intégralement remboursé</strong> et un e-mail vous a été envoyé. Toutes nos excuses.
            </p>
          ) : paid && booking ? (
            <>
              <p className="mt-6 text-lg text-marine/80">
                Merci {booking.guest_name.split(" ")[0]} ! Un e-mail de confirmation vient de partir vers <strong>{booking.guest_email}</strong>.
              </p>
              <dl className="mt-10 grid gap-px overflow-hidden rounded-sm bg-marine/15 sm:grid-cols-2">
                {[
                  ["Arrivée", `${formatLong(booking.check_in)} · dès ${siteConfig.defaults.checkInTime}`],
                  ["Départ", `${formatLong(booking.check_out)} · avant ${siteConfig.defaults.checkOutTime}`],
                  ["Voyageurs", `${booking.adults} adulte(s), ${booking.children} enfant(s)`],
                  ["Total payé", formatEUR(booking.total)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-ecume p-5">
                    <dt className="text-xs uppercase tracking-widest text-granite">{k}</dt>
                    <dd className="mt-1 font-serif text-xl first-letter:uppercase">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-granite">Référence : {booking.id.slice(0, 8).toUpperCase()}</p>
            </>
          ) : (
            <p className="mt-6 text-lg text-marine/80">
              Votre paiement a bien été transmis. La confirmation définitive vous parviendra par e-mail dans quelques minutes. Si vous ne recevez rien, <Link href="/contact" className="underline">écrivez-nous</Link>.
            </p>
          )}
          <div className="mt-10">
            <ButtonLink href={refunded ? "/reserver" : "/"} className="group">
              {refunded ? "Choisir d'autres dates" : "Retour à l'accueil"} <Arrow />
            </ButtonLink>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
