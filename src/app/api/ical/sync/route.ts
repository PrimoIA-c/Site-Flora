import { NextResponse } from "next/server";
import { syncIcalFeeds } from "@/lib/ical";

export const dynamic = "force-dynamic";

/** Synchronisation iCal planifiée (Vercel Cron, voir vercel.json). Protégée par CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json({ reports: await syncIcalFeeds() });
}
