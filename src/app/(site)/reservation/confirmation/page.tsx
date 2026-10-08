import type { Metadata } from "next";
import { ConfirmationView } from "@/components/booking/ConfirmationView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Réservation confirmée", robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return <ConfirmationView session_id={session_id} />;
}
