"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LighthouseMark } from "./Header";
import { CookieSettingsLink } from "./CookieBanner";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

export function Footer() {
  const lang = useLang();
  const en = lang === "en";
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-marine text-ecume">
      {/* Laisse de mer : le pied de page « monte » en vague sur la section précédente */}
      <svg aria-hidden viewBox="0 0 1440 40" preserveAspectRatio="none" className="absolute inset-x-0 -top-[23px] h-6 w-full text-marine">
        <path d="M0 40 V22 C 240 6, 480 36, 720 20 C 960 4, 1200 34, 1440 14 V40 Z" fill="currentColor" />
      </svg>

      <div className="container-x grid gap-12 pb-10 pt-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <LighthouseMark className="h-9 w-9" />
            <span className="font-serif text-2xl">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-ecume/70">{en ? "A characterful apartment in Saint-Servan, four minutes from the beach" : siteConfig.tagline}.</p>
          <p className="mt-6 text-sm text-ecume/60">
            {t(lang, "Meublé de tourisme — n° d'enregistrement", "Holiday rental — registration no.")} : <span className="text-ecume">{siteConfig.registrationNumber}</span>
            <br />
            {t(lang, "Taxe de séjour collectée pour le compte de la Ville de Saint-Malo.", "Tourist tax collected on behalf of the City of Saint-Malo.")}
          </p>
        </div>

        <nav className="md:col-span-3" aria-label={t(lang, "Pages du site", "Site pages")}>
          <p className="eyebrow mb-4 text-phare">{t(lang, "Séjourner", "Your stay")}</p>
          <ul className="space-y-2 text-ecume/80">
            <li><Link className="hover:text-ecume" href={en ? "/en#apartment" : "/logement"}>{t(lang, "Le logement", "The apartment")}</Link></li>
            <li><Link className="hover:text-ecume" href={en ? "/en/gallery" : "/galerie"}>{t(lang, "Galerie", "Photos")}</Link></li>
            <li><Link className="hover:text-ecume" href={en ? "/en#faq" : "/infos-pratiques"}>{t(lang, "Infos pratiques", "Practical info")}</Link></li>
            <li><Link className="hover:text-ecume" href={en ? "/en/book" : "/reserver"}>{t(lang, "Réserver", "Book")}</Link></li>
            <li><Link className="hover:text-ecume" href={en ? "/en/contact" : "/contact"}>Contact</Link></li>
            <li><Link className="hover:text-ecume" href={en ? "/" : "/en"} hrefLang={en ? "fr" : "en"}>{en ? "Version française" : "English version"}</Link></li>
            <li><Link className="hover:text-ecume" href="/admin" rel="nofollow">Admin</Link></li>
          </ul>
        </nav>

        <nav className="md:col-span-4" aria-label={t(lang, "Informations légales", "Legal information")}>
          <p className="eyebrow mb-4 text-phare">{t(lang, "Informations", "Legal (in French)")}</p>
          <ul className="space-y-2 text-ecume/80">
            <li><Link className="hover:text-ecume" href="/mentions-legales">{t(lang, "Mentions légales", "Legal notice")}</Link></li>
            <li><Link className="hover:text-ecume" href="/conditions-generales">{t(lang, "Conditions générales de location", "Rental terms")}</Link></li>
            <li><Link className="hover:text-ecume" href="/confidentialite">{t(lang, "Politique de confidentialité", "Privacy policy")}</Link></li>
            <li><Link className="hover:text-ecume" href="/cookies">{t(lang, "Politique de cookies", "Cookie policy")}</Link></li>
            <li><CookieSettingsLink /></li>
          </ul>
        </nav>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-ecume/10 py-6 text-xs text-ecume/50 md:flex-row md:justify-between">
        <span>© {year} {siteConfig.name} · {siteConfig.location.city}</span>
        <span>{t(lang, "Paiement sécurisé par Stripe", "Secure payment by Stripe")}</span>
      </div>
    </footer>
  );
}
