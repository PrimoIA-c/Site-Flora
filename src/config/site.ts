/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION CENTRALE DU SITE
 *  Pour changer le nom du site, modifiez uniquement `name` ci-dessous.
 *  Les textes éditables (titre du hero, description, équipements…)
 *  se modifient depuis l'admin → Paramètres (ils sont en base).
 *  Les valeurs ci-dessous servent aussi de valeurs par défaut.
 * ─────────────────────────────────────────────────────────────
 */
export const siteConfig = {
  name: "Super Papa de Flora",
  shortName: "Super Papa",
  tagline: "Un appartement à Saint-Malo, à cent pas de la mer",
  locale: "fr_FR",

  location: {
    city: "Saint-Malo",
    region: "Bretagne",
    address: "[À COMPLÉTER] rue, 35400 Saint-Malo",
    // Coordonnées approximatives (Intra-Muros / Grande Plage du Sillon) — à ajuster
    lat: 48.6493,
    lng: -2.0257,
  },

  nearby: [
    { label: "Plage", distance: "100 m", minutes: "1 min à pied" },
    { label: "Marché", distance: "200 m", minutes: "3 min à pied" },
    { label: "Boulangerie", distance: "150 m", minutes: "2 min à pied" },
    { label: "Remparts", distance: "800 m", minutes: "10 min à pied" },
  ],

  capacity: { adults: 2, children: 2 },

  /** Valeurs par défaut utilisées tant que la table `settings` est vide. */
  defaults: {
    basePrice: 90,
    cleaningFee: 50,
    minNights: 2,
    touristTaxPerAdultNight: 2.0, // [À VÉRIFIER] tarif en vigueur auprès de la mairie
    checkInTime: "16:00",
    checkOutTime: "10:00",
  },

  contact: {
    email: "[À COMPLÉTER]@exemple.fr",
    phone: "[À COMPLÉTER]",
  },

  /** Numéro d'enregistrement du meublé de tourisme (obligatoire à Saint-Malo). */
  registrationNumber: "[À COMPLÉTER] 35288 000000 XX",

  /** Durée de validité d'une réservation « en attente de paiement ». */
  pendingHoldMinutes: 30,

  currency: "eur",
} as const;

export type SiteConfig = typeof siteConfig;
