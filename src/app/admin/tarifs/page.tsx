import { PricingForms } from "@/components/admin/PricingForms";
import { getSettings, listPeriods } from "@/lib/db";

export const metadata = { title: "Tarifs" };

export default async function TarifsPage() {
  const [settings, periods] = await Promise.all([getSettings(), listPeriods()]);
  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Tarifs</h1>
      <PricingForms settings={settings} periods={periods} />
    </div>
  );
}
