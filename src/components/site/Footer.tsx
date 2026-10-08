import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LighthouseMark } from "./Header";
import { CookieSettingsLink } from "./CookieBanner";

export function Footer() {
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
          <p className="mt-4 max-w-sm text-ecume/70">{siteConfig.tagline}.</p>
          <p className="mt-6 text-sm text-ecume/60">
            Meublé de tourisme — n° d&apos;enregistrement : <span className="text-ecume">{siteConfig.registrationNumber}</span>
            <br />
            Taxe de séjour collectée pour le compte de la Ville de Saint-Malo.
          </p>
        </div>

        <nav className="md:col-span-3" aria-label="Pages du site">
          <p className="eyebrow mb-4 text-phare">Séjourner</p>
          <ul className="space-y-2 text-ecume/80">
            <li><Link className="hover:text-ecume" href="/logement">Le logement</Link></li>
            <li><Link className="hover:text-ecume" href="/galerie">Galerie</Link></li>
            <li><Link className="hover:text-ecume" href="/infos-pratiques">Infos pratiques</Link></li>
            <li><Link className="hover:text-ecume" href="/reserver">Réserver</Link></li>
            <li><Link className="hover:text-ecume" href="/en" hrefLang="en">English version</Link></li>
            <li><Link className="hover:text-ecume" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-ecume" href="/admin" rel="nofollow">Admin</Link></li>
          </ul>
        </nav>

        <nav className="md:col-span-4" aria-label="Informations légales">
          <p className="eyebrow mb-4 text-phare">Informations</p>
          <ul className="space-y-2 text-ecume/80">
            <li><Link className="hover:text-ecume" href="/mentions-legales">Mentions légales</Link></li>
            <li><Link className="hover:text-ecume" href="/conditions-generales">Conditions générales de location</Link></li>
            <li><Link className="hover:text-ecume" href="/confidentialite">Politique de confidentialité</Link></li>
            <li><Link className="hover:text-ecume" href="/cookies">Politique de cookies</Link></li>
            <li><CookieSettingsLink /></li>
          </ul>
        </nav>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-ecume/10 py-6 text-xs text-ecume/50 md:flex-row md:justify-between">
        <span>© {year} {siteConfig.name} · {siteConfig.location.city}</span>
        <span>Paiement sécurisé par Stripe</span>
      </div>
    </footer>
  );
}
