/**
 * Calcul du prix d'un séjour — fonction PURE partagée client / serveur.
 * Le serveur recalcule toujours le montant avant de créer le paiement :
 * le total affiché côté client n'est qu'un aperçu.
 */
import { siteConfig } from "@/config/site";
import { diffDays, nightsBetween, todayParis } from "./dates";
import type { AvailabilityData, PricingPeriod } from "./types";

export interface QuoteInput {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  withCleaning: boolean;
}

export interface NightPrice {
  date: string;
  price: number;
  label: string | null;
}

export interface Quote {
  nights: number;
  perNight: NightPrice[];
  accommodation: number;
  cleaning: number;
  touristTax: number;
  total: number;
  minNights: number;
}

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Période tarifaire applicable à une nuit (la plus récente l'emporte en cas de chevauchement). */
export function periodFor(date: string, periods: PricingPeriod[]): PricingPeriod | null {
  let match: PricingPeriod | null = null;
  for (const p of periods) {
    if (date >= p.start_date && date <= p.end_date) match = p;
  }
  return match;
}

export function nightPrice(date: string, data: Pick<AvailabilityData, "settings" | "periods">): NightPrice {
  const p = periodFor(date, data.periods);
  return p
    ? { date, price: Number(p.price_per_night), label: p.label }
    : { date, price: Number(data.settings.base_price), label: null };
}

/** Durée minimale applicable pour une arrivée à cette date. */
export function minNightsFor(checkIn: string, data: Pick<AvailabilityData, "settings" | "periods">): number {
  const p = periodFor(checkIn, data.periods);
  return Math.max(1, p?.min_nights ?? data.settings.min_nights);
}

/** Prix le plus bas affichable (« à partir de »). */
export function lowestPrice(data: Pick<AvailabilityData, "settings" | "periods">): number {
  return Math.min(Number(data.settings.base_price), ...data.periods.map((p) => Number(p.price_per_night)));
}

export function computeQuote(input: QuoteInput, data: AvailabilityData): QuoteResult {
  const { checkIn, checkOut, adults, children, withCleaning } = input;
  const { capacity } = siteConfig;

  if (!checkIn || !checkOut || checkOut <= checkIn) return { ok: false, error: "Choisissez vos dates d'arrivée et de départ." };
  if (checkIn < todayParis()) return { ok: false, error: "La date d'arrivée est déjà passée." };
  if (!Number.isInteger(adults) || adults < 1 || adults > capacity.adults)
    return { ok: false, error: `Le logement accueille de 1 à ${capacity.adults} adultes.` };
  if (!Number.isInteger(children) || children < 0 || children > capacity.children)
    return { ok: false, error: `Le logement accueille jusqu'à ${capacity.children} enfants.` };

  const nights = diffDays(checkIn, checkOut);
  const minNights = minNightsFor(checkIn, data);
  if (nights < minNights) return { ok: false, error: `Séjour minimum : ${minNights} nuits pour ces dates.` };
  if (nights > 60) return { ok: false, error: "Pour un séjour de plus de 60 nuits, contactez-nous." };

  const unavailable = new Set(data.unavailable);
  const list = nightsBetween(checkIn, checkOut);
  if (list.some((n) => unavailable.has(n))) return { ok: false, error: "Certaines nuits de ce séjour ne sont plus disponibles." };

  const perNight = list.map((d) => nightPrice(d, data));
  const accommodation = round2(perNight.reduce((s, n) => s + n.price, 0));
  const cleaning = withCleaning ? round2(Number(data.settings.cleaning_fee)) : 0;
  // Taxe de séjour : par adulte et par nuit (les mineurs en sont exonérés).
  const touristTax = round2(Number(data.settings.tourist_tax_per_adult_night) * adults * nights);
  const total = round2(accommodation + cleaning + touristTax);

  return { ok: true, quote: { nights, perNight, accommodation, cleaning, touristTax, total, minNights } };
}
