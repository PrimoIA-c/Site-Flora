import { formatEUR } from "@/lib/dates";
import type { TideInfo } from "@/lib/tides";

type Lang = "fr" | "en";

const T = {
  fr: { today: "Aujourd'hui à Saint-Malo", high: "Pleine mer", low: "Basse mer", rising: "Marée montante", falling: "Marée descendante", from: "Dès", night: "nuit", direct: "En direct, sans frais de service", tomorrow: "demain", note: "Horaires indicatifs" },
  en: { today: "Today in Saint-Malo", high: "High tide", low: "Low tide", rising: "Tide rising", falling: "Tide falling", from: "From", night: "night", direct: "Book direct, no service fees", tomorrow: "tomorrow", note: "Approximate times" },
};

function WaveIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 9c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1M2 15c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1" />
    </svg>
  );
}

function fmtTime(time: string, lang: Lang) {
  // « 5 h 42 » → « 5:42 » en anglais
  return lang === "en" ? time.replace(" h ", ":") : time;
}

/** Carte « verre dépoli » du hero (ordinateur) : marées du jour + prix. */
export function HeroTicket({ price, tides, lang = "fr" }: { price: number; tides: TideInfo | null; lang?: Lang }) {
  const t = T[lang];
  return (
    <div className="w-72 overflow-hidden rounded-2xl border border-ecume/20 bg-marine/35 text-ecume shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
      {tides && (
        <div className="border-b border-ecume/15 px-5 py-4">
          <p className="eyebrow flex items-center gap-2 text-[0.65rem] text-phare">
            <WaveIcon className="h-3.5 w-3.5" /> {t.today}
          </p>
          <p className="mt-2 text-sm text-ecume/75">{tides.rising ? t.rising : t.falling}</p>
          <ul className="mt-2 space-y-1.5">
            {tides.next.slice(0, 2).map((e, i) => (
              <li key={i} className="flex items-baseline justify-between text-sm">
                <span className="text-ecume/80">{e.type === "haute" ? t.high : t.low}</span>
                <span className="font-serif text-lg">
                  {fmtTime(e.time, lang)}
                  {e.day === "demain" && <span className="ml-1 font-sans text-xs text-ecume/60">({t.tomorrow})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="px-5 py-4">
        <p className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-ecume/70">{t.from}</span>
          <span className="whitespace-nowrap font-serif text-4xl leading-none">{formatEUR(price)}</span>
          <span className="whitespace-nowrap text-sm text-ecume/70">/ {t.night}</span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-phare">
          <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
          {t.direct}
        </p>
      </div>
    </div>
  );
}

/** Ligne compacte des marées (mobile, sous le texte du hero). */
export function TideLine({ tides, lang = "fr" }: { tides: TideInfo | null; lang?: Lang }) {
  if (!tides) return null;
  const t = T[lang];
  return (
    <p className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-ecume/20 bg-marine/40 px-4 py-2 text-xs text-ecume/85 backdrop-blur-sm">
      <WaveIcon className="h-4 w-4 text-phare" />
      {tides.next.slice(0, 2).map((e, i) => (
        <span key={i}>
          {e.type === "haute" ? t.high : t.low} <strong className="text-ecume">{fmtTime(e.time, lang)}</strong>
          {e.day === "demain" ? ` (${t.tomorrow})` : ""}
        </span>
      ))}
    </p>
  );
}
