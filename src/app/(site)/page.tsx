import Link from "next/link";
import { siteConfig } from "@/config/site";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { FadeUp, SectionTitle } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { TideReveal } from "@/components/motion/TideReveal";
import { TideWave } from "@/components/motion/TideWave";
import { WordReveal } from "@/components/motion/WordReveal";
import { HeroImmersive } from "@/components/site/HeroImmersive";
import { VisitStory, type VisitScene } from "@/components/site/VisitStory";
import { NearbyMap } from "@/components/site/NearbyMap";
import { PhotoFrame } from "@/components/site/PhotoFrame";
import { EquipmentIcon } from "@/components/site/EquipmentIcon";
import { formatEUR } from "@/lib/dates";
import { getAvailabilityData, getSettings, listPublicPhotos } from "@/lib/db";
import { lowestPrice } from "@/lib/pricing";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, photos, availability] = await Promise.all([getSettings(), listPublicPhotos(), getAvailabilityData()]);
  const fromPrice = lowestPrice(availability);
  const cover = photos.find((p) => p.is_cover) ?? photos[0];

  // Visite immersive : une sélection de photos dans l'ordre d'une vraie visite
  const pick = (file: string) => photos.find((p) => p.url.includes(file));
  const story: [string, string, string, string][] = [
    ["01-salon-sejour", "Le salon", "Vous poussez la porte", "Poutres apparentes, lumière douce et la table ronde qui attend les cartes postales."],
    ["04-coin-repas-cheminee", "Le salon", "Au coin de la cheminée", "Une ancienne cheminée en pierre de Saint-Malo, un fauteuil et la télévision pour les soirs de grain."],
    ["02-salon-canape", "Le salon", "Le canapé-lit", "Deux couchages de plus pour les enfants ou les amis, sans sacrifier le salon."],
    ["09-cuisine-vue-ensemble", "La cuisine", "La cuisine sous le ciel", "Fenêtre de toit, four, lave-vaisselle, lave-linge et toute la vaisselle : on cuisine le poisson du marché."],
    ["07-escalier-chambre", "L'escalier", "On monte…", "Un escalier de bois mène à l'étage, sous la charpente."],
    ["03-chambre-lit", "La chambre", "La chambre sous la charpente", "Lit double, poutres noires et fenêtre de toit pour s'endormir au son des mouettes."],
  ];
  const picked: VisitScene[] = story.flatMap(([file, room, title, text]) => {
    const p = pick(file);
    return p ? [{ url: p.url, room, title, text }] : [];
  });
  const scenes: VisitScene[] = picked.length >= 3 ? picked : photos.slice(0, 6).map((p) => ({ url: p.url, room: p.label.split(",")[0], title: p.label, text: "" }));

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
      <HeroImmersive
        url={cover?.url}
        alt={cover?.label || "Le salon de l'appartement"}
        footer={<TideWave className="absolute inset-x-0 bottom-0 h-[22vh] min-h-32 w-full" />}
      >
        <div className="container-x relative flex flex-1 flex-col justify-end pb-44 pt-28 md:justify-center md:pb-48 md:pt-32">
          <div className="max-w-3xl">
            <FadeUp immediate delay={0.1} y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-phare">
                <span className="h-px w-8 bg-phare" /> Saint-Servan · {siteConfig.location.coordinates}
              </p>
            </FadeUp>
            <WordReveal
              as="h1"
              immediate
              delay={0.25}
              text={settings.hero_title}
              accent={["mer", "marée", "plage"]}
              className="text-[clamp(3.2rem,9vw,8rem)] leading-[0.92] [text-shadow:0_2px_30px_rgba(14,35,56,0.35)] [text-wrap:balance]"
            />
            {/* Visible dès le premier affichage (élément LCP) : seul un léger glissement CSS, sans fondu */}
            <p className="rise mt-8 max-w-xl text-lg text-ecume/85 md:text-xl">{settings.hero_subtitle}</p>
            <FadeUp immediate delay={1.1} className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/reserver" className="group">
                Réserver mes dates <Arrow />
              </ButtonLink>
              <Link href="#visite" className="group inline-flex items-center gap-2 rounded-full border border-ecume/30 px-5 py-3 text-sm font-semibold text-ecume backdrop-blur-sm transition-colors hover:bg-ecume hover:text-marine">
                Visiter l&apos;appartement <Arrow />
              </Link>
            </FadeUp>
          </div>
        </div>

        {/* Pastille prix, comme une bouée */}
        <FadeUp immediate delay={0.9} className="absolute bottom-36 right-5 md:bottom-44 md:right-10">
          <div className="grid h-28 w-28 place-items-center rounded-full border-[6px] border-dashed border-ecume/70 bg-phare text-center text-marine shadow-2xl md:h-36 md:w-36">
            <div>
              <span className="block text-[0.6rem] font-semibold uppercase tracking-widest md:text-[0.7rem]">À partir de</span>
              <span className="block font-serif text-2xl leading-none md:text-4xl">{formatEUR(fromPrice)}</span>
              <span className="text-xs md:text-sm">/ nuit</span>
            </div>
          </div>
        </FadeUp>

      </HeroImmersive>

      {/* ═══ BANDEAU MARITIME ═══ */}
      <div className="overflow-hidden border-y border-marine/10 bg-ecume py-4" aria-hidden>
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {["Saint-Servan", "Plage des Bas-Sablons", "Tour Solidor", "Cité d'Alet", "Marché du mardi et du vendredi", "Intra-Muros", "Grandes marées", "Port Solidor"].map((w) => (
                <span key={w} className="flex items-center gap-6 px-6 font-serif text-2xl italic text-marine/80 md:text-3xl">
                  {w}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-phare-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v14M5 13a7 7 0 0 0 14 0M8 11h8" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ POINTS FORTS ═══ */}
      <section className="bg-ecume py-16 md:py-24" aria-label="Points forts">
        <div className="container-x grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {[
            { big: "4", unit: "voyageurs", text: "lit double + canapé-lit" },
            { big: "250", unit: "m", text: "de la plage des Bas-Sablons, serviette sous le bras" },
            { big: "4", unit: "min", text: "à pied du marché de Saint-Servan" },
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
        <section className="container-x grid items-center gap-12 py-16 md:grid-cols-12 md:py-24">
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

      {/* ═══ VISITE IMMERSIVE ═══ */}
      <section id="visite" className="scroll-mt-0" aria-label="Visite de l'appartement">
        <VisitStory scenes={scenes} />
      </section>
      <div className="bg-marine pb-16 pt-4 text-center md:hidden">
        <Link href="/galerie" className="inline-flex items-center gap-2 rounded-full border border-ecume/30 px-5 py-3 text-sm font-semibold text-ecume">
          Voir toutes les photos <Arrow />
        </Link>
      </div>

      {/* ═══ ÉQUIPEMENTS ═══ */}
      <section className="relative overflow-hidden bg-marine text-ecume" aria-label="Équipements">
        <div aria-hidden className="granite-grain absolute inset-0 opacity-40" />
        <div className="container-x relative grid gap-10 py-16 md:grid-cols-12 md:items-center md:py-20">
          <div className="md:col-span-4">
            <p className="eyebrow mb-4 flex items-center gap-3 text-phare">
              <span className="h-px w-8 bg-phare" /> Équipements
            </p>
            <h2 className="text-3xl md:text-4xl">
              Tout est prêt, <span className="italic text-phare" style={{ fontVariationSettings: '"SOFT" 100' }}>posez les valises</span>
            </h2>
            <p className="mt-4 text-ecume/70">Linge fourni, cuisine complète, canapé-lit : il ne manque que vous.</p>
            <Link href="/logement" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-phare">
              Tout le détail <Arrow />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:col-span-8 md:gap-3 lg:grid-cols-5">
            {equipment.map((e, i) => (
              <FadeUp
                as="li"
                key={e.label}
                delay={(i % 6) * 0.04}
                y={12}
                className="group flex items-center gap-3 rounded-lg bg-ecume/[0.06] px-3.5 py-3 ring-1 ring-ecume/10 transition-colors hover:bg-ecume/[0.12] lg:flex-col lg:items-start lg:gap-3 lg:px-4 lg:py-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-phare/15 text-phare transition-transform duration-500 group-hover:-rotate-6">
                  <EquipmentIcon label={e.label} />
                </span>
                <span className="text-sm leading-snug md:text-[0.95rem]">{e.label}</span>
              </FadeUp>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ DISPONIBILITÉS ═══ */}
      <section id="disponibilites" className="scroll-mt-20 bg-ecume py-16 md:py-24">
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

      {/* ═══ AVIS : affichés seulement quand de vrais avis sont renseignés (src/config/site.ts → reviews) ═══ */}
      {siteConfig.reviews.length > 0 && (
        <section className="bg-sable" aria-label="Avis des voyageurs">
          <div className="container-x py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Avis des voyageurs" title="Ils sont venus, ils ont vu la mer" accent={["mer"]} />
              <p className="font-serif text-2xl">
                <span className="text-phare-2">★</span> {siteConfig.reviewsSummary}
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {siteConfig.reviews.map((r, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <figure className="flex h-full flex-col justify-between rounded-lg bg-ecume p-6 shadow-[0_20px_40px_-28px_rgba(14,35,56,0.5)]">
                    <blockquote className="font-serif text-lg leading-snug">« {r.text} »</blockquote>
                    <figcaption className="mt-5 text-sm text-granite">
                      <strong className="text-marine">{r.name}</strong> · {r.date}
                      {r.source ? ` · ${r.source}` : ""}
                    </figcaption>
                  </figure>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ QUARTIER ═══ */}
      <section id="quartier" className="scroll-mt-20 border-t border-marine/10 bg-ecume py-16 md:py-24">
        <div className="container-x">
          <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
            <SectionTitle eyebrow="À proximité · Saint-Servan" title="Tout se fait à pied" accent={["pied"]} className="md:col-span-7" />
            <FadeUp delay={0.15} className="md:col-span-5">
              <p className="text-lg text-marine/75">
                {siteConfig.location.address}. La plage, le marché, la boulangerie et la tour Solidor : tout est à quelques minutes, la voiture reste au garage.
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.1}>
            <NearbyMap />
          </FadeUp>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <TideReveal className="bg-marine text-ecume">
        <section className="container-x flex flex-col items-start gap-10 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <WordReveal text="La prochaine marée haute vous attend" accent={["marée", "haute"]} className="max-w-3xl text-5xl md:text-7xl" />
          <ButtonLink href="/reserver" className="group shrink-0">
            Voir les dates libres <Arrow />
          </ButtonLink>
        </section>
      </TideReveal>
    </>
  );
}
