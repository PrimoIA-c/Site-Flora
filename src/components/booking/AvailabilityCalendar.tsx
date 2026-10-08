"use client";

import { useMemo, useState } from "react";
import { addDays, parseISO, toISO, todayParis } from "@/lib/dates";
import { spawnRipple } from "@/components/motion/Ripple";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

export interface Range {
  checkIn: string | null;
  checkOut: string | null;
}

interface Props {
  unavailable: string[];
  /** Mode lecture seule (page d'accueil) ou sélection d'un séjour (page Réserver). */
  selectable?: boolean;
  value?: Range;
  onChange?: (r: Range) => void;
  months?: 1 | 2;
  minNightsFor?: (checkIn: string) => number;
  priceFor?: (date: string) => number;
}

const WEEKDAYS = { fr: ["L", "M", "M", "J", "V", "S", "D"], en: ["M", "T", "W", "T", "F", "S", "S"] };
const FMT = {
  fr: {
    month: new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }),
    day: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
  },
  en: {
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }),
    day: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
  },
};

function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}
function addMonths(iso: string, n: number) {
  const d = parseISO(iso);
  d.setUTCMonth(d.getUTCMonth() + n, 1);
  return toISO(d);
}

export function AvailabilityCalendar({
  unavailable,
  selectable = false,
  value = { checkIn: null, checkOut: null },
  onChange,
  months = 2,
  minNightsFor,
  priceFor,
}: Props) {
  const lang = useLang();
  const monthFmt = FMT[lang].month;
  const dayFmt = FMT[lang].day;
  const today = todayParis();
  const firstMonth = monthStart(today);
  const [cursor, setCursor] = useState(value.checkIn ? monthStart(value.checkIn) : firstMonth);
  const [hover, setHover] = useState<string | null>(null);
  const blocked = useMemo(() => new Set(unavailable), [unavailable]);
  const maxMonth = addMonths(firstMonth, 17);

  const { checkIn, checkOut } = value;
  const choosingOut = selectable && checkIn && !checkOut;

  /** Première nuit indisponible après l'arrivée : on ne peut pas partir après elle. */
  const limit = useMemo(() => {
    if (!choosingOut || !checkIn) return null;
    for (let d = checkIn, i = 0; i < 400; d = addDays(d, 1), i++) if (blocked.has(d)) return d;
    return null;
  }, [choosingOut, checkIn, blocked]);

  function status(d: string) {
    const past = d < today;
    const nightTaken = blocked.has(d);
    let disabled = past;
    let reason = "";
    if (selectable) {
      if (choosingOut && checkIn) {
        const minN = minNightsFor?.(checkIn) ?? 1;
        if (d <= checkIn) disabled = past || nightTaken; // recliquer avant = nouvelle arrivée
        else if (limit && d > limit) disabled = true;
        else if (d < addDays(checkIn, minN)) {
          disabled = true;
          reason = lang === "en" ? `${minN}-night minimum` : `minimum ${minN} nuits`;
        }
      } else {
        disabled = past || nightTaken;
      }
    }
    return { past, nightTaken, disabled, reason };
  }

  function click(d: string) {
    if (!selectable || !onChange) return;
    if (!checkIn || checkOut || d <= checkIn) {
      if (!blocked.has(d)) onChange({ checkIn: d, checkOut: null });
      return;
    }
    onChange({ checkIn, checkOut: d });
  }

  const inRange = (d: string) => {
    if (!checkIn) return false;
    const end = checkOut ?? (choosingOut && hover && hover > checkIn && !status(hover).disabled ? hover : null);
    return !!end && d > checkIn && d < end;
  };

  const monthList = Array.from({ length: months }, (_, i) => addMonths(cursor, i));

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          disabled={cursor <= firstMonth}
          className="grid h-10 w-10 place-items-center rounded-full border border-marine/15 transition hover:bg-marine hover:text-ecume disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-marine"
          aria-label={t(lang, "Mois précédent", "Previous month")}
        >
          ←
        </button>
        <p className="text-sm text-granite" aria-live="polite">
          {selectable
            ? !checkIn
              ? t(lang, "Choisissez votre date d'arrivée", "Choose your arrival date")
              : !checkOut
                ? t(lang, "Choisissez votre date de départ", "Choose your departure date")
                : t(lang, "Séjour sélectionné — cliquez pour recommencer", "Stay selected — click to start again")
            : t(lang, "Disponibilités en temps réel", "Live availability")}
        </p>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          disabled={cursor >= maxMonth}
          className="grid h-10 w-10 place-items-center rounded-full border border-marine/15 transition hover:bg-marine hover:text-ecume disabled:opacity-25"
          aria-label={t(lang, "Mois suivant", "Next month")}
        >
          →
        </button>
      </div>

      <div className={`grid gap-8 ${months === 2 ? "md:grid-cols-2" : ""}`}>
        {monthList.map((m, idx) => (
          <div key={m} className={idx > 0 ? "hidden md:block" : ""}>
            <h3 className="mb-3 font-serif text-xl capitalize">{monthFmt.format(parseISO(m))}</h3>
            <div className="grid grid-cols-7 text-center text-[0.7rem] font-semibold uppercase tracking-widest text-granite">
              {WEEKDAYS[lang].map((w, i) => (
                <div key={i} className="pb-2">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: (parseISO(m).getUTCDay() + 6) % 7 }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysIn(m) }).map((_, i) => {
                const d = addDays(m, i);
                const s = status(d);
                const isStart = d === checkIn;
                const isEnd = d === checkOut;
                const mid = inRange(d);
                const price = priceFor && !s.past && !s.nightTaken ? priceFor(d) : null;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={s.disabled || !selectable}
                    onClick={(e) => {
                      spawnRipple(e);
                      click(d);
                    }}
                    onMouseEnter={() => setHover(d)}
                    onMouseLeave={() => setHover(null)}
                    aria-label={`${dayFmt.format(parseISO(d))}${s.nightTaken ? t(lang, ", indisponible", ", unavailable") : t(lang, ", disponible", ", available")}${s.reason ? `, ${s.reason}` : ""}`}
                    aria-pressed={isStart || isEnd}
                    className={[
                      "ripple-host relative flex aspect-square flex-col items-center justify-center text-sm transition-colors duration-200",
                      "disabled:cursor-default",
                      isStart || isEnd
                        ? "z-10 rounded-full bg-marine font-semibold text-ecume"
                        : mid
                          ? "bg-phare/35"
                          : s.past
                            ? "text-marine/25"
                            : s.nightTaken
                              ? "text-marine/30"
                              : selectable && !s.disabled
                                ? "rounded-full hover:bg-marine/10"
                                : "",
                      s.disabled && !s.past && !s.nightTaken && !isStart ? "text-marine/35" : "",
                    ].join(" ")}
                  >
                    <span className={s.nightTaken && !s.past && !isStart && !isEnd ? "line-through decoration-marine/40" : ""}>
                      {Number(d.slice(8))}
                    </span>
                    {price !== null && selectable && (
                      <span className={`text-[0.6rem] leading-none ${isStart || isEnd ? "text-ecume/70" : "text-granite"}`}>{Math.round(price)}€</span>
                    )}
                    {/* Hachures granite sur les nuits prises */}
                    {s.nightTaken && !s.past && (
                      <span
                        aria-hidden
                        className="absolute inset-1 -z-10 rounded-md opacity-60"
                        style={{
                          background:
                            "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-granite) 22%, transparent) 0 2px, transparent 2px 6px)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-granite">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-marine/30 bg-white" /> {t(lang, "Disponible", "Available")}
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ background: "repeating-linear-gradient(135deg, var(--color-granite-2) 0 1px, transparent 1px 3px)" }}
          />{" "}
          {t(lang, "Réservé / indisponible", "Booked / unavailable")}
        </span>
        {selectable && (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-marine" /> {t(lang, "Votre séjour", "Your stay")}
          </span>
        )}
      </div>
    </div>
  );
}

function daysIn(monthIso: string) {
  const d = parseISO(monthIso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}
