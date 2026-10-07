import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { AdminNav } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { isDemoMode } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// noindex : l'admin ne doit jamais apparaître dans les moteurs de recherche.
export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · Admin ${siteConfig.shortName}` },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // ← point d'accroche de la future authentification
  const warnings = [
    isDemoMode && "Mode démo : Supabase n'est pas configuré, les modifications sont gardées en mémoire et perdues au redémarrage.",
    !isStripeConfigured && "Stripe n'est pas configuré : le paiement en ligne est désactivé.",
    !process.env.RESEND_API_KEY && "Resend n'est pas configuré : les e-mails sont seulement affichés dans les journaux du serveur.",
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#f3f1ec] md:flex">
      <aside className="bg-marine p-4 text-ecume md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:p-5">
        <Link href="/admin" className="mb-4 block px-3 md:mb-8">
          <span className="block font-serif text-lg leading-tight">{siteConfig.name}</span>
          <span className="text-xs uppercase tracking-widest text-phare">Espace gérant</span>
        </Link>
        <AdminNav />
        <Link href="/" className="mt-auto hidden px-3 pt-6 text-sm text-ecume/60 hover:text-ecume md:block">
          ← Voir le site
        </Link>
      </aside>
      <div className="min-w-0 flex-1">
        {warnings.length > 0 && (
          <div className="space-y-1 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 md:px-10">
            {warnings.map((w) => (
              <p key={w}>⚠ {w}</p>
            ))}
          </div>
        )}
        <main className="mx-auto max-w-6xl p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
