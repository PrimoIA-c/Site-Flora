import Link from "next/link";
import { BookingTable } from "@/components/admin/BookingTable";
import { Card } from "@/components/admin/ui";
import { diffDays, formatEUR, formatShort, todayParis } from "@/lib/dates";
import { expirePendingBookings, listBookings } from "@/lib/db";

export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  await expirePendingBookings();
  const bookings = await listBookings();
  const today = todayParis();
  const year = today.slice(0, 4);

  const paid = bookings.filter((b) => b.status === "paid");
  const upcoming = paid.filter((b) => b.check_out >= today).sort((a, b) => a.check_in.localeCompare(b.check_in));
  const past = paid.filter((b) => b.check_out < today).sort((a, b) => b.check_in.localeCompare(a.check_in));
  const pending = bookings.filter((b) => b.status === "pending");
  const current = upcoming.find((b) => b.check_in <= today && b.check_out > today);

  const revenueYear = paid.filter((b) => b.check_in.startsWith(year)).reduce((s, b) => s + b.total, 0);
  const revenueAll = paid.reduce((s, b) => s + b.total, 0);
  const upcomingRevenue = upcoming.reduce((s, b) => s + b.total, 0);
  const nightsYear = paid.filter((b) => b.check_in.startsWith(year)).reduce((s, b) => s + b.nights, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl">Bonjour 👋</h1>
        <p className="mt-2 text-granite">
          {current
            ? `En ce moment : ${current.guest_name}, départ le ${formatShort(current.check_out)}.`
            : upcoming[0]
              ? `Prochaine arrivée : ${upcoming[0].guest_name}, le ${formatShort(upcoming[0].check_in)} (dans ${diffDays(today, upcoming[0].check_in)} jours).`
              : "Aucune réservation à venir pour le moment."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={`Chiffre d'affaires ${year}`} value={formatEUR(revenueYear)} />
        <Stat label="À venir (encaissé)" value={formatEUR(upcomingRevenue)} hint={`${upcoming.length} séjour(s)`} />
        <Stat label={`Nuits louées ${year}`} value={String(nightsYear)} />
        <Stat label="Total encaissé" value={formatEUR(revenueAll)} hint={`${paid.length} réservation(s) payée(s)`} />
      </div>

      {pending.length > 0 && (
        <Card title="Paiements en cours" description="Clients en train de payer : leurs dates sont bloquées 30 minutes maximum.">
          <BookingTable bookings={pending} />
        </Card>
      )}

      <Card title="Séjours à venir">
        {upcoming.length ? <BookingTable bookings={upcoming} /> : <p className="text-sm text-granite">Rien de prévu pour l&apos;instant.</p>}
      </Card>

      <Card title="Séjours passés">
        {past.length ? <BookingTable bookings={past.slice(0, 10)} /> : <p className="text-sm text-granite">Aucun séjour passé.</p>}
        {past.length > 10 && (
          <Link href="/admin/reservations" className="mt-4 inline-block text-sm font-semibold underline">
            Voir tout l&apos;historique
          </Link>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-marine/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-granite">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-granite">{hint}</p>}
    </div>
  );
}
