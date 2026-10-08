import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { FadeUp } from "@/components/motion/FadeUp";
import { WordReveal } from "@/components/motion/WordReveal";
import { DirectPerks } from "@/components/site/DirectPerks";
import { isValidISODate } from "@/lib/dates";
import { getAvailabilityData, isDemoMode } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book your stay",
  description: "Pick your dates and number of guests, then pay securely online. Direct booking, no service fees.",
  alternates: { languages: { fr: "/reserver", en: "/en/book" } },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const data = await getAvailabilityData();
  const checkIn = isValidISODate(sp.arrival) ? sp.arrival : null;
  const checkOut = checkIn && isValidISODate(sp.departure) && sp.departure > checkIn ? sp.departure : null;

  return (
    <div lang="en">
      <section className="bg-ecume pb-24 pt-28 md:pt-40">
        <div className="container-x">
          <FadeUp immediate y={10}>
            <p className="eyebrow mb-5 flex items-center gap-3 text-granite">
              <span className="h-px w-8 bg-granite" /> Booking
            </p>
          </FadeUp>
          <WordReveal as="h1" immediate delay={0.1} text="Book your stay in three steps" accent={["stay"]} className="max-w-3xl text-5xl md:text-7xl" />
          {(isDemoMode || !isStripeConfigured) && (
            <p className="mt-6 max-w-2xl rounded-md border border-phare bg-phare/15 px-4 py-3 text-sm">
              <strong>Demo mode:</strong> online payment is not switched on yet.
            </p>
          )}
          <div className="mt-8 max-w-4xl">
            <DirectPerks lang="en" compact />
          </div>
          <div className="mt-12">
            <BookingForm initial={data} initialRange={{ checkIn, checkOut }} />
          </div>
        </div>
      </section>
    </div>
  );
}
