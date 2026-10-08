import type { Metadata } from "next";
import { FadeUp } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { WordReveal } from "@/components/motion/WordReveal";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { listPublicPhotos } from "@/lib/db";
import { photoLabelEn } from "@/lib/i18n";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Photo gallery",
  description: "All the photos of the apartment in Saint-Servan, Saint-Malo: beamed living room, attic bedroom, fitted kitchen, shower room.",
  alternates: { languages: { fr: "/galerie", en: "/en/gallery" } },
};

export default async function GalleryPage() {
  const photos = await listPublicPhotos();
  return (
    <div lang="en">
      <section className="bg-ecume pb-10 pt-32 md:pt-40">
        <div className="container-x grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <FadeUp immediate y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-granite">
                <span className="h-px w-8 bg-granite" /> Gallery · {photos.length} photos
              </p>
            </FadeUp>
            <WordReveal as="h1" immediate delay={0.15} text="The apartment, room by room" accent={["room"]} className="text-5xl md:text-7xl" />
          </div>
          <p className="rise text-lg text-marine/75 md:col-span-4">Tap a photo to open it full screen, then swipe to see the next one.</p>
        </div>
      </section>
      <section className="bg-ecume pb-24 md:pb-32" aria-label="Photos">
        <div className="container-x">
          <PhotoGallery photos={photos.map((p) => ({ url: p.url, label: photoLabelEn(p.label || "Le logement") }))} />
        </div>
      </section>
      <section className="bg-marine text-ecume">
        <div className="container-x flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl font-serif text-4xl md:text-5xl">Like what you see? Free dates are one click away.</p>
          <ButtonLink href="/en/book" className="group shrink-0">
            Check availability <Arrow />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
