import type { Metadata } from "next";
import { CancelledView } from "@/components/booking/CancelledView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default async function CancelledPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const { booking } = await searchParams;
  return (
    <div lang="en">
      <CancelledView booking={booking} lang="en" />
    </div>
  );
}
