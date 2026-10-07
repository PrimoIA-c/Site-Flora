import { NextResponse } from "next/server";
import { getAvailabilityData } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Nuits indisponibles + tarifs, pour rafraîchir le calendrier côté client. */
export async function GET() {
  return NextResponse.json(await getAvailabilityData(), { headers: { "Cache-Control": "no-store" } });
}
