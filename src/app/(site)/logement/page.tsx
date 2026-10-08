import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { FadeUp, SectionTitle } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { TideReveal } from "@/components/motion/TideReveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { RoomPhotos } from "@/components/site/RoomPhotos";
import { formatEUR } from "@/lib/dates";
import { getAvailabilityData, getSettings, listPublicPhotos } from "@/lib/db";
import { lowestPrice } from "@/lib/pricing";
import type { Photo } from "@/lib/types";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Le logement",
  description: "Un salon sous poutres, une chambre mansardée, une cuisine équipée : découvrez l'appartement pièce par pièce, ses équipements et son règlement intérieur.",
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(le|la|les|l')\s*/, "");

/** Associe à chaque pièce la photo dont le libellé correspond (ex. « Chambre 1 »). */
function photoForRoom(room: string, photos: Photo[]) {
  const key = norm(room);
  return photos.find((p) => norm(p.label) === key) ?? photos.find((p) => key.includes(norm(p.label)) && p.label.length > 2);
}

/** Photo secondaire : la première dont la légende commence par le nom de la pièce (ex. « La chambre, côté rangements »). */
function extraPhotoForRoom(room: string, photos: Photo[], main?: Photo) {
  const key = norm(room);
  return photos.find((p) => p.id !== main?.id && norm(p.label).startsWith(key + ","));
}

export default async function LogementPage() {
  const [settings, photos, availability] = await Promise.all([getSettings(), listPublicPhotos(), getAvailabilityData()]);
  const { capacity, defaults } = siteConfig;

  return (
    <>
      <section className="bg-ecume pb-16 pt-32 md:pb-24 md:pt-44">
        <div className="container-x grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <FadeUp immediate y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-granite">
                <span className="h-px w-8 bg-granite" /> Le logement
              </p>
            </FadeUp>
            <WordReveal as="h1" immediate delay={0.15} text="Pensé pour une famille, à deux pas du sable" accent={["famille,", "sable"]} className="text-5xl md:text-7xl" />
          </div>
          <p className="rise self-end text-lg text-marine/80 md:col-span-4">{settings.description}</p>
        </div>

        <FadeUp immediate delay={0.5} className="container-x mt-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-marine/15 md:grid-cols-4">
            {[
              ["Capacité", `${capacity.adults} adultes + ${capacity.children} enfants`],
              ["Couchages", "1 lit double + 1 canapé-lit"],
              ["Arrivée / départ", `${defaults.checkInTime} / ${defaults.checkOutTime}`],
              ["Tarif", `dès ${formatEUR(lowestPrice(availability))} / nuit`],
            ].map(([k, v]) => (
              <div key={k} className="bg-ecume p-5">
                <dt className="text-xs uppercase tracking-widest text-granite">{k}</dt>
                <dd className="mt-2 font-serif text-xl">{v}</dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </section>

      {/* Pièces */}
      <section className="bg-ecume pb-24" aria-label="Les pièces">
        <div className="container-x space-y-24 md:space-y-40">
          {settings.rooms.map((room, i) => {
            const photo = photoForRoom(room.name, photos);
            const reverse = i % 2 === 1;
            return (
              <article key={room.name} className="grid items-center gap-8 md:grid-cols-12 md:gap-16">
                <FadeUp className={`md:col-span-7 ${reverse ? "md:order-2" : ""}`}>
                  <RoomPhotos
                    main={photo}
                    extra={extraPhotoForRoom(room.name, photos, photo)}
                    fallbackLabel={room.name.replace(/^(Le|La|L')\s*/i, "").replace(/^./, (c) => c.toUpperCase())}
                    index={i}
                    reverse={reverse}
                  />
                </FadeUp>
                <div className={`md:col-span-5 ${reverse ? "md:order-1" : ""}`}>
                  <FadeUp>
                    <p className="font-serif text-lg text-granite">{String(i + 1).padStart(2, "0")}</p>
                  </FadeUp>
                  <WordReveal as="h2" text={room.name} className="mt-2 text-4xl md:text-5xl" />
                  <FadeUp delay={0.2}>
                    <p className="mt-6 text-lg leading-relaxed text-marine/80">{room.text}</p>
                  </FadeUp>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Équipements */}
      <TideReveal className="bg-sable-2">
        <section className="container-x grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-4">
            <SectionTitle eyebrow="Équipements" title="Ce que vous trouverez" accent={["trouverez"]} />
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2 md:col-span-8">
            {settings.equipment.map((e) => (
              <li key={e.label} className={`flex items-center gap-4 border-b border-marine/10 py-4 ${e.enabled ? "" : "text-marine/70 line-through decoration-marine/30"}`}>
                <span
                  aria-hidden
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border ${e.enabled ? "border-marine bg-marine text-phare" : "border-marine/30"}`}
                >
                  {e.enabled && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3">
                      <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span>
                  {e.label}
                  <span className="sr-only">{e.enabled ? " : disponible" : " : non disponible"}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </TideReveal>

      {/* Règlement intérieur */}
      <section className="bg-ecume py-24 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionTitle eyebrow="Règlement intérieur" title="Quelques règles de bon voisinage" accent={["voisinage"]} />
          </div>
          <ol className="md:col-span-8">
            {settings.house_rules.map((r, i) => (
              <FadeUp as="li" key={r} delay={i * 0.05} className="flex gap-6 border-b border-marine/15 py-5">
                <span className="font-serif text-2xl text-granite">{String(i + 1).padStart(2, "0")}</span>
                <span className="pt-1.5 text-lg">{r}</span>
              </FadeUp>
            ))}
          </ol>
        </div>
      </section>

      <TideReveal className="bg-marine text-ecume">
        <section className="container-x flex flex-col gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-4xl md:text-5xl">Prêts à sentir l&apos;iode&nbsp;?</p>
          <ButtonLink href="/reserver" className="group">
            Voir les disponibilités <Arrow />
          </ButtonLink>
        </section>
      </TideReveal>
    </>
  );
}
