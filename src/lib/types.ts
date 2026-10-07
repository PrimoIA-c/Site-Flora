/** Types partagés (miroir des tables Supabase). Les dates sont au format "YYYY-MM-DD". */

export type BookingStatus = "pending" | "paid" | "cancelled";

export interface Booking {
  id: string;
  created_at: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  message: string | null;
  nights: number;
  accommodation_total: number;
  cleaning_fee: number;
  tourist_tax: number;
  total: number;
  status: BookingStatus;
  expires_at: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  source: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  source: "manual" | "ical";
  feed_url: string | null;
}

export interface PricingPeriod {
  id: string;
  label: string;
  start_date: string;
  end_date: string; // inclus
  price_per_night: number;
  min_nights: number | null;
}

export interface Photo {
  id: string;
  storage_path: string;
  url: string;
  label: string;
  position: number;
  is_cover: boolean;
}

export interface Room {
  name: string;
  text: string;
}

export interface Equipment {
  label: string;
  enabled: boolean;
}

export interface Settings {
  base_price: number;
  cleaning_fee: number;
  min_nights: number;
  tourist_tax_per_adult_night: number;
  alert_email: string | null;
  hero_title: string;
  hero_subtitle: string;
  description: string;
  rooms: Room[];
  equipment: Equipment[];
  house_rules: string[];
  ical_import_urls: string[];
  ical_last_sync: string | null;
}

/** Données publiques nécessaires au calendrier et au calcul de prix côté client. */
export interface AvailabilityData {
  unavailable: string[]; // nuits indisponibles
  settings: Pick<Settings, "base_price" | "cleaning_fee" | "min_nights" | "tourist_tax_per_adult_night">;
  periods: PricingPeriod[];
}
