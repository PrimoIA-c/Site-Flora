import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { FadeUp } from "@/components/motion/FadeUp";
import { WordReveal } from "@/components/motion/WordReveal";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur l'appartement, un séjour long ou des dates particulières ? Écrivez-nous.",
};

export default function ContactPage() {
  return (
    <section className="bg-ecume pb-24 pt-28 md:pt-40">
      <div className="container-x grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <FadeUp immediate y={10}>
            <p className="eyebrow mb-5 flex items-center gap-3 text-granite">
              <span className="h-px w-8 bg-granite" /> Contact
            </p>
          </FadeUp>
          <WordReveal as="h1" immediate delay={0.1} text="Une question ? Lancez une bouteille à la mer" accent={["bouteille", "mer"]} className="text-5xl md:text-6xl" />
          <FadeUp immediate delay={0.6}>
            <p className="mt-8 text-lg text-marine/80">Nous répondons en général dans la journée. Pour réserver directement, le calendrier en ligne reste le plus rapide.</p>
            <dl className="mt-10 space-y-4 text-sm">
              <div>
                <dt className="text-granite">Adresse</dt>
                <dd className="font-serif text-xl">{siteConfig.location.address}</dd>
              </div>
              <div>
                <dt className="text-granite">Téléphone</dt>
                <dd className="font-serif text-xl">{siteConfig.contact.phone}</dd>
              </div>
            </dl>
          </FadeUp>
        </div>
        <FadeUp immediate delay={0.3} className="md:col-span-7">
          <ContactForm />
        </FadeUp>
      </div>
    </section>
  );
}
