import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Paramètres" };

export default async function ParametresPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Paramètres</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
