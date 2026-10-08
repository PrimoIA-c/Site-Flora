import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { DirectPerks } from "@/components/site/DirectPerks";
import { FadeUp } from "@/components/motion/FadeUp";
import { WordReveal } from "@/components/motion/WordReveal";
import { isValidISODate } from "@/lib/dates";
import { getAvailabilityData, isDemoMode } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic"; // disponibilités toujours fraîches
export const metadata: Metadata = {
  title: "Réserver",
  description: "Choisissez vos dates, le nombre de voyageurs, et réglez votre séjour en ligne en toute sécurité.",
};

export default async function ReserverPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const data = await getAvailabilityData();
  const checkIn = isValidISODate(sp.arrivee) ? sp.arrivee : null;
  const checkOut = checkIn && isValidISODate(sp.depart) && sp.depart > checkIn ? sp.depart : null;

  return (
    <section className="bg-ecume pb-24 pt-28 md:pt-40">
      <div className="container-x">
        <FadeUp immediate y={10}>
          <p className="eyebrow mb-5 flex items-center gap-3 text-granite">
            <span className="h-px w-8 bg-granite" /> Réservation
          </p>
        </FadeUp>
        <WordReveal as="h1" immediate delay={0.1} text="Réservez votre séjour en trois gestes" accent={["séjour"]} className="max-w-3xl text-5xl md:text-7xl" />
        {(isDemoMode || !isStripeConfigured) && (
          <p className="mt-6 max-w-2xl rounded-md border border-phare bg-phare/15 px-4 py-3 text-sm">
            <strong>Mode démonstration :</strong>{" "}
            {!isStripeConfigured
              ? "Stripe n'est pas encore configuré, le paiement est désactivé."
              : "données de test en mémoire (Supabase non configuré)."}{" "}
            Voir le README pour brancher vos clés.
          </p>
        )}
        <div className="mt-8 max-w-4xl">
          <DirectPerks compact />
        </div>
        <div className="mt-12">
          <BookingForm initial={data} initialRange={{ checkIn, checkOut }} />
        </div>
      </div>
    </section>
  );
}
