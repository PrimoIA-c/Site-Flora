import Link from "next/link";
import { siteConfig } from "@/config/site";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { FadeUp, SectionTitle } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { TideReveal } from "@/components/motion/TideReveal";
import { TideWave } from "@/components/motion/TideWave";
import { WordReveal } from "@/components/motion/WordReveal";
import { HorizontalGallery, type GalleryItem } from "@/components/site/HorizontalGallery";
import { NearbyMap } from "@/components/site/NearbyMap";
import { PhotoFrame, PLACEHOLDER_LABELS } from "@/components/site/PhotoFrame";
import { formatEUR } from "@/lib/dates";
import { getAvailabilityData, getSettings, listPublicPhotos } from "@/lib/db";
import { lowestPrice } from "@/lib/pricing";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, photos, availability] = await Promise.all([getSettings(), listPublicPhotos(), getAvailabilityData()]);
  const fromPrice = lowestPrice(availability);
  const cover = photos.find((p) => p.is_cover) ?? photos[0];

  const gallery: GalleryItem[] = photos.length
    ? photos.map((p) => ({ url: p.url, label: p.label || "Le logement" }))
    : PLACEHOLDER_LABELS.map((label) => ({ url: null, label }));

  const equipment = settings.equipment.filter((e) => e.enabled);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: siteConfig.name,
    description: settings.description,
    address: { "@type": "PostalAddress", addressLocality: siteConfig.location.city, addressRegion: siteConfig.location.region, addressCountry: "FR" },
    geo: { "@type": "GeoCoordinates", latitude: siteConfig.location.lat, longitude: siteConfig.location.lng },
    containsPlace: { "@type": "Accommodation", occupancy: { "@type": "QuantitativeValue", maxValue: siteConfig.capacity.adults + siteConfig.capacity.children } },
    ...(cover ? { image: cover.url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ═══ HERO ═══ */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-marine text-ecume">
        <div className="granite-grain absolute inset-0 -z-10 opacity-40" />
        <div className="container-x relative grid flex-1 items-center gap-10 pb-40 pt-28 md:grid-cols-12 md:pb-48 md:pt-32">
          <div className="md:col-span-7">
            <FadeUp immediate delay={0.1} y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-phare">
                <span className="h-px w-8 bg-phare" /> Saint-Malo · 48°39′ N · 2°01′ O
              </p>
            </FadeUp>
            <WordReveal
              as="h1"
              immediate
              delay={0.25}
              text={settings.hero_title}
              accent={["mer", "marée", "plage"]}
              className="text-[clamp(3rem,8.4vw,7rem)] leading-[0.95] [text-wrap:balance]"
            />
            {/* Visible dès le premier affichage (élément LCP) : seul un léger glissement CSS, sans fondu */}
            <p className="rise mt-8 max-w-xl text-lg text-ecume/75 md:text-xl">{settings.hero_subtitle}</p>
            <FadeUp immediate delay={1.1} className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/reserver" className="group">
                Réserver mes dates <Arrow />
              </ButtonLink>
              <Link href="#disponibilites" className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-ecume/85 hover:text-ecume">
                Voir les disponibilités <Arrow />
              </Link>
            </FadeUp>
          </div>

          <FadeUp immediate delay={0.5} className="relative hidden md:col-span-5 md:block">
            {/* Photo en forme d'arche, comme une porte des remparts */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-t-full border border-ecume/15">
              <PhotoFrame url={cover?.url} label={cover?.label || "Vue"} tone="marine" arch priority sizes="400px" className="h-full w-full" />
            </div>
            <div className="absolute -bottom-6 -left-4 rounded-full bg-phare px-6 py-4 text-marine shadow-xl">
              <span className="block text-[0.7rem] font-semibold uppercase tracking-widest">À partir de</span>
              <span className="font-serif text-3xl">{formatEUR(fromPrice)}</span>
              <span className="text-sm"> / nuit</span>
            </div>
          </FadeUp>
        </div>

        <p className="container-x absolute inset-x-0 bottom-28 z-10 text-sm text-ecume/70 md:hidden">
          À partir de <strong className="font-serif text-2xl text-phare">{formatEUR(fromPrice)}</strong> / nuit
        </p>
        <TideWave className="absolute inset-x-0 bottom-0 h-[22vh] min-h-32 w-full" />
      </section>

      {/* ═══ POINTS FORTS ═══ */}
      <section className="bg-ecume py-16 md:py-24" aria-label="Points forts">
        <div className="container-x grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {[
            { big: "4", unit: "voyageurs", text: "2 adultes + 2 enfants" },
            { big: "100", unit: "m", text: "de la plage, serviette sous le bras" },
            { big: "200", unit: "m", text: "du marché et de ses étals de la mer" },
            { big: "0", unit: "voiture", text: "commerces, remparts et restaurants à pied" },
          ].map((f, i) => (
            <FadeUp key={f.text} delay={i * 0.08} className="border-l border-marine/15 px-5 md:px-8">
              <p className="font-serif text-6xl md:text-7xl">
                {f.big}
                <span className="ml-1 font-sans text-base font-semibold text-granite">{f.unit}</span>
              </p>
              <p className="mt-3 max-w-[14rem] text-sm text-marine/75">{f.text}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <TideReveal className="bg-sable-2">
        <section className="container-x grid items-center gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-6">
            <SectionTitle eyebrow="Le logement" title="Une maison de vacances, version appartement" accent={["vacances,"]} />
            <FadeUp delay={0.2}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-marine/80">{settings.description}</p>
              <Link href="/logement" className="group mt-8 inline-flex items-center gap-2 font-semibold">
                Visiter pièce par pièce <Arrow />
              </Link>
            </FadeUp>
          </div>
          <div className="relative grid grid-cols-2 gap-4 pb-10 md:col-span-6 md:gap-6">
            {/* Aplat marine décalé + lignes de marée : donne du relief aux photos */}
            <div aria-hidden className="absolute -right-3 bottom-0 left-1/4 top-16 rounded-sm bg-marine md:-right-10">
              <div className="granite-grain absolute inset-0 opacity-50" />
              <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="absolute bottom-4 right-4 h-10 w-1/2 text-phare opacity-50">
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M0 ${14 + i * 14} C 40 ${4 + i * 14}, 60 ${24 + i * 14}, 100 ${14 + i * 14} S 160 ${4 + i * 14}, 200 ${14 + i * 14}`} fill="none" stroke="currentColor" strokeWidth="1" />
                ))}
              </svg>
            </div>
            <FadeUp className="relative z-10 translate-y-8">
              <div className="border-[6px] border-ecume bg-ecume shadow-[0_30px_60px_-22px_rgba(14,35,56,0.55)] md:border-8">
                <PhotoFrame url={photos[1]?.url} label={photos[1]?.label || "Salon"} className="aspect-[3/4]" sizes="(min-width:768px) 25vw, 45vw" />
              </div>
            </FadeUp>
            <FadeUp delay={0.15} className="relative z-10 -rotate-1">
              <div className="border-[6px] border-ecume bg-ecume shadow-[0_30px_60px_-22px_rgba(14,35,56,0.55)] md:border-8">
                <PhotoFrame url={photos[2]?.url} label={photos[2]?.label || "Chambre"} className="aspect-[3/4]" sizes="(min-width:768px) 25vw, 45vw" />
              </div>
            </FadeUp>
          </div>
        </section>
      </TideReveal>

      {/* ═══ GALERIE ═══ */}
      <section id="galerie" className="bg-ecume pt-24 md:pt-32" aria-label="Galerie photos">
        <div className="container-x mb-10 md:mb-0">
          <SectionTitle eyebrow="Galerie" title="Entrez, posez les valises" accent={["valises"]} />
        </div>
        <HorizontalGallery items={gallery} />
      </section>

      {/* ═══ ÉQUIPEMENTS ═══ */}
      <TideReveal className="bg-marine text-ecume">
        <section className="container-x grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5">
            <SectionTitle eyebrow="Équipements" title="Tout est prêt, même le seau et la pelle" accent={["pelle"]} dark />
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2 md:col-span-7">
            {equipment.map((e, i) => (
              <FadeUp as="li" key={e.label} delay={(i % 6) * 0.05} className="flex items-center gap-4 border-b border-ecume/10 py-4">
                  <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-phare">
                    <path d="M2 10 C 5 6, 8 14, 11 10 S 16 6, 18 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {e.label}
              </FadeUp>
            ))}
          </ul>
        </section>
      </TideReveal>

      {/* ═══ DISPONIBILITÉS ═══ */}
      <section id="disponibilites" className="scroll-mt-20 bg-ecume py-24 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionTitle eyebrow="Disponibilités" title="Choisissez votre marée" accent={["marée"]} />
            <FadeUp delay={0.2} className="mt-8 space-y-6">
              <p className="text-marine/75">
                Les dates hachurées sont déjà prises. Le calendrier est mis à jour en temps réel, et le paiement bloque vos dates immédiatement.
              </p>
              <div className="border-y border-marine/15 py-5">
                <p className="text-sm text-granite">À partir de</p>
                <p className="font-serif text-5xl">
                  {formatEUR(fromPrice)} <span className="font-sans text-base text-granite">/ nuit</span>
                </p>
                <p className="mt-2 text-sm text-granite">Séjour minimum : {settings.min_nights} nuits · ménage en option</p>
              </div>
              <ButtonLink href="/reserver" className="group">
                Réserver <Arrow />
              </ButtonLink>
            </FadeUp>
          </div>
          <FadeUp delay={0.1} className="rounded-lg bg-white p-5 shadow-[0_30px_60px_-30px_rgba(14,35,56,0.25)] md:col-span-8 md:p-8">
            <AvailabilityCalendar unavailable={availability.unavailable} />
          </FadeUp>
        </div>
      </section>

      {/* ═══ AVIS (emplacements) ═══ */}
      <TideReveal className="bg-sable">
        <section className="container-x py-24 md:py-32" aria-label="Avis des voyageurs">
          <SectionTitle eyebrow="Avis des voyageurs" title="Ils sont venus, ils ont vu la mer" accent={["mer"]} />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <figure className="flex h-full flex-col justify-between rounded-sm border border-dashed border-marine/30 bg-ecume/60 p-7">
                  <div>
                    <p aria-hidden className="text-phare-2">★★★★★</p>
                    <blockquote className="mt-4 font-serif text-xl leading-snug text-marine/70">
                      [À COMPLÉTER] Emplacement réservé à un avis voyageur réel.
                    </blockquote>
                  </div>
                  <figcaption className="mt-6 text-sm text-granite">[Prénom] · [Mois, année du séjour]</figcaption>
                </figure>
              </FadeUp>
            ))}
          </div>
        </section>
      </TideReveal>

      {/* ═══ QUARTIER ═══ */}
      <section id="quartier" className="scroll-mt-20 bg-ecume py-24 md:py-32">
        <div className="container-x grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionTitle eyebrow="À proximité" title="Tout se fait à pied" accent={["pied"]} />
            <ul className="mt-10">
              {siteConfig.nearby.map((n, i) => (
                <FadeUp as="li" key={n.label} delay={i * 0.08} className="flex items-baseline justify-between border-b border-marine/15 py-4">
                    <span className="font-serif text-2xl">{n.label}</span>
                    <span className="text-sm text-granite">
                      <strong className="text-marine">{n.distance}</strong> · {n.minutes}
                    </span>
                </FadeUp>
              ))}
            </ul>
            <FadeUp delay={0.3}>
              <a
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold"
                href={`https://www.openstreetmap.org/?mlat=${siteConfig.location.lat}&mlon=${siteConfig.location.lng}#map=16/${siteConfig.location.lat}/${siteConfig.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir le plan de Saint-Malo <Arrow />
              </a>
            </FadeUp>
          </div>
          <FadeUp delay={0.1} className="overflow-hidden rounded-lg bg-sable-2 md:col-span-7">
            <NearbyMap />
          </FadeUp>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <TideReveal className="bg-marine text-ecume">
        <section className="container-x flex flex-col items-start gap-10 py-24 md:flex-row md:items-end md:justify-between md:py-32">
          <WordReveal text="La prochaine marée haute vous attend" accent={["marée", "haute"]} className="max-w-3xl text-5xl md:text-7xl" />
          <ButtonLink href="/reserver" className="group shrink-0">
            Voir les dates libres <Arrow />
          </ButtonLink>
        </section>
      </TideReveal>
    </>
  );
}
