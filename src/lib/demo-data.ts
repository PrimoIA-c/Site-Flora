/**
 * Données de démonstration EN MÉMOIRE.
 * Utilisées automatiquement quand Supabase n'est pas configuré (pas de variables d'environnement),
 * pour pouvoir visiter le site et l'admin immédiatement. Les modifications sont perdues au redémarrage.
 * Les mêmes données existent en SQL dans supabase/seed.sql.
 */
import { addDays, todayParis } from "./dates";
import { defaultSettings } from "./defaults";
import type { BlockedDate, Booking, Photo, PricingPeriod, Settings } from "./types";

export interface DemoStore {
  settings: Settings;
  bookings: Booking[];
  blocked: BlockedDate[];
  periods: PricingPeriod[];
  photos: Photo[];
}

function demoBooking(
  id: string,
  offsetIn: number,
  nights: number,
  guest: { name: string; email: string; phone: string },
  status: Booking["status"],
  adults = 2,
  children = 2,
): Booking {
  const t = todayParis();
  const check_in = addDays(t, offsetIn);
  const accommodation_total = 90 * nights;
  const cleaning_fee = 50;
  const tourist_tax = 2 * adults * nights;
  return {
    id,
    created_at: new Date(Date.now() - (30 - offsetIn) * 86_400_000).toISOString(),
    check_in,
    check_out: addDays(check_in, nights),
    adults,
    children,
    guest_name: guest.name,
    guest_email: guest.email,
    guest_phone: guest.phone,
    message: null,
    nights,
    accommodation_total,
    cleaning_fee,
    tourist_tax,
    total: accommodation_total + cleaning_fee + tourist_tax,
    status,
    expires_at: null,
    stripe_session_id: null,
    stripe_payment_intent: null,
    paid_at: status === "paid" ? new Date().toISOString() : null,
    cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
    cancel_reason: status === "cancelled" ? "Annulée par le client" : null,
    source: "site",
  };
}

function createDemoStore(): DemoStore {
  const t = todayParis();
  const year = Number(t.slice(0, 4));
  return {
    settings: defaultSettings(),
    bookings: [
      demoBooking("demo-0001", -40, 5, { name: "Claire Martin", email: "claire@example.com", phone: "06 12 34 56 78" }, "paid"),
      demoBooking("demo-0002", -12, 3, { name: "Yann Le Goff", email: "yann@example.com", phone: "06 98 76 54 32" }, "paid", 2, 1),
      demoBooking("demo-0003", 6, 4, { name: "Sophie Durand", email: "sophie@example.com", phone: "07 11 22 33 44" }, "paid"),
      demoBooking("demo-0004", 18, 7, { name: "Thomas Bernard", email: "thomas@example.com", phone: "06 55 44 33 22" }, "paid", 2, 2),
      demoBooking("demo-0005", 30, 3, { name: "Julie Petit", email: "julie@example.com", phone: "06 01 02 03 04" }, "cancelled", 1, 0),
      demoBooking("demo-0006", 45, 5, { name: "Marc Leroy", email: "marc@example.com", phone: "06 77 88 99 00" }, "paid", 2, 0),
    ],
    blocked: [11, 12, 13, 26, 27].map((o, i) => ({
      id: `demo-block-${i}`,
      date: addDays(t, o),
      reason: i < 3 ? "Famille" : "Location hors site",
      source: "manual" as const,
      feed_url: null,
    })),
    periods: [
      {
        id: "demo-period-1",
        label: "Haute saison",
        start_date: `${year + 1}-07-01`,
        end_date: `${year + 1}-08-31`,
        price_per_night: 140,
        min_nights: 7,
      },
      {
        id: "demo-period-2",
        label: "Vacances de la Toussaint",
        start_date: `${year}-10-17`,
        end_date: `${year}-11-02`,
        price_per_night: 105,
        min_nights: 3,
      },
    ],
    photos: [],
  };
}

// Conservé sur globalThis pour survivre au rechargement à chaud en développement.
const g = globalThis as unknown as { __demoStore?: DemoStore };
export function demoStore(): DemoStore {
  if (!g.__demoStore) g.__demoStore = createDemoStore();
  return g.__demoStore;
}
