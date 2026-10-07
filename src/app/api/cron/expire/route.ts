import { NextResponse } from "next/server";
import { expirePendingBookings } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Nettoyage quotidien des réservations « en attente » expirées. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json({ expired: await expirePendingBookings() });
}
