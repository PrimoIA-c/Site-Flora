import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { addDays, todayParis } from "@/lib/dates";
import { getSettings, listBlocked, listBookings } from "@/lib/db";
import { siteUrl } from "@/lib/stripe";

export const metadata = { title: "Calendrier" };

export default async function CalendrierPage() {
  const from = addDays(todayParis(), -62);
  const [bookings, blocked, settings] = await Promise.all([listBookings(), listBlocked(from), getSettings()]);
  const active = bookings
    .filter((b) => b.status !== "cancelled" && b.check_out >= from)
    .map(({ id, guest_name, status, check_in, check_out }) => ({ id, guest_name, status, check_in, check_out }));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Calendrier</h1>
      <AdminCalendar
        bookings={active}
        blocked={blocked}
        icalUrls={settings.ical_import_urls}
        lastSync={settings.ical_last_sync}
        exportUrl={`${siteUrl()}/calendrier.ics`}
      />
    </div>
  );
}
