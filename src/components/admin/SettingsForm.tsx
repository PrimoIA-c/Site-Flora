"use client";

import { useActionState, useState } from "react";
import { saveSettingsAction, type ActionState } from "@/app/admin/actions";
import type { Equipment, Room, Settings } from "@/lib/types";
import { ActionMessage, Card, SubmitButton } from "./ui";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState<ActionState | null, FormData>(saveSettingsAction, null);
  const [rooms, setRooms] = useState<Room[]>(settings.rooms);
  const [equipment, setEquipment] = useState<Equipment[]>(settings.equipment);
  const [newEquip, setNewEquip] = useState("");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="rooms" value={JSON.stringify(rooms)} />
      <input type="hidden" name="equipment" value={JSON.stringify(equipment)} />

      <Card title="Alertes" description="Adresse qui reçoit les nouvelles réservations et les messages du formulaire de contact.">
        <input name="alert_email" type="email" defaultValue={settings.alert_email ?? ""} className="field max-w-md" placeholder="vous@exemple.fr" />
      </Card>

      <Card title="Page d'accueil">
        <div className="space-y-4">
          <label className="block">
            <span className="label">Grand titre</span>
            <input name="hero_title" defaultValue={settings.hero_title} className="field" maxLength={120} />
          </label>
          <label className="block">
            <span className="label">Sous-titre</span>
            <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={2} className="field" maxLength={400} />
          </label>
          <label className="block">
            <span className="label">Présentation du logement</span>
            <textarea name="description" defaultValue={settings.description} rows={5} className="field" maxLength={2000} />
          </label>
        </div>
      </Card>

      <Card title="Pièces" description="Affichées une par une sur la page « Le logement ». Une photo dont la légende porte le même nom s'affiche à côté.">
        <div className="space-y-3">
          {rooms.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-md bg-ecume p-3 md:grid-cols-[12rem_1fr_auto]">
              <input
                value={r.name}
                onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                className="field"
                placeholder="Nom de la pièce"
                aria-label="Nom de la pièce"
              />
              <textarea
                value={r.text}
                onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                rows={2}
                className="field"
                placeholder="Description"
                aria-label="Description de la pièce"
              />
              <div className="flex gap-1 md:flex-col">
                <IconBtn label="Monter" disabled={i === 0} onClick={() => setRooms(swap(rooms, i, i - 1))}>↑</IconBtn>
                <IconBtn label="Descendre" disabled={i === rooms.length - 1} onClick={() => setRooms(swap(rooms, i, i + 1))}>↓</IconBtn>
                <IconBtn label="Supprimer" danger onClick={() => setRooms(rooms.filter((_, j) => j !== i))}>✕</IconBtn>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setRooms([...rooms, { name: "", text: "" }])} className="rounded-md border border-dashed border-marine/30 px-4 py-2 text-sm font-semibold hover:bg-ecume">
            + Ajouter une pièce
          </button>
        </div>
      </Card>

      <Card title="Équipements" description="Cochez ce qui est disponible. Les équipements décochés apparaissent grisés sur la page « Le logement ».">
        <ul className="grid gap-2 sm:grid-cols-2">
          {equipment.map((e, i) => (
            <li key={i} className="flex items-center gap-3 rounded-md bg-ecume px-3 py-2">
              <input
                type="checkbox"
                checked={e.enabled}
                onChange={(ev) => setEquipment(equipment.map((x, j) => (j === i ? { ...x, enabled: ev.target.checked } : x)))}
                className="h-4 w-4 accent-[var(--color-marine)]"
                aria-label={`Disponible : ${e.label}`}
              />
              <input
                value={e.label}
                onChange={(ev) => setEquipment(equipment.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                aria-label="Nom de l'équipement"
              />
              <IconBtn label="Supprimer" danger onClick={() => setEquipment(equipment.filter((_, j) => j !== i))}>✕</IconBtn>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex max-w-md gap-2">
          <input
            value={newEquip}
            onChange={(e) => setNewEquip(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newEquip.trim()) {
                  setEquipment([...equipment, { label: newEquip.trim(), enabled: true }]);
                  setNewEquip("");
                }
              }
            }}
            className="field"
            placeholder="Nouvel équipement (ex. Barbecue)"
          />
          <button
            type="button"
            onClick={() => {
              if (!newEquip.trim()) return;
              setEquipment([...equipment, { label: newEquip.trim(), enabled: true }]);
              setNewEquip("");
            }}
            className="shrink-0 rounded-md border border-marine/20 px-4 text-sm font-semibold hover:bg-ecume"
          >
            Ajouter
          </button>
        </div>
      </Card>

      <Card title="Règlement intérieur" description="Une règle par ligne.">
        <textarea name="house_rules" defaultValue={settings.house_rules.join("\n")} rows={7} className="field" />
      </Card>

      <div className="sticky bottom-4 flex items-center gap-4 rounded-lg border border-marine/10 bg-white/95 p-4 shadow-lg backdrop-blur">
        <SubmitButton>Enregistrer les paramètres</SubmitButton>
        <ActionMessage state={state} />
      </div>
    </form>
  );
}

function swap<T>(arr: T[], a: number, b: number) {
  const next = [...arr];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-md text-sm disabled:opacity-25 ${danger ? "text-red-700 hover:bg-red-50" : "hover:bg-white"}`}
    >
      {children}
    </button>
  );
}
