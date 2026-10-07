import { buildIcsExport } from "@/lib/ical";

export const dynamic = "force-dynamic";

/**
 * Flux iCal public et anonymisé : /calendrier.ics
 * À coller dans Airbnb (« Importer un calendrier ») ou Booking (« Synchronisation »).
 */
export async function GET() {
  return new Response(await buildIcsExport(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calendrier.ics"',
      "Cache-Control": "no-store",
    },
  });
}
