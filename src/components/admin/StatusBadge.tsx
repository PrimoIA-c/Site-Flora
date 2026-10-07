import type { BookingStatus } from "@/lib/types";

const MAP: Record<BookingStatus, { label: string; cls: string }> = {
  paid: { label: "Payée", cls: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  pending: { label: "En attente", cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  cancelled: { label: "Annulée", cls: "bg-zinc-100 text-zinc-600 ring-zinc-200" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const s = MAP[status];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>{s.label}</span>;
}
