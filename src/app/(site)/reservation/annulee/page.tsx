import type { Metadata } from "next";
import { FadeUp } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { WordReveal } from "@/components/motion/WordReveal";
import { releaseAbandoned } from "@/lib/booking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Paiement annulé", robots: { index: false } };

export default async function CancelledPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const { booking } = await searchParams;
  // Libère immédiatement les dates bloquées pendant la tentative de paiement.
  if (booking) await releaseAbandoned(booking).catch((e) => console.error("[annulee]", e));

  return (
    <section className="flex min-h-[80vh] items-center bg-ecume pb-24 pt-32">
      <div className="container-x max-w-3xl">
        <WordReveal as="h1" immediate text="Le paiement n'a pas abouti" accent={["abouti"]} className="text-5xl md:text-6xl" />
        <FadeUp immediate delay={0.5}>
          <p className="mt-6 text-lg text-marine/80">
            Aucun montant n&apos;a été débité. Vos dates ont été libérées : vous pouvez recommencer quand vous le souhaitez, ou nous écrire si vous avez rencontré un problème.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/reserver" className="group">
              Réessayer <Arrow />
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Nous contacter
            </ButtonLink>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
