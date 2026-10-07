/**
 * Couche d'accès aux données.
 * - Si Supabase est configuré (variables d'environnement), tout passe par Supabase avec la clé service_role
 *   (côté serveur uniquement : ce module importe "server-only").
 * - Sinon, bascule sur un magasin de démonstration en mémoire (voir demo-data.ts).
 * Toutes les pages et routes passent par ces fonctions : pour changer de base, c'est ici.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
import { addDays, nightsBetween, todayParis } from "./dates";
import { defaultSettings } from "./defaults";
import { demoStore } from "./demo-data";
import { defaultPhotos } from "./default-photos";
import type { AvailabilityData, BlockedDate, Booking, Photo, PricingPeriod, Settings } from "./types";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
export const isDemoMode = !isSupabaseConfigured;

let _client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!_client) {
    _client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`[db] ${context} : ${error?.message ?? "erreur inconnue"}`);
}

// Supabase renvoie les colonnes numeric sous forme de chaînes : on normalise.
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

function mapBooking(r: Record<string, unknown>): Booking {
  return {
    ...(r as unknown as Booking),
    accommodation_total: num(r.accommodation_total),
    cleaning_fee: num(r.cleaning_fee),
    tourist_tax: num(r.tourist_tax),
    total: num(r.total),
  };
}

const uid = () => crypto.randomUUID();

// ═════════════════════════ PARAMÈTRES ═════════════════════════

export async function getSettings(): Promise<Settings> {
  const defaults = defaultSettings();
  if (isDemoMode) return demoStore().settings;
  const { data, error } = await db().from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) fail("lecture des paramètres", error);
  if (!data) return defaults;
  // Tout champ texte/liste vide retombe sur la valeur par défaut.
  const pick = <T,>(v: T, d: T) => (v === null || v === "" || (Array.isArray(v) && v.length === 0) ? d : v);
  return {
    base_price: num(data.base_price),
    cleaning_fee: num(data.cleaning_fee),
    min_nights: num(data.min_nights),
    tourist_tax_per_adult_night: num(data.tourist_tax_per_adult_night),
    alert_email: data.alert_email || defaults.alert_email,
    hero_title: pick(data.hero_title, defaults.hero_title),
    hero_subtitle: pick(data.hero_subtitle, defaults.hero_subtitle),
    description: pick(data.description, defaults.description),
    rooms: pick(data.rooms, defaults.rooms),
    equipment: pick(data.equipment, defaults.equipment),
    house_rules: pick(data.house_rules, defaults.house_rules),
    ical_import_urls: data.ical_import_urls ?? [],
    ical_last_sync: data.ical_last_sync,
  };
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  if (isDemoMode) {
    Object.assign(demoStore().settings, patch);
    return;
  }
  const { error } = await db()
    .from("settings")
    .upsert({ id: 1, ...patch, updated_at: new Date().toISOString() });
  if (error) fail("mise à jour des paramètres", error);
}

// ═════════════════════════ TARIFS PAR PÉRIODE ═════════════════════════

export async function listPeriods(): Promise<PricingPeriod[]> {
  if (isDemoMode) return [...demoStore().periods].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const { data, error } = await db().from("pricing").select("*").order("start_date");
  if (error) fail("lecture des tarifs", error);
  return (data ?? []).map((p) => ({ ...p, price_per_night: num(p.price_per_night) }));
}

export async function createPeriod(p: Omit<PricingPeriod, "id">): Promise<void> {
  if (isDemoMode) {
    demoStore().periods.push({ ...p, id: uid() });
    return;
  }
  const { error } = await db().from("pricing").insert(p);
  if (error) fail("création d'un tarif", error);
}

export async function deletePeriod(id: string): Promise<void> {
  if (isDemoMode) {
    const s = demoStore();
    s.periods = s.periods.filter((p) => p.id !== id);
    return;
  }
  const { error } = await db().from("pricing").delete().eq("id", id);
  if (error) fail("suppression d'un tarif", error);
}

// ═════════════════════════ PHOTOS ═════════════════════════

export async function listPhotos(): Promise<Photo[]> {
  if (isDemoMode) return [...demoStore().photos].sort((a, b) => a.position - b.position);
  const { data, error } = await db().from("photos").select("*").order("position");
  if (error) fail("lecture des photos", error);
  return data ?? [];
}

/** Photos affichées sur le site public : celles de l'admin, sinon les photos livrées avec le site. */
export async function listPublicPhotos(): Promise<Photo[]> {
  const photos = await listPhotos();
  return photos.length ? photos : defaultPhotos;
}

export async function uploadPhoto(file: File, label: string): Promise<void> {
  if (isDemoMode) {
    // En démo, l'image est gardée en mémoire sous forme de data URL.
    const buf = Buffer.from(await file.arrayBuffer());
    const s = demoStore();
    s.photos.push({
      id: uid(),
      storage_path: file.name,
      url: `data:${file.type};base64,${buf.toString("base64")}`,
      label,
      position: s.photos.length,
      is_cover: s.photos.length === 0,
    });
    return;
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${uid().slice(0, 8)}.${ext}`;
  const { error: upErr } = await db()
    .storage.from("photos")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (upErr) fail("envoi de la photo", upErr);
  const { data: pub } = db().storage.from("photos").getPublicUrl(path);
  const existing = await listPhotos();
  const { error } = await db().from("photos").insert({
    storage_path: path,
    url: pub.publicUrl,
    label,
    position: existing.length,
    is_cover: existing.length === 0,
  });
  if (error) fail("enregistrement de la photo", error);
}

export async function deletePhoto(id: string): Promise<void> {
  if (isDemoMode) {
    const s = demoStore();
    const wasCover = s.photos.find((p) => p.id === id)?.is_cover;
    s.photos = s.photos.filter((p) => p.id !== id);
    if (wasCover && s.photos[0]) s.photos[0].is_cover = true;
    return;
  }
  const { data: photo } = await db().from("photos").select("*").eq("id", id).maybeSingle();
  if (!photo) return;
  await db().storage.from("photos").remove([photo.storage_path]);
  const { error } = await db().from("photos").delete().eq("id", id);
  if (error) fail("suppression de la photo", error);
  if (photo.is_cover) {
    const rest = await listPhotos();
    if (rest[0]) await setCoverPhoto(rest[0].id);
  }
}

export async function reorderPhotos(ids: string[]): Promise<void> {
  if (isDemoMode) {
    for (const p of demoStore().photos) p.position = ids.indexOf(p.id);
    return;
  }
  await Promise.all(
    ids.map((id, position) =>
      db()
        .from("photos")
        .update({ position })
        .eq("id", id)
        .then(({ error }) => error && fail("réordonnancement", error)),
    ),
  );
}

export async function setCoverPhoto(id: string): Promise<void> {
  if (isDemoMode) {
    for (const p of demoStore().photos) p.is_cover = p.id === id;
    return;
  }
  // Deux étapes à cause de l'index unique « une seule couverture ».
  const { error: e1 } = await db().from("photos").update({ is_cover: false }).eq("is_cover", true);
  if (e1) fail("couverture", e1);
  const { error: e2 } = await db().from("photos").update({ is_cover: true }).eq("id", id);
  if (e2) fail("couverture", e2);
}

export async function updatePhotoLabel(id: string, label: string): Promise<void> {
  if (isDemoMode) {
    const p = demoStore().photos.find((x) => x.id === id);
    if (p) p.label = label;
    return;
  }
  const { error } = await db().from("photos").update({ label }).eq("id", id);
  if (error) fail("libellé de la photo", error);
}

// ═════════════════════════ DATES BLOQUÉES ═════════════════════════

export async function listBlocked(from?: string): Promise<BlockedDate[]> {
  if (isDemoMode) {
    return demoStore()
      .blocked.filter((b) => !from || b.date >= from)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  let q = db().from("blocked_dates").select("*").order("date");
  if (from) q = q.gte("date", from);
  const { data, error } = await q;
  if (error) fail("lecture des dates bloquées", error);
  return data ?? [];
}

/** Bloque ou débloque une nuit (blocage manuel). Retourne le nouvel état. */
export async function toggleBlockedDate(date: string, reason?: string): Promise<boolean> {
  if (isDemoMode) {
    const s = demoStore();
    const i = s.blocked.findIndex((b) => b.date === date && b.source === "manual");
    if (i >= 0) {
      s.blocked.splice(i, 1);
      return false;
    }
    s.blocked.push({ id: uid(), date, reason: reason ?? null, source: "manual", feed_url: null });
    return true;
  }
  const { data: existing } = await db()
    .from("blocked_dates")
    .select("id")
    .eq("date", date)
    .eq("source", "manual")
    .maybeSingle();
  if (existing) {
    const { error } = await db().from("blocked_dates").delete().eq("id", existing.id);
    if (error) fail("déblocage", error);
    return false;
  }
  const { error } = await db().from("blocked_dates").insert({ date, reason: reason ?? null, source: "manual" });
  if (error) fail("blocage", error);
  return true;
}

/** Bloque ou débloque plusieurs nuits d'un coup (blocage manuel). */
export async function setBlockedDates(dates: string[], blocked: boolean, reason?: string): Promise<void> {
  if (!dates.length) return;
  if (isDemoMode) {
    const s = demoStore();
    s.blocked = s.blocked.filter((b) => !(b.source === "manual" && dates.includes(b.date)));
    if (blocked) for (const date of dates) s.blocked.push({ id: uid(), date, reason: reason ?? null, source: "manual", feed_url: null });
    return;
  }
  const { error: delErr } = await db().from("blocked_dates").delete().eq("source", "manual").in("date", dates);
  if (delErr) fail("déblocage", delErr);
  if (blocked) {
    const { error } = await db()
      .from("blocked_dates")
      .insert(dates.map((date) => ({ date, reason: reason ?? null, source: "manual" })));
    if (error) fail("blocage", error);
  }
}

/** Remplace toutes les nuits importées d'un flux iCal par la nouvelle liste. */
export async function replaceIcalBlocked(feedUrl: string, dates: { date: string; reason: string }[]): Promise<void> {
  if (isDemoMode) {
    const s = demoStore();
    s.blocked = s.blocked.filter((b) => !(b.source === "ical" && b.feed_url === feedUrl));
    for (const d of dates) s.blocked.push({ id: uid(), ...d, source: "ical", feed_url: feedUrl });
    return;
  }
  const { error: delErr } = await db().from("blocked_dates").delete().eq("source", "ical").eq("feed_url", feedUrl);
  if (delErr) fail("purge iCal", delErr);
  if (dates.length) {
    const { error } = await db()
      .from("blocked_dates")
      .insert(dates.map((d) => ({ ...d, source: "ical", feed_url: feedUrl })));
    if (error) fail("import iCal", error);
  }
}

// ═════════════════════════ RÉSERVATIONS ═════════════════════════

export async function listBookings(): Promise<Booking[]> {
  if (isDemoMode) return [...demoStore().bookings].sort((a, b) => a.check_in.localeCompare(b.check_in));
  const { data, error } = await db().from("bookings").select("*").order("check_in");
  if (error) fail("lecture des réservations", error);
  return (data ?? []).map(mapBooking);
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (isDemoMode) return demoStore().bookings.find((b) => b.id === id) ?? null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) fail("lecture d'une réservation", error);
  return data ? mapBooking(data) : null;
}

export async function getBookingBySession(sessionId: string): Promise<Booking | null> {
  if (isDemoMode) return demoStore().bookings.find((b) => b.stripe_session_id === sessionId) ?? null;
  const { data, error } = await db().from("bookings").select("*").eq("stripe_session_id", sessionId).maybeSingle();
  if (error) fail("lecture d'une réservation", error);
  return data ? mapBooking(data) : null;
}

export type NewBooking = Omit<
  Booking,
  | "id"
  | "created_at"
  | "status"
  | "stripe_session_id"
  | "stripe_payment_intent"
  | "paid_at"
  | "cancelled_at"
  | "cancel_reason"
>;

/**
 * Crée une réservation « en attente de paiement ».
 * Retourne `conflict` si les dates se chevauchent avec une autre réservation active
 * (contrainte d'exclusion PostgreSQL — atomique, aucune course possible).
 */
export async function createPendingBooking(b: NewBooking): Promise<{ ok: true; booking: Booking } | { ok: false; conflict: true }> {
  if (isDemoMode) {
    const s = demoStore();
    const clash = s.bookings.some(
      (x) => x.status !== "cancelled" && x.check_in < b.check_out && b.check_in < x.check_out,
    );
    if (clash) return { ok: false, conflict: true };
    const booking: Booking = {
      ...b,
      id: uid(),
      created_at: new Date().toISOString(),
      status: "pending",
      stripe_session_id: null,
      stripe_payment_intent: null,
      paid_at: null,
      cancelled_at: null,
      cancel_reason: null,
    };
    s.bookings.push(booking);
    return { ok: true, booking };
  }
  const { data, error } = await db().from("bookings").insert({ ...b, status: "pending" }).select("*").single();
  if (error) {
    if ((error as { code?: string }).code === "23P01") return { ok: false, conflict: true };
    fail("création de la réservation", error);
  }
  return { ok: true, booking: mapBooking(data) };
}

export async function updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null> {
  if (isDemoMode) {
    const b = demoStore().bookings.find((x) => x.id === id);
    if (!b) return null;
    Object.assign(b, patch);
    return b;
  }
  const { data, error } = await db().from("bookings").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) {
    if ((error as { code?: string }).code === "23P01") return null; // réactivation impossible : chevauchement
    fail("mise à jour de la réservation", error);
  }
  return data ? mapBooking(data) : null;
}

/**
 * Passe une réservation à « payée » UNIQUEMENT si elle a le statut attendu.
 * Mise à jour conditionnelle = idempotente : si le webhook et la page de confirmation
 * arrivent en même temps, un seul des deux « gagne » (et envoie les e-mails).
 */
export async function transitionBooking(
  id: string,
  from: Booking["status"],
  patch: Partial<Booking>,
): Promise<Booking | null> {
  if (isDemoMode) {
    const b = demoStore().bookings.find((x) => x.id === id && x.status === from);
    if (!b) return null;
    Object.assign(b, patch);
    return b;
  }
  const { data, error } = await db()
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .eq("status", from)
    .select("*")
    .maybeSingle();
  if (error) {
    if ((error as { code?: string }).code === "23P01") return null;
    fail("transition de réservation", error);
  }
  return data ? mapBooking(data) : null;
}

/** Libère les réservations en attente dont le délai de paiement est dépassé. */
export async function expirePendingBookings(): Promise<number> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    let n = 0;
    for (const b of demoStore().bookings) {
      if (b.status === "pending" && b.expires_at && b.expires_at < now) {
        Object.assign(b, { status: "cancelled", cancelled_at: now, cancel_reason: "Paiement non finalisé" });
        n++;
      }
    }
    return n;
  }
  const { data, error } = await db()
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: now, cancel_reason: "Paiement non finalisé" })
    .eq("status", "pending")
    .lt("expires_at", now)
    .select("id");
  if (error) fail("expiration des réservations", error);
  return data?.length ?? 0;
}

// ═════════════════════════ DISPONIBILITÉS ═════════════════════════

/**
 * Nuits indisponibles à partir d'aujourd'hui : réservations payées ou en attente (non expirées)
 * + nuits bloquées. `excludeBookingId` permet de vérifier une réservation contre les autres.
 */
export async function getUnavailableNights(excludeBookingId?: string): Promise<Set<string>> {
  const today = todayParis();
  const now = new Date().toISOString();
  const [bookings, blocked] = await Promise.all([
    isDemoMode
      ? Promise.resolve(demoStore().bookings.filter((b) => b.check_out > today))
      : db()
          .from("bookings")
          .select("id, check_in, check_out, status, expires_at")
          .neq("status", "cancelled")
          .gt("check_out", today)
          .then(({ data, error }) => {
            if (error) fail("disponibilités", error);
            return (data ?? []) as Pick<Booking, "id" | "check_in" | "check_out" | "status" | "expires_at">[];
          }),
    listBlocked(today),
  ]);

  const set = new Set<string>();
  for (const b of bookings) {
    if (b.id === excludeBookingId || b.status === "cancelled") continue;
    if (b.status === "pending" && b.expires_at && b.expires_at < now) continue; // attente expirée
    for (const n of nightsBetween(b.check_in, b.check_out)) set.add(n);
  }
  for (const d of blocked) set.add(d.date);
  return set;
}

/** Tout ce dont le calendrier public et le calcul de prix ont besoin. */
export async function getAvailabilityData(): Promise<AvailabilityData> {
  const [unavailable, settings, periods] = await Promise.all([getUnavailableNights(), getSettings(), listPeriods()]);
  const horizon = addDays(todayParis(), 550); // ~18 mois
  return {
    unavailable: [...unavailable].filter((d) => d <= horizon).sort(),
    settings: {
      base_price: settings.base_price,
      cleaning_fee: settings.cleaning_fee,
      min_nights: settings.min_nights,
      tourist_tax_per_adult_night: settings.tourist_tax_per_adult_night,
    },
    periods,
  };
}

export const pendingHoldMs = siteConfig.pendingHoldMinutes * 60_000;
