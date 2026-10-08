import "./globals.css";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/stripe";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${siteConfig.name} — Appartement de caractère à Saint-Malo, près de la plage`, template: `%s · ${siteConfig.name}` },
  description:
    "Appartement de caractère pour 4 personnes à Saint-Servan, Saint-Malo, à 250 m de la plage des Bas-Sablons et du marché. Disponibilités en temps réel et réservation en ligne sécurisée, à partir de 90 € la nuit.",
  openGraph: { type: "website", locale: siteConfig.locale, siteName: siteConfig.name },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0e2338",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Polices auto-hébergées (public/fonts) : on précharge celles du premier écran ; l'italique se charge à la demande. */}
        <link rel="preload" href="/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/fraunces-soft.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
