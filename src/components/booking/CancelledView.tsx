import { FadeUp } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { WordReveal } from "@/components/motion/WordReveal";
import { releaseAbandoned } from "@/lib/booking";

export async function CancelledView({ booking, lang = "fr" }: { booking?: string; lang?: "fr" | "en" }) {
  const en = lang === "en";
  // Libère immédiatement les dates bloquées pendant la tentative de paiement.
  if (booking) await releaseAbandoned(booking).catch((e) => console.error("[annulee]", e));

  return (
    <section className="flex min-h-[80vh] items-center bg-ecume pb-24 pt-32">
      <div className="container-x max-w-3xl">
        <WordReveal as="h1" immediate text={en ? "The payment didn't go through" : "Le paiement n'a pas abouti"} accent={["abouti", "through"]} className="text-5xl md:text-6xl" />
        <FadeUp immediate delay={0.5}>
          <p className="mt-6 text-lg text-marine/80">
            {en
              ? "Nothing has been charged. Your dates have been released: you can try again whenever you like, or write to us if something went wrong."
              : "Aucun montant n'a été débité. Vos dates ont été libérées : vous pouvez recommencer quand vous le souhaitez, ou nous écrire si vous avez rencontré un problème."}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href={en ? "/en/book" : "/reserver"} className="group">
              {en ? "Try again" : "Réessayer"} <Arrow />
            </ButtonLink>
            <ButtonLink href={en ? "/en/contact" : "/contact"} variant="ghost">
              {en ? "Contact us" : "Nous contacter"}
            </ButtonLink>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
