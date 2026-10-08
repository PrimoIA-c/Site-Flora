import type { Metadata } from "next";
import { FadeUp } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { WordReveal } from "@/components/motion/WordReveal";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { listPublicPhotos } from "@/lib/db";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Galerie photos",
  description: "Toutes les photos de l'appartement à Saint-Servan, Saint-Malo : salon sous les poutres, chambre mansardée, cuisine équipée, salle d'eau.",
};

export default async function GaleriePage() {
  const photos = await listPublicPhotos();
  return (
    <>
      <section className="bg-ecume pb-10 pt-32 md:pt-40">
        <div className="container-x grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <FadeUp immediate y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-granite">
                <span className="h-px w-8 bg-granite" /> Galerie · {photos.length} photos
              </p>
            </FadeUp>
            <WordReveal as="h1" immediate delay={0.15} text="Le logement, pièce par pièce" accent={["pièce"]} className="text-5xl md:text-7xl" />
          </div>
          <p className="rise text-lg text-marine/75 md:col-span-4">Touchez une photo pour l&apos;ouvrir en grand, puis faites glisser pour passer à la suivante.</p>
        </div>
      </section>

      <section className="bg-ecume pb-24 md:pb-32" aria-label="Photos">
        <div className="container-x">
          <PhotoGallery photos={photos.map((p) => ({ url: p.url, label: p.label || "Le logement" }))} />
        </div>
      </section>

      <section className="bg-marine text-ecume">
        <div className="container-x flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl font-serif text-4xl md:text-5xl">Ça vous plaît&nbsp;? Les dates libres sont à un clic.</p>
          <ButtonLink href="/reserver" className="group shrink-0">
            Voir les disponibilités <Arrow />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
