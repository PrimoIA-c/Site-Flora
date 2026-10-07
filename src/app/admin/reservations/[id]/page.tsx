import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelBookingForm } from "@/components/admin/CancelBookingForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card } from "@/components/admin/ui";
import { formatEUR, formatLong } from "@/lib/dates";
import { getBooking } from "@/lib/db";

export const metadata = { title: "Détail de la réservation" };

const dt = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date(iso)) : "—";

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBooking(id);
  if (!b) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/reservations" className="text-sm text-granite hover:text-marine">
        ← Toutes les réservations
      </Link>
      <header className="flex flex-wrap items-center gap-4">
        <h1 className="text-4xl">{b.guest_name}</h1>
        <StatusBadge status={b.status} />
        <span className="text-sm text-granite">Réf. {b.id.slice(0, 8).toUpperCase()}</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Séjour" className="lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Item k="Arrivée" v={formatLong(b.check_in)} />
            <Item k="Départ" v={formatLong(b.check_out)} />
            <Item k="Durée" v={`${b.nights} nuit(s)`} />
            <Item k="Voyageurs" v={`${b.adults} adulte(s), ${b.children} enfant(s)`} />
          </dl>
          {b.message && (
            <div className="mt-6 rounded-md bg-ecume p-4 text-sm">
              <p className="mb-1 font-semibold">Message du client</p>
              <p className="whitespace-pre-wrap">{b.message}</p>
            </div>
          )}
        </Card>

        <Card title="Client">
          <dl className="space-y-4">
            <Item k="Nom" v={b.guest_name} />
            <Item k="E-mail" v={<a className="underline" href={`mailto:${b.guest_email}`}>{b.guest_email}</a>} />
            <Item k="Téléphone" v={b.guest_phone ? <a className="underline" href={`tel:${b.guest_phone.replace(/\s/g, "")}`}>{b.guest_phone}</a> : "—"} />
          </dl>
        </Card>

        <Card title="Montant" className="lg:col-span-2">
          <dl className="divide-y divide-marine/10 text-sm">
            <Row k="Hébergement" v={formatEUR(b.accommodation_total)} />
            <Row k="Ménage" v={formatEUR(b.cleaning_fee)} />
            <Row k="Taxe de séjour" v={formatEUR(b.tourist_tax)} />
            <Row k={<strong>Total</strong>} v={<strong className="font-serif text-2xl">{formatEUR(b.total)}</strong>} />
          </dl>
        </Card>

        <Card title="Historique">
          <dl className="space-y-3 text-sm">
            <Row k="Créée" v={dt(b.created_at)} />
            <Row k="Payée" v={dt(b.paid_at)} />
            <Row k="Annulée" v={dt(b.cancelled_at)} />
            {b.cancel_reason && <p className="text-granite">Motif : {b.cancel_reason}</p>}
            {b.stripe_payment_intent && (
              <a
                className="block text-xs underline"
                href={`https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.startsWith("sk_test") ? "test/" : ""}payments/${b.stripe_payment_intent}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir le paiement dans Stripe ↗
              </a>
            )}
          </dl>
        </Card>
      </div>

      {b.status !== "cancelled" && (
        <Card title="Annuler cette réservation" description="Les dates redeviennent immédiatement disponibles à la réservation.">
          <CancelBookingForm id={b.id} canRefund={b.status === "paid" && Boolean(b.stripe_payment_intent)} total={formatEUR(b.total)} />
        </Card>
      )}
    </div>
  );
}

function Item({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-granite">{k}</dt>
      <dd className="mt-1 first-letter:uppercase">{v}</dd>
    </div>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-granite">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
