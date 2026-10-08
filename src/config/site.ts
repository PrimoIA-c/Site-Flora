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
    district: "Saint-Servan",
    region: "Bretagne",
    address: "45 rue Georges Clemenceau, 35400 Saint-Malo",
    // Coordonnées de l'adresse (Base Adresse Nationale)
    lat: 48.639738,
    lng: -2.017929,
    coordinates: "48°38′23″ N · 2°01′05″ O",
  },

  /** Distances à vol d'oiseau depuis le logement, temps de marche estimés (données OpenStreetMap). */
  nearby: [
    { label: "Plage des Bas-Sablons", distance: "250 m", minutes: "4 min à pied" },
    { label: "Marché de Saint-Servan", distance: "230 m", minutes: "4 min à pied" },
    { label: "Boulangeries", distance: "130 m", minutes: "2 min à pied" },
    { label: "Tour Solidor", distance: "900 m", minutes: "15 min à pied" },
    { label: "Intra-Muros", distance: "1,1 km", minutes: "20 min à pied" },
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
