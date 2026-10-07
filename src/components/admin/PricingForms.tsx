"use client";

import { useActionState, useTransition } from "react";
import { addPeriodAction, deletePeriodAction, savePricingAction, type ActionState } from "@/app/admin/actions";
import { formatEUR, formatShort } from "@/lib/dates";
import type { PricingPeriod, Settings } from "@/lib/types";
import { ActionMessage, Card, SubmitButton } from "./ui";

export function PricingForms({ settings, periods }: { settings: Settings; periods: PricingPeriod[] }) {
  const [state, action] = useActionState<ActionState | null, FormData>(savePricingAction, null);
  const [pState, pAction] = useActionState<ActionState | null, FormData>(addPeriodAction, null);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Tarifs de base" description="Appliqués toute l'année, sauf pendant les périodes définies à droite.">
        <form action={action} className="space-y-4">
          <Money name="base_price" label="Prix par nuit" value={settings.base_price} />
          <Money name="cleaning_fee" label="Frais de ménage (option proposée au client)" value={settings.cleaning_fee} />
          <label className="block">
            <span className="label">Durée minimale de séjour (nuits)</span>
            <input name="min_nights" type="number" min={1} max={30} defaultValue={settings.min_nights} className="field max-w-40" />
          </label>
          <Money name="tourist_tax_per_adult_night" label="Taxe de séjour par adulte et par nuit" value={settings.tourist_tax_per_adult_night} step="0.01" hint="Montant fixé par Saint-Malo Agglomération selon le classement du logement." />
          <SubmitButton>Enregistrer</SubmitButton>
          <ActionMessage state={state} />
        </form>
      </Card>

      <div className="space-y-6">
        <Card title="Prix par période" description="Haute saison, vacances scolaires, week-ends prolongés… La période la plus récemment ajoutée l'emporte en cas de chevauchement.">
          {periods.length ? (
            <ul className="divide-y divide-marine/10">
              {periods.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{p.label}</p>
                    <p className="text-granite">
                      {formatShort(p.start_date)} → {formatShort(p.end_date)}
                      {p.min_nights ? ` · min. ${p.min_nights} nuits` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl">{formatEUR(p.price_per_night)}</span>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => confirm(`Supprimer « ${p.label} » ?`) && startDelete(() => deletePeriodAction(p.id))}
                      className="rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-granite">Aucune période : le prix de base s&apos;applique partout.</p>
          )}
        </Card>

        <Card title="Ajouter une période">
          <form action={pAction} className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="label">Nom</span>
              <input name="label" required className="field" placeholder="ex. Haute saison" />
            </label>
            <label>
              <span className="label">Du</span>
              <input name="start_date" type="date" required className="field" />
            </label>
            <label>
              <span className="label">Au (inclus)</span>
              <input name="end_date" type="date" required className="field" />
            </label>
            <Money name="price_per_night" label="Prix par nuit" />
            <label>
              <span className="label">Durée min. (facultatif)</span>
              <input name="min_nights" type="number" min={1} max={30} className="field" placeholder="ex. 7" />
            </label>
            <div className="sm:col-span-2">
              <SubmitButton pendingText="Ajout…">Ajouter la période</SubmitButton>
            </div>
            <div className="sm:col-span-2">
              <ActionMessage state={pState} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Money({ name, label, value, step = "1", hint }: { name: string; label: string; value?: number; step?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="relative max-w-48">
        <input name={name} type="number" min={0} step={step} defaultValue={value} required className="field pr-10" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-granite">€</span>
      </div>
      {hint && <span className="mt-1 block text-xs text-granite">{hint}</span>}
    </label>
  );
}
