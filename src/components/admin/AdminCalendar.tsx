"use client";

import Link from "next/link";
import { useActionState, useMemo, useOptimistic, useState, useTransition } from "react";
import { blockRangeAction, saveIcalUrlsAction, syncIcalAction, toggleDateAction, type ActionState } from "@/app/admin/actions";
import { spawnRipple } from "@/components/motion/Ripple";
import { addDays, nightsBetween, parseISO, toISO, todayParis } from "@/lib/dates";
import type { BlockedDate, Booking } from "@/lib/types";
import { ActionMessage, Card, SubmitButton } from "./ui";

type Night = { kind: "booking"; booking: Pick<Booking, "id" | "guest_name" | "status" | "check_in"> } | { kind: "manual"; reason: string | null } | { kind: "ical"; reason: string | null };

const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const COLORS = ["bg-sky-100 text-sky-900", "bg-emerald-100 text-emerald-900", "bg-violet-100 text-violet-900", "bg-rose-100 text-rose-900", "bg-amber-100 text-amber-900"];

export function AdminCalendar({
  bookings,
  blocked,
  icalUrls,
  lastSync,
  exportUrl,
}: {
  bookings: Pick<Booking, "id" | "guest_name" | "status" | "check_in" | "check_out">[];
  blocked: BlockedDate[];
  icalUrls: string[];
  lastSync: string | null;
  exportUrl: string;
}) {
  const today = todayParis();
  const [cursor, setCursor] = useState(`${today.slice(0, 7)}-01`);
  const [, startTransition] = useTransition();
  const [manual, toggleOptimistic] = useOptimistic(
    new Set(blocked.filter((b) => b.source === "manual").map((b) => b.date)),
    (set: Set<string>, date: string) => {
      const next = new Set(set);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    },
  );

  const nights = useMemo(() => {
    const map = new Map<string, Night>();
    for (const b of blocked) if (b.source === "ical") map.set(b.date, { kind: "ical", reason: b.reason });
    for (const d of manual) map.set(d, { kind: "manual", reason: blocked.find((b) => b.date === d)?.reason ?? null });
    for (const b of bookings) for (const n of nightsBetween(b.check_in, b.check_out)) map.set(n, { kind: "booking", booking: b });
    return map;
  }, [bookings, blocked, manual]);

  const colorOf = (id: string) => COLORS[Math.abs([...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % COLORS.length];

  function toggle(date: string) {
    startTransition(async () => {
      toggleOptimistic(date);
      await toggleDateAction(date);
    });
  }

  const months = [cursor, shiftMonth(cursor, 1)];

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCursor(shiftMonth(cursor, -1))} className="rounded-md border border-marine/15 px-3 py-1.5 hover:bg-ecume" aria-label="Mois précédent">
              ←
            </button>
            <button type="button" onClick={() => setCursor(`${today.slice(0, 7)}-01`)} className="rounded-md border border-marine/15 px-3 py-1.5 text-sm hover:bg-ecume">
              Aujourd&apos;hui
            </button>
            <button type="button" onClick={() => setCursor(shiftMonth(cursor, 1))} className="rounded-md border border-marine/15 px-3 py-1.5 hover:bg-ecume" aria-label="Mois suivant">
              →
            </button>
          </div>
          <p className="text-sm text-granite">Cliquez sur une nuit libre pour la bloquer, sur une nuit bloquée pour la libérer.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          {months.map((m) => (
            <div key={m}>
              <h3 className="mb-3 font-serif text-2xl capitalize">{monthFmt.format(parseISO(m))}</h3>
              <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-granite">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: (parseISO(m).getUTCDay() + 6) % 7 }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysIn(m) }).map((_, i) => {
                  const d = addDays(m, i);
                  const n = nights.get(d);
                  const past = d < today;
                  const isStart = n?.kind === "booking" && n.booking.check_in === d;
                  const base = "ripple-host relative flex min-h-16 flex-col items-start rounded-md p-1.5 text-left text-xs normal-case tracking-normal transition";
                  if (n?.kind === "booking") {
                    return (
                      <Link
                        key={d}
                        href={`/admin/reservations/${n.booking.id}`}
                        className={`${base} ${colorOf(n.booking.id)} ${past ? "opacity-50" : ""} hover:ring-2 hover:ring-marine/30`}
                        title={`${n.booking.guest_name} — voir la réservation`}
                      >
                        <span className="font-semibold">{Number(d.slice(8))}</span>
                        {isStart && <span className="mt-auto line-clamp-2 font-medium leading-tight">{n.booking.guest_name}</span>}
                        {n.booking.status === "pending" && <span className="mt-auto text-[0.65rem]">paiement…</span>}
                      </Link>
                    );
                  }
                  if (n?.kind === "ical") {
                    return (
                      <div key={d} className={`${base} bg-zinc-200 text-zinc-700 ${past ? "opacity-50" : ""}`} title={n.reason ?? "Import iCal"}>
                        <span className="font-semibold">{Number(d.slice(8))}</span>
                        <span className="mt-auto text-[0.65rem]">iCal</span>
                      </div>
                    );
                  }
                  const isBlocked = n?.kind === "manual";
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={past}
                      onClick={(e) => {
                        spawnRipple(e);
                        toggle(d);
                      }}
                      aria-pressed={isBlocked}
                      aria-label={`${d} : ${isBlocked ? "bloquée, cliquer pour libérer" : "libre, cliquer pour bloquer"}`}
                      className={`${base} ${
                        isBlocked ? "bg-marine text-ecume hover:bg-marine-2" : "bg-ecume text-marine hover:bg-phare/30"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                      style={
                        isBlocked
                          ? { backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 3px, transparent 3px 8px)" }
                          : undefined
                      }
                    >
                      <span className="font-semibold">{Number(d.slice(8))}</span>
                      {isBlocked && <span className="mt-auto text-[0.65rem]">Bloqué</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-granite">
          <Legend cls="bg-ecume ring-1 ring-marine/15" label="Libre" />
          <Legend cls="bg-sky-100" label="Réservation (cliquer pour le détail)" />
          <Legend cls="bg-marine" label="Bloqué manuellement" />
          <Legend cls="bg-zinc-200" label="Importé (Airbnb, Booking…)" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <RangeForm />
        <IcalCard icalUrls={icalUrls} lastSync={lastSync} exportUrl={exportUrl} />
      </div>
    </div>
  );
}

function RangeForm() {
  const [state, action] = useActionState<ActionState | null, FormData>(blockRangeAction, null);
  return (
    <Card title="Bloquer une période" description="Pour une location prise ailleurs, des travaux, vos propres vacances…">
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Première nuit</span>
            <input type="date" name="from" required className="field" />
          </label>
          <label>
            <span className="label">Dernière nuit</span>
            <input type="date" name="to" required className="field" />
          </label>
        </div>
        <label className="block">
          <span className="label">Note (facultatif)</span>
          <input name="reason" className="field" placeholder="ex. Location Le Bon Coin" />
        </label>
        <div className="flex flex-wrap gap-3">
          <button name="mode" value="block" className="rounded-md bg-marine px-5 py-2.5 text-sm font-semibold text-ecume hover:bg-marine-2">
            Bloquer
          </button>
          <button name="mode" value="unblock" className="rounded-md border border-marine/20 px-5 py-2.5 text-sm font-semibold hover:bg-ecume">
            Débloquer
          </button>
        </div>
        <ActionMessage state={state} />
      </form>
    </Card>
  );
}

function IcalCard({ icalUrls, lastSync, exportUrl }: { icalUrls: string[]; lastSync: string | null; exportUrl: string }) {
  const [state, action] = useActionState<ActionState | null, FormData>(saveIcalUrlsAction, null);
  const [syncState, setSyncState] = useState<ActionState | null>(null);
  const [syncing, startSync] = useTransition();
  const [copied, setCopied] = useState(false);

  return (
    <Card title="Synchronisation Airbnb / Booking (iCal)" description="Évitez les doubles réservations entre plateformes.">
      <div className="space-y-5 text-sm">
        <div>
          <p className="label">1. Votre calendrier à donner à Airbnb/Booking</p>
          <div className="flex gap-2">
            <input readOnly value={exportUrl} className="field font-mono text-xs" onFocus={(e) => e.target.select()} />
            <button
              type="button"
              className="shrink-0 rounded-md border border-marine/20 px-3 text-xs font-semibold hover:bg-ecume"
              onClick={() => {
                navigator.clipboard.writeText(exportUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
        </div>
        <form action={action} className="space-y-3">
          <label className="block">
            <span className="label">2. Liens iCal à importer (un par ligne)</span>
            <textarea name="urls" rows={3} defaultValue={icalUrls.join("\n")} className="field font-mono text-xs" placeholder="https://www.airbnb.fr/calendar/ical/….ics" />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton>Enregistrer les liens</SubmitButton>
            <button
              type="button"
              disabled={syncing}
              onClick={() => startSync(async () => setSyncState(await syncIcalAction()))}
              className="rounded-md border border-marine/20 px-5 py-2.5 text-sm font-semibold hover:bg-ecume disabled:opacity-60"
            >
              {syncing ? "Synchronisation…" : "Synchroniser maintenant"}
            </button>
          </div>
          <ActionMessage state={state} />
          <ActionMessage state={syncState} />
          <p className="text-xs text-granite">
            Synchronisation automatique chaque jour.{" "}
            {lastSync && `Dernière : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date(lastSync))}.`}
          </p>
        </form>
      </div>
    </Card>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${cls}`} /> {label}
    </span>
  );
}

function shiftMonth(iso: string, n: number) {
  const d = parseISO(iso);
  d.setUTCMonth(d.getUTCMonth() + n, 1);
  return toISO(d);
}
function daysIn(m: string) {
  const d = parseISO(m);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}
