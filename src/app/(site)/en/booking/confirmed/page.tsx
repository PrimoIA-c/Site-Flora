import type { Metadata } from "next";
import { ConfirmationView } from "@/components/booking/ConfirmationView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

export default async function ConfirmedPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return (
    <div lang="en">
      <ConfirmationView session_id={session_id} lang="en" />
    </div>
  );
}
