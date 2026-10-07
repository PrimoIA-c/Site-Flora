"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { AvailabilityCalendar, type Range } from "./AvailabilityCalendar";
import { Arrow, Button, spawnRipple } from "@/components/motion/Ripple";
import { formatEUR, formatLong } from "@/lib/dates";
import { computeQuote, minNightsFor, nightPrice } from "@/lib/pricing";
import type { AvailabilityData } from "@/lib/types";

export function BookingForm({ initial, initialRange }: { initial: AvailabilityData; initialRange: Range }) {
  const [data, setData] = useState(initial);
  const [range, setRange] = useState<Range>(initialRange);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [withCleaning, setWithCleaning] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [accept, setAccept] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = useMemo(() => {
    if (!range.checkIn || !range.checkOut) return null;
    return computeQuote({ checkIn: range.checkIn, checkOut: range.checkOut, adults, children, withCleaning }, data);
  }, [range, adults, children, withCleaning, data]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!quote?.ok) return setError(quote && !quote.ok ? quote.error : "Choisissez vos dates.");
    if (!accept) return setError("Merci d'accepter les conditions générales de location.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, checkIn: range.checkIn, checkOut: range.checkOut, adults, children, withCleaning, acceptTerms: accept }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error || "Une erreur est survenue.");
        // Les disponibilités ont peut-être changé : on rafraîchit le calendrier.
        const fresh = await fetch("/api/availability", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
        if (fresh) setData(fresh);
        setSubmitting(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setSubmitting(false);
    }
  }

  const q = quote?.ok ? quote.quote : null;

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-12" noValidate>
      <div className="space-y-10 lg:col-span-7">
        {/* 1. Dates */}
        <Step n={1} title="Vos dates">
          <div className="rounded-lg bg-white p-4 shadow-[0_20px_50px_-30px_rgba(14,35,56,0.3)] md:p-6">
            <AvailabilityCalendar
              selectable
              unavailable={data.unavailable}
              value={range}
              onChange={(r) => {
                setRange(r);
                setError(null);
              }}
              minNightsFor={(d) => minNightsFor(d, data)}
              priceFor={(d) => nightPrice(d, data).price}
            />
          </div>
          <p className="mt-3 text-sm text-granite">
            Séjour minimum : {data.settings.min_nights} nuits (peut varier selon la saison). Arrivée dès {siteConfig.defaults.checkInTime}, départ avant{" "}
            {siteConfig.defaults.checkOutTime}.
          </p>
        </Step>

        {/* 2. Voyageurs */}
        <Step n={2} title="Voyageurs">
          <div className="divide-y divide-marine/10 rounded-lg border border-marine/10 bg-white">
            <Stepper label="Adultes" hint="18 ans et plus" value={adults} min={1} max={siteConfig.capacity.adults} onChange={setAdults} />
            <Stepper label="Enfants" hint="Moins de 18 ans" value={children} min={0} max={siteConfig.capacity.children} onChange={setChildren} />
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-marine/10 bg-white p-4">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-marine)]" checked={withCleaning} onChange={(e) => setWithCleaning(e.target.checked)} />
            <span>
              <span className="font-semibold">Ménage de fin de séjour</span> — {formatEUR(data.settings.cleaning_fee)}
              <span className="block text-sm text-granite">Sinon, le logement est à rendre dans l&apos;état où vous l&apos;avez trouvé.</span>
            </span>
          </label>
        </Step>

        {/* 3. Coordonnées */}
        <Step n={3} title="Vos coordonnées">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom et prénom" className="sm:col-span-2">
              <input required autoComplete="name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="E-mail">
              <input required type="email" autoComplete="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Téléphone">
              <input required type="tel" autoComplete="tel" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Un message pour nous ? (facultatif)" className="sm:col-span-2">
              <textarea rows={3} className="field" placeholder="Heure d'arrivée prévue, lit bébé…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </Field>
          </div>
        </Step>
      </div>

      {/* Récapitulatif */}
      <aside className="lg:col-span-5">
        <div className="rounded-lg bg-marine p-6 text-ecume md:p-8 lg:sticky lg:top-28">
          <p className="eyebrow text-phare">Votre séjour</p>
          <AnimatePresence mode="wait">
            <motion.div key={`${range.checkIn}-${range.checkOut}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {range.checkIn ? (
                <div className="mt-4 grid grid-cols-2 gap-4 border-b border-ecume/15 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ecume/60">Arrivée</p>
                    <p className="mt-1 font-serif text-lg first-letter:uppercase">{formatLong(range.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ecume/60">Départ</p>
                    <p className="mt-1 font-serif text-lg first-letter:uppercase">{range.checkOut ? formatLong(range.checkOut) : "—"}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 border-b border-ecume/15 pb-5 font-serif text-2xl text-ecume/80">Sélectionnez vos dates dans le calendrier.</p>
              )}
            </motion.div>
          </AnimatePresence>

          {q && (
            <dl className="mt-5 space-y-3 text-sm">
              <Line label={`${q.nights} nuit${q.nights > 1 ? "s" : ""}${averageNote(q.perNight.map((n) => n.price))}`} value={formatEUR(q.accommodation)} />
              {q.perNight.some((n) => n.label) && (
                <p className="text-xs text-ecume/60">Inclut des nuits au tarif « {[...new Set(q.perNight.filter((n) => n.label).map((n) => n.label))].join(", ")} ».</p>
              )}
              {q.cleaning > 0 && <Line label="Ménage" value={formatEUR(q.cleaning)} />}
              <Line label={`Taxe de séjour (${adults} adulte${adults > 1 ? "s" : ""})`} value={formatEUR(q.touristTax)} />
              <div className="flex items-baseline justify-between border-t border-ecume/15 pt-4">
                <dt className="font-semibold">Total</dt>
                <dd className="font-serif text-4xl">{formatEUR(q.total)}</dd>
              </div>
            </dl>
          )}
          {quote && !quote.ok && <p className="mt-5 rounded-md bg-corail/20 p-3 text-sm">{quote.error}</p>}

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-ecume/80">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-phare)]" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
            <span>
              J&apos;ai lu et j&apos;accepte les{" "}
              <Link href="/conditions-generales" target="_blank" className="underline underline-offset-2">
                conditions générales de location
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" target="_blank" className="underline underline-offset-2">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>

          <AnimatePresence>
            {error && (
              <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 rounded-md bg-corail px-4 py-3 text-sm text-white">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={submitting || !q} className="group mt-6 w-full !py-4">
            {submitting ? "Redirection vers le paiement…" : q ? `Payer ${formatEUR(q.total)}` : "Payer"}
            {!submitting && <Arrow />}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ecume/60">
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M4 7V5a4 4 0 1 1 8 0v2h1v8H3V7h1Zm2 0h4V5a2 2 0 1 0-4 0v2Z" />
            </svg>
            Paiement sécurisé par Stripe · vos dates sont bloquées pendant le paiement
          </p>
        </div>
      </aside>
    </form>
  );
}

function averageNote(prices: number[]) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? ` × ${formatEUR(min)}` : "";
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 flex items-baseline gap-4 text-3xl">
        <span className="font-sans text-sm font-semibold text-granite">0{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ecume/75">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const btn =
    "ripple-host grid h-10 w-10 place-items-center rounded-full border border-marine/20 text-lg transition hover:border-marine disabled:opacity-30 disabled:hover:border-marine/20";
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-granite">{hint} · max. {max}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className={btn} disabled={value <= min} onClick={(e) => { spawnRipple(e); onChange(value - 1); }} aria-label={`Retirer un ${label.toLowerCase().slice(0, -1)}`}>
          −
        </button>
        <span className="w-4 text-center font-serif text-xl" aria-live="polite">{value}</span>
        <button type="button" className={btn} disabled={value >= max} onClick={(e) => { spawnRipple(e); onChange(value + 1); }} aria-label={`Ajouter un ${label.toLowerCase().slice(0, -1)}`}>
          +
        </button>
      </div>
    </div>
  );
}
