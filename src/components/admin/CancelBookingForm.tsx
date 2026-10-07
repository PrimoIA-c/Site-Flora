"use client";

import { useActionState, useState } from "react";
import { cancelBookingAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, SubmitButton } from "./ui";

export function CancelBookingForm({ id, canRefund, total }: { id: string; canRefund: boolean; total: string }) {
  const [state, action] = useActionState<ActionState | null, FormData>(cancelBookingAction, null);
  const [confirm, setConfirm] = useState(false);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm) {
          e.preventDefault();
          setConfirm(true);
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={id} />
      <label className="block max-w-lg">
        <span className="label">Motif (facultatif, interne)</span>
        <input name="reason" className="field" placeholder="ex. demande du client" />
      </label>
      {canRefund && (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="refund" defaultChecked className="h-4 w-4 accent-[var(--color-marine)]" />
          Rembourser le client via Stripe ({total})
        </label>
      )}
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-[var(--color-marine)]" />
        Prévenir le client par e-mail
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton variant="danger" pendingText="Annulation…">
          {confirm ? "Confirmer l'annulation" : "Annuler la réservation"}
        </SubmitButton>
        {confirm && (
          <button type="button" onClick={() => setConfirm(false)} className="text-sm text-granite underline">
            Garder la réservation
          </button>
        )}
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
