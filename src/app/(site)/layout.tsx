import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CookieBanner } from "@/components/site/CookieBanner";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileBookBar } from "@/components/site/MobileBookBar";
import { getAvailabilityData } from "@/lib/db";
import { lowestPrice } from "@/lib/pricing";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const price = lowestPrice(await getAvailabilityData());
  return (
    <MotionProvider>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-phare focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <SmoothScroll />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      {/* Place réservée sous le pied de page pour la barre « Réserver » mobile */}
      <div aria-hidden className="h-24 bg-marine md:hidden" />
      <MobileBookBar price={price} />
      <CookieBanner />
    </MotionProvider>
  );
}
