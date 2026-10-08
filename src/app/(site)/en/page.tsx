import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { FAQ_EN } from "@/config/faq";
import { FadeUp, SectionTitle } from "@/components/motion/FadeUp";
import { Arrow, ButtonLink } from "@/components/motion/Ripple";
import { TideWave } from "@/components/motion/TideWave";
import { WordReveal } from "@/components/motion/WordReveal";
import { DirectPerks } from "@/components/site/DirectPerks";
import { EquipmentIcon } from "@/components/site/EquipmentIcon";
import { FaqList } from "@/components/site/FaqList";
import { HeroImmersive } from "@/components/site/HeroImmersive";
import { HeroTicket, TideLine } from "@/components/site/HeroTicket";
import { NearbyMap } from "@/components/site/NearbyMap";
import { VisitStory, type VisitScene } from "@/components/site/VisitStory";
import { getAvailabilityData, getSettings, listPublicPhotos } from "@/lib/db";
import { lowestPrice } from "@/lib/pricing";
import { getTides } from "@/lib/tides";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Holiday apartment in Saint-Malo — 4 min from the ferry terminal",
  description:
    "Characterful apartment for 4 in Saint-Servan, Saint-Malo: 4 minutes' walk from the ferry terminal and the Bas-Sablons beach. Real-time availability and secure direct booking.",
  alternates: { languages: { fr: "/", en: "/en" } },
};

/** Libellés d'équipement en anglais (la clé française sert aussi à choisir le pictogramme). */
const EQUIP_EN: Record<string, string> = {
  "Wi-Fi": "Wi-Fi",
  "Cuisine équipée": "Fully equipped kitchen",
  Four: "Oven",
  "Lave-vaisselle": "Dishwasher",
  "Lave-linge": "Washing machine",
  "Vaisselle complète": "Crockery & cutlery",
  "Canapé-lit 2 places": "Double sofa bed",
  "Linge de maison": "Bed linen & towels",
  Télévision: "TV",
  "Fer à repasser": "Iron",
};

const ROOMS_EN = [
  { name: "The living room", text: "Exposed beams, a sofa bed for two extra guests, an armchair, TV, a round table for four and an old stone fireplace." },
  { name: "The bedroom", text: "Upstairs via a wooden staircase: an attic bedroom under the timber roof, double bed, chest of drawers, hanging space and a roof window." },
  { name: "The kitchen", text: "Under a roof window: hob, oven, dishwasher, washing machine, kettle, toaster and all the crockery you need." },
  { name: "The shower room", text: "Shower cabin, vanity unit with lit mirror, toilet, towels provided." },
];

export default async function EnglishPage() {
  const [settings, photos, availability, tides] = await Promise.all([getSettings(), listPublicPhotos(), getAvailabilityData(), getTides()]);
  const price = lowestPrice(availability);
  const cover = photos.find((p) => p.is_cover) ?? photos[0];
  const pick = (file: string) => photos.find((p) => p.url.includes(file));
  const story: [string, string, string, string][] = [
    ["01-salon-sejour", "Living room", "Step inside", "Exposed beams, soft light and a round table waiting for your postcards."],
    ["04-coin-repas-cheminee", "Living room", "By the fireplace", "An old Saint-Malo stone fireplace, an armchair and the TV for rainy evenings."],
    ["02-salon-canape", "Living room", "The sofa bed", "Two extra beds for children or friends, without losing the living room."],
    ["09-cuisine-vue-ensemble", "Kitchen", "A kitchen under the sky", "Roof window, oven, dishwasher, washing machine and all the crockery: cook your catch from the market."],
    ["07-escalier-chambre", "Staircase", "Up we go…", "A wooden staircase leads upstairs, under the roof."],
    ["03-chambre-lit", "Bedroom", "The attic bedroom", "Double bed, dark beams and a roof window to fall asleep to the seagulls."],
  ];
  const scenes: VisitScene[] = story.flatMap(([file, room, title, text]) => {
    const p = pick(file);
    return p ? [{ url: p.url, room, title, text }] : [];
  });
  const equipment = settings.equipment.filter((e) => e.enabled);

  return (
    <div lang="en">
      <HeroImmersive url={cover?.url} alt="The living room of the apartment" footer={<TideWave className="absolute inset-x-0 bottom-0 h-[22vh] min-h-32 w-full" />}>
        <div className="container-x relative flex flex-1 flex-col justify-end pb-44 pt-28 md:justify-center md:pb-48 md:pt-32">
          <div className="max-w-3xl">
            <FadeUp immediate delay={0.1} y={10}>
              <p className="eyebrow mb-6 flex items-center gap-3 text-phare">
                <span className="h-px w-8 bg-phare" /> Saint-Servan · {siteConfig.location.coordinates.replace(" O", " W")}
              </p>
            </FadeUp>
            <WordReveal
              as="h1"
              immediate
              delay={0.25}
              text="The sea at the end of the street"
              accent={["sea"]}
              className="text-[clamp(3.2rem,9vw,8rem)] leading-[0.92] [text-shadow:0_2px_30px_rgba(14,35,56,0.35)] [text-wrap:balance]"
            />
            <p className="rise mt-8 max-w-xl text-lg text-ecume/85 md:text-xl">
              A characterful apartment for four in Saint-Servan, 4 minutes&apos; walk from the ferry terminal and the Bas-Sablons beach. Book directly, no service fees.
            </p>
            <div className="lg:hidden">
              <TideLine tides={tides} lang="en" />
            </div>
            <FadeUp immediate delay={1.1} className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/en/book" className="group">
                Check availability <Arrow />
              </ButtonLink>
              <Link href="#visit" className="group inline-flex items-center gap-2 rounded-full border border-ecume/30 px-5 py-3 text-sm font-semibold text-ecume backdrop-blur-sm transition-colors hover:bg-ecume hover:text-marine">
                Take the tour <Arrow />
              </Link>
            </FadeUp>
          </div>
        </div>
        <FadeUp immediate delay={0.9} className="absolute bottom-40 right-10 hidden lg:block">
          <HeroTicket price={price} tides={tides} lang="en" />
        </FadeUp>
      </HeroImmersive>

      {/* Key facts */}
      <section className="bg-ecume py-14 md:py-20" aria-label="Key facts">
        <div className="container-x grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {[
            { big: "4", unit: "guests", text: "double bed + sofa bed" },
            { big: "4", unit: "min", text: "walk to the Naye ferry terminal" },
            { big: "250", unit: "m", text: "to the Bas-Sablons beach" },
            { big: "0", unit: "car", text: "needed: market, shops & restaurants on foot" },
          ].map((f) => (
            <div key={f.text} className="border-l border-marine/15 px-5 md:px-8">
              <p className="font-serif text-6xl md:text-7xl">
                {f.big}
                <span className="ml-1 font-sans text-base font-semibold text-granite">{f.unit}</span>
              </p>
              <p className="mt-3 max-w-[14rem] text-sm text-marine/75">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="visit" aria-label="Tour of the apartment">
        <VisitStory scenes={scenes} />
      </section>

      {/* Rooms & equipment */}
      <section id="apartment" className="scroll-mt-20 bg-ecume py-16 md:py-24">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionTitle eyebrow="The apartment" title="Built for a family, a stroll from the sand" accent={["sand"]} />
            <ul className="mt-8 space-y-5">
              {ROOMS_EN.map((r) => (
                <li key={r.name} className="border-b border-marine/10 pb-5">
                  <h3 className="text-2xl">{r.name}</h3>
                  <p className="mt-1 text-marine/75">{r.text}</p>
                </li>
              ))}
            </ul>
            <Link href="/en/gallery" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              See all photos <Arrow />
            </Link>
          </div>
          <div className="md:col-span-7">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3">
              {equipment.map((e) => (
                <li key={e.label} className="flex items-center gap-3 rounded-lg bg-white/70 px-3.5 py-3 ring-1 ring-marine/10">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-marine text-phare">
                    <EquipmentIcon label={e.label} />
                  </span>
                  <span className="text-sm leading-snug">{EQUIP_EN[e.label] ?? e.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <DirectPerks lang="en" compact />
            </div>
          </div>
        </div>
      </section>

      {/* Neighbourhood */}
      <section id="location" className="scroll-mt-20 border-t border-marine/10 bg-ecume py-16 md:py-24">
        <div className="container-x">
          <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
            <SectionTitle eyebrow="Location · Saint-Servan" title="Everything on foot" accent={["foot"]} className="md:col-span-7" />
            <p className="text-lg text-marine/75 md:col-span-5">
              {siteConfig.location.address}. Beach, market, bakeries, the Solidor tower and the ferry terminal are all a few minutes away.
            </p>
          </div>
          <NearbyMap lang="en" />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-sable-2 py-16 md:py-24">
        <div className="container-x">
          <SectionTitle eyebrow="Good to know" title="Practical information" accent={["information"]} className="mb-10" />
          <FaqList groups={FAQ_EN} />
        </div>
      </section>

      <section className="bg-marine text-ecume">
        <div className="container-x flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <p className="max-w-2xl font-serif text-4xl md:text-6xl">The next high tide is waiting for you</p>
            <p className="mt-3 text-sm text-ecume/70">Direct booking, no service fees, secure payment by Stripe.</p>
          </div>
          <ButtonLink href="/en/book" className="group shrink-0">
            Check availability <Arrow />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
