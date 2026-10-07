"use client";

import { Reorder, useDragControls } from "framer-motion";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { deletePhotoAction, labelPhotoAction, reorderPhotosAction, setCoverAction, uploadPhotosAction, type ActionState } from "@/app/admin/actions";
import { PLACEHOLDER_LABELS } from "@/components/site/PhotoFrame";
import type { Photo } from "@/lib/types";
import { ActionMessage, Card, SubmitButton } from "./ui";

export function PhotoManager({ photos }: { photos: Photo[] }) {
  const [items, setItems] = useState(photos);
  const [state, action] = useActionState<ActionState | null, FormData>(uploadPhotosAction, null);
  const [, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Resynchronise la liste quand le serveur renvoie de nouvelles données (ajout, suppression…).
  useEffect(() => setItems(photos), [photos]);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const saveOrder = (list: Photo[]) => {
    const ids = list.map((p) => p.id);
    if (ids.join() === photos.map((p) => p.id).join()) return;
    startTransition(async () => {
      await reorderPhotosAction(ids);
      setSaved("Ordre enregistré ✓");
      setTimeout(() => setSaved(null), 2000);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Ajouter des photos" description="JPEG, PNG ou WebP, 8 Mo max. Idéalement 2000 px de large." className="lg:col-span-1 lg:self-start">
        <form ref={formRef} action={action} className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-marine/20 bg-ecume px-4 py-8 text-center text-sm hover:border-marine/40">
            <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8 text-granite" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3h16v-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold">Choisir des photos</span>
            <span className="text-granite">ou glissez-les ici</span>
            <input type="file" name="files" accept="image/*" multiple required className="w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-marine file:px-3 file:py-1.5 file:text-ecume" />
          </label>
          <label className="block">
            <span className="label">Pièce (légende)</span>
            <input name="label" list="photo-labels" className="field" placeholder="ex. Salon" />
            <datalist id="photo-labels">
              {PLACEHOLDER_LABELS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </label>
          <SubmitButton pendingText="Envoi en cours…">Envoyer</SubmitButton>
          <ActionMessage state={state} />
        </form>
      </Card>

      <Card
        title={`Galerie (${items.length})`}
        description="Glissez avec la poignée ⋮⋮ pour changer l'ordre d'affichage. L'étoile désigne la photo de couverture (affichée en grand sur l'accueil)."
        className="lg:col-span-2"
      >
        {saved && <p className="mb-3 text-sm text-emerald-700">{saved}</p>}
        {items.length === 0 ? (
          <div className="rounded-md bg-ecume p-8 text-center text-sm text-granite">
            Aucune photo pour l&apos;instant : le site affiche des emplacements libellés ({PLACEHOLDER_LABELS.join(", ")}). Donnez la même légende à vos photos pour
            qu&apos;elles apparaissent au bon endroit sur la page « Le logement ».
          </div>
        ) : (
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
            {items.map((p, i) => (
              <PhotoRow key={p.id} photo={p} index={i} onDrop={() => saveOrder(items)} />
            ))}
          </Reorder.Group>
        )}
      </Card>
    </div>
  );
}

function PhotoRow({ photo, index, onDrop }: { photo: Photo; index: number; onDrop: () => void }) {
  const controls = useDragControls();
  const [pending, start] = useTransition();
  const [label, setLabel] = useState(photo.label);

  return (
    <Reorder.Item
      value={photo}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      className={`flex items-center gap-3 rounded-md border bg-white p-2 ${photo.is_cover ? "border-phare ring-2 ring-phare/40" : "border-marine/10"} ${pending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab touch-none px-1 text-lg leading-none text-granite active:cursor-grabbing"
        aria-label="Déplacer la photo"
      >
        ⋮⋮
      </button>
      <span className="w-5 text-center text-xs text-granite">{index + 1}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.label} className="h-16 w-24 shrink-0 rounded object-cover" loading="lazy" />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label !== photo.label && start(() => labelPhotoAction(photo.id, label))}
        list="photo-labels"
        className="field min-w-0 flex-1 !py-2 text-sm"
        aria-label="Légende"
        placeholder="Légende (ex. La chambre)"
      />
      <button
        type="button"
        onClick={() => start(() => setCoverAction(photo.id))}
        className={`rounded-md px-2 py-1.5 text-lg ${photo.is_cover ? "text-phare-2" : "text-marine/25 hover:text-phare-2"}`}
        title={photo.is_cover ? "Photo de couverture" : "Choisir comme couverture"}
        aria-label={photo.is_cover ? "Photo de couverture" : "Choisir comme couverture"}
        aria-pressed={photo.is_cover}
      >
        ★
      </button>
      <button
        type="button"
        onClick={() => confirm("Supprimer définitivement cette photo ?") && start(() => deletePhotoAction(photo.id))}
        className="rounded-md px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
      >
        Supprimer
      </button>
    </Reorder.Item>
  );
}
