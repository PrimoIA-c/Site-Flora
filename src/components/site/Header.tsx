"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/motion/Ripple";

const NAV = [
  { href: "/logement", label: "Le logement" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/#quartier", label: "Le quartier" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-500 ${
        overHero ? "text-ecume" : "bg-ecume/90 text-marine shadow-[0_1px_0_rgba(14,35,56,0.08)] backdrop-blur-md"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="group flex items-center gap-3" aria-label={`${siteConfig.name} — accueil`}>
          <LighthouseMark />
          <span className="font-serif text-lg tracking-tight md:text-xl">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="group relative text-sm font-medium">
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-tide)] group-hover:scale-x-100" />
            </Link>
          ))}
          <ButtonLink href="/reserver" className="!px-5 !py-2.5">
            Réserver
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menu mobile"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-marine/10 bg-ecume md:hidden"
          >
            <ul className="container-x flex flex-col py-6">
              {[...NAV, { href: "/reserver", label: "Réserver" }].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-3 font-serif text-3xl" onClick={() => setOpen(false)}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Petit phare stylisé servant de logo. */
export function LighthouseMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M13 26 L14.5 11 H17.5 L19 26 Z" fill="currentColor" />
      <rect x="13.5" y="8" width="5" height="3" rx="0.8" fill="var(--color-phare)" />
      <path d="M18.5 9.5 L27 6 V13 Z" fill="var(--color-phare)" opacity="0.55" className="origin-[16px_9.5px] transition-transform duration-700 group-hover:rotate-[-8deg]" />
      <path d="M9 26 H23" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
