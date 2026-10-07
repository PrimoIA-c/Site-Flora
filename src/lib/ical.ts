/**
 * iCal (RFC 5545) — export des réservations et import de calendriers externes (Airbnb, Booking…).
 * Implémentation volontairement minimale et sans dépendance.
 */
import "server-only";
import { siteConfig } from "@/config/site";
import { addDays, isValidISODate, nightsBetween, todayParis } from "./dates";
import { getSettings, listBlocked, listBookings, replaceIcalBlocked, updateSettings } from "./db";

const icsDate = (iso: string) => iso.replaceAll("-", "");
const icsStamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Replie les lignes à 75 octets (exigence iCal). */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

/**
 * Flux exporté : réservations payées + nuits bloquées manuellement, regroupées en plages.
 * Les événements sont anonymisés (« Réservé ») : ce flux est destiné à Airbnb/Booking.
 */
export async function buildIcsExport(): Promise<string> {
  const from = addDays(todayParis(), -30);
  const [bookings, blocked] = await Promise.all([listBookings(), listBlocked(from)]);
  const events: { uid: string; start: string; end: string; summary: string }[] = [];

  for (const b of bookings) {
    if (b.status !== "paid" || b.check_out < from) continue;
    events.push({ uid: `booking-${b.id}`, start: b.check_in, end: b.check_out, summary: "Réservé" });
  }

  // Regroupe les nuits bloquées manuellement consécutives en une seule plage.
  const manual = blocked.filter((d) => d.source === "manual").map((d) => d.date).sort();
  let start: string | null = null;
  let prev: string | null = null;
  const flush = () => {
    if (start && prev) events.push({ uid: `block-${start}`, start, end: addDays(prev, 1), summary: "Indisponible" });
  };
  for (const d of manual) {
    if (prev && d === addDays(prev, 1)) {
      prev = d;
      continue;
    }
    flush();
    start = prev = d;
  }
  flush();

  const stamp = icsStamp();
  const host = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost").hostname;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.name}//Reservations//FR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${siteConfig.name}`,
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(e.start)}`,
      `DTEND;VALUE=DATE:${icsDate(e.end)}`,
      `SUMMARY:${e.summary}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

interface ParsedEvent {
  start: string;
  end: string;
  summary: string;
}

/** Extrait les événements (dates de début/fin) d'un fichier .ics. */
export function parseIcs(text: string): ParsedEvent[] {
  // « Déplie » les lignes continuées (commençant par un espace ou une tabulation).
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const events: ParsedEvent[] = [];
  let cur: Partial<ParsedEvent> | null = null;
  const toISO = (v: string) => {
    const m = v.match(/(\d{4})(\d{2})(\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
  };
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT" && cur) {
      if (cur.start && isValidISODate(cur.start)) {
        const end = cur.end && isValidISODate(cur.end) && cur.end > cur.start ? cur.end : addDays(cur.start, 1);
        events.push({ start: cur.start, end, summary: cur.summary || "Réservé (externe)" });
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const key = line.slice(0, idx).split(";")[0].toUpperCase();
      const value = line.slice(idx + 1);
      if (key === "DTSTART") cur.start = toISO(value);
      else if (key === "DTEND") cur.end = toISO(value);
      else if (key === "SUMMARY") cur.summary = value.replace(/\\,/g, ",").slice(0, 120);
    }
  }
  return events;
}

export interface SyncReport {
  url: string;
  ok: boolean;
  nights?: number;
  error?: string;
}

/** Télécharge chaque flux configuré et remplace les nuits bloquées correspondantes. */
export async function syncIcalFeeds(): Promise<SyncReport[]> {
  const settings = await getSettings();
  const today = todayParis();
  const reports: SyncReport[] = [];

  for (const url of settings.ical_import_urls) {
    try {
      const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 ical-sync" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Ce lien ne renvoie pas un calendrier iCal");
      const nights = new Map<string, string>();
      for (const ev of parseIcs(text)) {
        for (const n of nightsBetween(ev.start, ev.end)) if (n >= today) nights.set(n, ev.summary);
      }
      await replaceIcalBlocked(
        url,
        [...nights].map(([date, summary]) => ({ date, reason: `iCal : ${summary}` })),
      );
      reports.push({ url, ok: true, nights: nights.size });
    } catch (e) {
      reports.push({ url, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  await updateSettings({ ical_last_sync: new Date().toISOString() });
  return reports;
}
