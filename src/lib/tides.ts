/**
 * Horaires des marées à Saint-Malo, calculés à partir de la hauteur d'eau horaire
 * fournie gratuitement par Open-Meteo (modèle marin). Horaires INDICATIFS (± 15-30 min) :
 * pour la pêche à pied ou la navigation, se référer à l'annuaire officiel du SHOM.
 */
export interface TideEvent {
  type: "haute" | "basse";
  /** Heure locale « HH:MM » */
  time: string;
  /** Jour : "aujourd'hui" ou "demain" */
  day: "aujourd'hui" | "demain";
  /** Hauteur par rapport au niveau moyen, en mètres */
  height: number;
}

export interface TideInfo {
  rising: boolean;
  next: TideEvent[];
}

const URL =
  "https://marine-api.open-meteo.com/v1/marine?latitude=48.636&longitude=-2.03&hourly=sea_level_height_msl&timezone=Europe%2FParis&forecast_days=3";

function parisNow() {
  // Date/heure actuelles à Paris, au format « YYYY-MM-DDTHH:MM »
  const f = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  return f.format(new Date()).replace(" ", "T");
}

export async function getTides(): Promise<TideInfo | null> {
  try {
    const res = await fetch(URL, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const j = (await res.json()) as { hourly?: { time: string[]; sea_level_height_msl: (number | null)[] } };
    const t = j.hourly?.time;
    const v = j.hourly?.sea_level_height_msl;
    if (!t || !v || t.length < 3) return null;

    const now = parisNow();
    const today = now.slice(0, 10);
    const base = new Date(`${t[0]}:00Z`).getTime(); // heures locales traitées comme UTC (calcul relatif)
    const nowMs = new Date(`${now}:00Z`).getTime();

    const events: (TideEvent & { at: number })[] = [];
    for (let i = 1; i < v.length - 1; i++) {
      const a = v[i - 1], b = v[i], c = v[i + 1];
      if (a == null || b == null || c == null) continue;
      const high = b > a && b >= c;
      const low = b < a && b <= c;
      if (!high && !low) continue;
      // Sommet de la parabole passant par les trois points : heure plus précise que l'heure pleine
      const den = a - 2 * b + c;
      const d = den === 0 ? 0 : (a - c) / (2 * den);
      const at = base + (i + d) * 3600_000;
      const date = new Date(at).toISOString(); // « YYYY-MM-DDTHH:MM » en heure locale
      const day = date.slice(0, 10);
      const tomorrow = new Date(new Date(`${today}T00:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10);
      if (day !== today && day !== tomorrow) continue;
      events.push({
        type: high ? "haute" : "basse",
        time: `${Number(date.slice(11, 13))} h ${date.slice(14, 16)}`,
        day: day === today ? "aujourd'hui" : "demain",
        height: Math.round((b - 0.25 * (a - c) * d) * 10) / 10,
        at,
      });
    }
    const upcoming = events.filter((e) => e.at >= nowMs).slice(0, 3);
    if (!upcoming.length) return null;
    return { rising: upcoming[0].type === "haute", next: upcoming.map(({ at: _at, ...e }) => e) };
  } catch {
    return null;
  }
}
