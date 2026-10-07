import { MotionProvider } from "@/components/motion/MotionProvider";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CookieBanner } from "@/components/site/CookieBanner";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-phare focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <SmoothScroll />
      <CustomCursor />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <CookieBanner />
    </MotionProvider>
  );
}
