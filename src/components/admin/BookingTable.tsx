import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { formatEUR, formatShort } from "@/lib/dates";
import type { Booking } from "@/lib/types";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="-mx-5 overflow-x-auto md:mx-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-granite">
          <tr className="border-b border-marine/10">
            <th className="px-5 py-2 font-semibold md:px-2">Client</th>
            <th className="px-2 py-2 font-semibold">Dates</th>
            <th className="px-2 py-2 font-semibold">Voyageurs</th>
            <th className="px-2 py-2 text-right font-semibold">Montant</th>
            <th className="px-2 py-2 font-semibold">Statut</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-marine/5 last:border-0 hover:bg-ecume">
              <td className="px-5 py-3 md:px-2">
                <p className="font-semibold">{b.guest_name}</p>
                <p className="text-xs text-granite">{b.guest_email}</p>
              </td>
              <td className="px-2 py-3 whitespace-nowrap">
                {formatShort(b.check_in)} → {formatShort(b.check_out)}
                <span className="block text-xs text-granite">{b.nights} nuit(s)</span>
              </td>
              <td className="px-2 py-3">
                {b.adults} ad. {b.children ? `+ ${b.children} enf.` : ""}
              </td>
              <td className="px-2 py-3 text-right font-semibold">{formatEUR(b.total)}</td>
              <td className="px-2 py-3">
                <StatusBadge status={b.status} />
              </td>
              <td className="px-2 py-3 text-right">
                <Link href={`/admin/reservations/${b.id}`} className="rounded-md border border-marine/15 px-3 py-1.5 text-xs font-semibold hover:bg-marine hover:text-ecume">
                  Détail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
