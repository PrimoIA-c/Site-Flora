"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Bandeau de consentement aux cookies (recommandations CNIL : « Accepter » et « Refuser »
 * avec la même visibilité, choix conservé 6 mois, modifiable à tout moment).
 *
 * Le site n'utilise par défaut AUCUN cookie non essentiel. Si vous ajoutez un outil de mesure
 * d'audience, chargez-le uniquement quand `getConsent() === "accepted"` (voir /cookies).
 */
const KEY = "cookie-consent";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;
const EVENT = "open-cookie-banner";

export type Consent = "accepted" | "refused";

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw) as { value: Consent; at: number };
    return Date.now() - at < MAX_AGE_MS ? value : null;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(EVENT, reopen);
    return () => window.removeEventListener(EVENT, reopen);
  }, []);

  const choose = (value: Consent) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
    } catch {
      /* navigation privée */
    }
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Gestion des cookies"
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-lg bg-marine p-5 text-ecume shadow-2xl ring-1 ring-ecume/10 md:inset-x-auto md:bottom-6 md:right-6 md:p-6"
        >
          <p className="font-serif text-xl">Un petit mot sur les cookies</p>
          <p className="mt-2 text-sm leading-relaxed text-ecume/75">
            Ce site n&apos;utilise que les cookies indispensables à son fonctionnement et au paiement sécurisé. Avec votre accord,
            nous pourrions mesurer l&apos;audience de façon anonyme.{" "}
            <Link href="/cookies" className="underline underline-offset-2">
              En savoir plus
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => choose("refused")} className="rounded-full border border-ecume/40 px-5 py-2.5 text-sm font-semibold hover:bg-ecume/10">
              Refuser
            </button>
            <button onClick={() => choose("accepted")} className="rounded-full bg-phare px-5 py-2.5 text-sm font-semibold text-marine hover:bg-phare-2">
              Accepter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsLink() {
  return (
    <button type="button" className="text-left hover:text-ecume" onClick={() => window.dispatchEvent(new Event(EVENT))}>
      Gérer mes cookies
    </button>
  );
}
