type Lang = "fr" | "en";

const PERKS: Record<Lang, { t: string; d: string; icon: string }[]> = {
  fr: [
    { t: "Sans frais de service", d: "Le prix affiché est le prix payé : aucune commission de plateforme ajoutée.", icon: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { t: "Paiement sécurisé", d: "Carte bancaire via Stripe, le même prestataire que les grandes plateformes.", icon: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" },
    { t: "En direct avec le propriétaire", d: "Une question, une demande particulière : on vous répond personnellement.", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    { t: "Confirmation immédiate", d: "Vos dates sont bloquées dès le paiement, confirmation par e-mail.", icon: "M20 6 9 17l-5-5" },
  ],
  en: [
    { t: "No service fees", d: "The price you see is the price you pay — no platform commission added.", icon: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { t: "Secure payment", d: "Card payment through Stripe, the same provider the big platforms use.", icon: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" },
    { t: "Talk to the owner", d: "Any question or special request gets a personal answer.", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    { t: "Instant confirmation", d: "Your dates are locked as soon as you pay, with an e-mail confirmation.", icon: "M20 6 9 17l-5-5" },
  ],
};

/** Les avantages de la réservation en direct (bandeau compact). */
export function DirectPerks({ lang = "fr", compact = false }: { lang?: Lang; compact?: boolean }) {
  return (
    <ul className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {PERKS[lang].map((p) => (
        <li key={p.t} className="flex gap-3 rounded-lg bg-white/70 p-4 ring-1 ring-marine/10">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-marine text-phare">
            <svg viewBox="0 0 24 24" aria-hidden className="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={p.icon} />
            </svg>
          </span>
          <span>
            <strong className="block text-[0.95rem]">{p.t}</strong>
            <span className="mt-0.5 block text-sm leading-snug text-marine/70">{p.d}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
