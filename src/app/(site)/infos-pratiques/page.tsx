import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { FAQ_FR } from "@/config/faq";
import { FadeUp } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { WordReveal } from "@/components/motion/WordReveal";
import { FaqList } from "@/components/site/FaqList";

export const metadata: Metadata = {
  title: "Infos pratiques",
  description: "Arrivée, clés, accès en train ou en ferry, stationnement, linge, paiement : toutes les infos pratiques pour votre séjour à Saint-Servan.",
};

export default function InfosPratiquesPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_FR.flatMap((g) => g.items).map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="bg-ecume pb-12 pt-32 md:pt-40">
        <div className="container-x grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <FadeUp immediate y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-granite">
                <span className="h-px w-8 bg-granite" /> Infos pratiques
              </p>
            </FadeUp>
            <WordReveal as="h1" immediate delay={0.15} text="Tout pour bien préparer votre escale" accent={["escale"]} className="text-5xl md:text-7xl" />
          </div>
          <div className="rise md:col-span-4">
            <p className="text-lg text-marine/75">{siteConfig.location.address}</p>
            <p className="mt-1 text-sm text-granite">
              Arrivée dès {siteConfig.defaults.checkInTime} · départ avant {siteConfig.defaults.checkOutTime}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ecume pb-20 md:pb-28">
        <div className="container-x">
          <FaqList groups={FAQ_FR} />
          <div className="mt-14 flex flex-col items-start gap-4 rounded-lg bg-marine p-6 text-ecume md:flex-row md:items-center md:justify-between md:p-8">
            <p className="font-serif text-2xl md:text-3xl">Une autre question&nbsp;?</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact" className="group">
                Nous écrire <Arrow />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
