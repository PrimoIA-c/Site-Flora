import Link from "next/link";
import { BookingTable } from "@/components/admin/BookingTable";
import { Card } from "@/components/admin/ui";
import { listBookings } from "@/lib/db";
import type { BookingStatus } from "@/lib/types";

export const metadata = { title: "Réservations" };

const TABS: { key: "all" | BookingStatus; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "paid", label: "Payées" },
  { key: "pending", label: "En attente" },
  { key: "cancelled", label: "Annulées" },
];

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut = "all" } = await searchParams;
  const all = await listBookings();
  const list = (statut === "all" ? all : all.filter((b) => b.status === statut)).sort((a, b) => b.check_in.localeCompare(a.check_in));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Réservations</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.key === "all" ? all.length : all.filter((b) => b.status === t.key).length;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/reservations" : `/admin/reservations?statut=${t.key}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${statut === t.key ? "bg-marine text-ecume" : "bg-white text-marine ring-1 ring-marine/10 hover:ring-marine/30"}`}
            >
              {t.label} <span className="opacity-60">({count})</span>
            </Link>
          );
        })}
      </div>
      <Card>{list.length ? <BookingTable bookings={list} /> : <p className="text-sm text-granite">Aucune réservation.</p>}</Card>
    </div>
  );
}
