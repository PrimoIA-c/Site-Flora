"use server";

/**
 * Actions serveur de l'espace admin.
 * Chacune commence par `requireAdmin()` : le jour où l'authentification est branchée,
 * toutes les actions sont protégées d'un coup.
 */
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { cancelBooking } from "@/lib/booking";
import { isValidISODate, nightsBetween, addDays } from "@/lib/dates";
import {
  createPeriod,
  deletePeriod,
  deletePhoto,
  reorderPhotos,
  setCoverPhoto,
  setBlockedDates,
  toggleBlockedDate,
  updatePhotoLabel,
  updateSettings,
  uploadPhoto,
} from "@/lib/db";
import { syncIcalFeeds } from "@/lib/ical";
import type { Equipment, Room } from "@/lib/types";

export interface ActionState {
  ok: boolean;
  message: string;
  at?: number;
}

const done = (message: string): ActionState => ({ ok: true, message, at: Date.now() });
const oops = (message: string): ActionState => ({ ok: false, message, at: Date.now() });

/** Rafraîchit tout le site public + l'admin après une modification. */
function refresh() {
  revalidatePath("/", "layout");
}

const numField = (fd: FormData, k: string) => {
  const v = Number(String(fd.get(k) ?? "").replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
};

// ─── Réservations ─────────────────────────────────────────────

export async function cancelBookingAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(fd.get("id"));
  const res = await cancelBooking(id, {
    refund: fd.get("refund") === "on",
    notify: fd.get("notify") === "on",
    reason: String(fd.get("reason") || "").slice(0, 300) || undefined,
  });
  refresh();
  if (!res.ok) return oops(res.error);
  return done(res.refunded ? "Réservation annulée et remboursée." : "Réservation annulée. Les dates sont de nouveau disponibles.");
}

// ─── Calendrier ───────────────────────────────────────────────

export async function toggleDateAction(date: string): Promise<{ blocked: boolean }> {
  await requireAdmin();
  if (!isValidISODate(date)) throw new Error("Date invalide");
  const blocked = await toggleBlockedDate(date, "Bloqué depuis l'admin");
  refresh();
  return { blocked };
}

export async function blockRangeAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const from = String(fd.get("from"));
  const to = String(fd.get("to")); // dernière nuit incluse
  const mode = String(fd.get("mode"));
  if (!isValidISODate(from) || !isValidISODate(to) || to < from) return oops("Choisissez une période valide.");
  const nights = nightsBetween(from, addDays(to, 1));
  if (nights.length > 366) return oops("Période trop longue (1 an maximum).");
  const reason = String(fd.get("reason") || "").trim().slice(0, 80) || "Bloqué depuis l'admin";
  await setBlockedDates(nights, mode === "block", reason);
  refresh();
  return done(`${nights.length} nuit(s) ${mode === "block" ? "bloquée(s)" : "débloquée(s)"}.`);
}

export async function saveIcalUrlsAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const urls = String(fd.get("urls") || "")
    .split(/\s+/)
    .map((u) => u.trim())
    .filter(Boolean);
  const bad = urls.find((u) => !/^https?:\/\/\S+$/i.test(u));
  if (bad) return oops(`Lien invalide : ${bad}`);
  await updateSettings({ ical_import_urls: urls });
  refresh();
  return done(`${urls.length} calendrier(s) enregistré(s).`);
}

export async function syncIcalAction(): Promise<ActionState> {
  await requireAdmin();
  const reports = await syncIcalFeeds();
  refresh();
  if (!reports.length) return oops("Aucun calendrier à synchroniser : ajoutez d'abord un lien iCal.");
  const failed = reports.filter((r) => !r.ok);
  if (failed.length) return oops(`Échec pour ${failed.length} lien(s) : ${failed.map((f) => f.error).join(" ; ")}`);
  return done(`Synchronisé : ${reports.reduce((s, r) => s + (r.nights ?? 0), 0)} nuit(s) importée(s).`);
}

// ─── Tarifs ───────────────────────────────────────────────────

export async function savePricingAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const base = numField(fd, "base_price");
  const cleaning = numField(fd, "cleaning_fee");
  const minNights = numField(fd, "min_nights");
  const tax = numField(fd, "tourist_tax_per_adult_night");
  if (!(base > 0)) return oops("Le prix de base doit être supérieur à 0.");
  if (!(cleaning >= 0) || !(tax >= 0)) return oops("Montants invalides.");
  if (!Number.isInteger(minNights) || minNights < 1 || minNights > 30) return oops("Durée minimale : entre 1 et 30 nuits.");
  await updateSettings({ base_price: base, cleaning_fee: cleaning, min_nights: minNights, tourist_tax_per_adult_night: tax });
  refresh();
  return done("Tarifs enregistrés.");
}

export async function addPeriodAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const label = String(fd.get("label") || "").trim().slice(0, 80);
  const start = String(fd.get("start_date"));
  const end = String(fd.get("end_date"));
  const price = numField(fd, "price_per_night");
  const minRaw = String(fd.get("min_nights") || "").trim();
  const min = minRaw ? Number(minRaw) : null;
  if (!label) return oops("Donnez un nom à la période (ex. Haute saison).");
  if (!isValidISODate(start) || !isValidISODate(end) || end < start) return oops("Dates de période invalides.");
  if (!(price > 0)) return oops("Prix par nuit invalide.");
  if (min !== null && (!Number.isInteger(min) || min < 1 || min > 30)) return oops("Durée minimale invalide.");
  await createPeriod({ label, start_date: start, end_date: end, price_per_night: price, min_nights: min });
  refresh();
  return done(`Période « ${label} » ajoutée.`);
}

export async function deletePeriodAction(id: string) {
  await requireAdmin();
  await deletePeriod(id);
  refresh();
}

// ─── Photos ───────────────────────────────────────────────────

export async function uploadPhotosAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const label = String(fd.get("label") || "").trim().slice(0, 60);
  if (!files.length) return oops("Choisissez au moins une photo.");
  for (const f of files) {
    if (!f.type.startsWith("image/")) return oops(`${f.name} n'est pas une image.`);
    if (f.size > 8 * 1024 * 1024) return oops(`${f.name} dépasse 8 Mo : réduisez-la avant de l'envoyer.`);
  }
  for (const f of files) await uploadPhoto(f, label);
  refresh();
  return done(`${files.length} photo(s) ajoutée(s).`);
}

export async function reorderPhotosAction(ids: string[]) {
  await requireAdmin();
  await reorderPhotos(ids);
  refresh();
}

export async function setCoverAction(id: string) {
  await requireAdmin();
  await setCoverPhoto(id);
  refresh();
}

export async function deletePhotoAction(id: string) {
  await requireAdmin();
  await deletePhoto(id);
  refresh();
}

export async function labelPhotoAction(id: string, label: string) {
  await requireAdmin();
  await updatePhotoLabel(id, label.trim().slice(0, 60));
  refresh();
}

// ─── Paramètres ───────────────────────────────────────────────

export async function saveSettingsAction(_: ActionState | null, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const email = String(fd.get("alert_email") || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return oops("Adresse e-mail d'alerte invalide.");

  let rooms: Room[] = [];
  let equipment: Equipment[] = [];
  try {
    rooms = JSON.parse(String(fd.get("rooms") || "[]"));
    equipment = JSON.parse(String(fd.get("equipment") || "[]"));
  } catch {
    return oops("Données de pièces ou d'équipements invalides.");
  }

  await updateSettings({
    alert_email: email || null,
    hero_title: String(fd.get("hero_title") || "").trim().slice(0, 120),
    hero_subtitle: String(fd.get("hero_subtitle") || "").trim().slice(0, 400),
    description: String(fd.get("description") || "").trim().slice(0, 2000),
    rooms: rooms.filter((r) => r.name?.trim()).map((r) => ({ name: r.name.trim().slice(0, 60), text: (r.text || "").trim().slice(0, 800) })),
    equipment: equipment.filter((e) => e.label?.trim()).map((e) => ({ label: e.label.trim().slice(0, 60), enabled: Boolean(e.enabled) })),
    house_rules: String(fd.get("house_rules") || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30),
  });
  refresh();
  return done("Paramètres enregistrés — le site est à jour.");
}
