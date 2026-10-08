/**
 * Contenus par défaut (utilisés en mode démo et quand un champ `settings` est vide).
 * Les modifications courantes se font depuis /admin/parametres.
 */
import { siteConfig } from "@/config/site";
import type { Settings } from "./types";

export const defaultRooms = [
  {
    name: "Le salon",
    text: "Pièce de vie sous poutres apparentes : canapé-lit pour deux couchages supplémentaires, fauteuil, télévision, table ronde pour quatre et ancienne cheminée en pierre.",
  },
  {
    name: "La chambre",
    text: "À l'étage, par un escalier en bois : chambre mansardée sous la charpente, lit double, commode, penderie et fenêtre de toit.",
  },
  {
    name: "La cuisine",
    text: "Cuisine équipée sous fenêtre de toit : plaque de cuisson, four, lave-vaisselle, lave-linge, bouilloire, grille-pain, vaisselle complète (assiettes, verres, couverts) et grand plan de travail.",
  },
  {
    name: "La salle d'eau",
    text: "Cabine de douche, meuble vasque avec miroir éclairé, toilettes, serviettes fournies.",
  },
];

export const defaultEquipment = [
  { label: "Wi-Fi", enabled: true },
  { label: "Cuisine équipée", enabled: true },
  { label: "Four", enabled: true },
  { label: "Lave-vaisselle", enabled: true },
  { label: "Lave-linge", enabled: true },
  { label: "Vaisselle complète", enabled: true },
  { label: "Canapé-lit 2 places", enabled: true },
  { label: "Linge de maison", enabled: true },
  { label: "Télévision", enabled: true },
  { label: "Fer à repasser", enabled: true },
];

export const defaultHouseRules = [
  "Arrivée à partir de 16 h, départ avant 10 h.",
  "Capacité maximale : 2 adultes et 2 enfants.",
  "Logement non-fumeur.",
  "Animaux non admis.",
  "Pas de fête ni d'événement ; calme après 22 h par respect du voisinage.",
  "Merci de trier les déchets (conteneurs au pied de l'immeuble).",
];

export function defaultSettings(): Settings {
  const d = siteConfig.defaults;
  return {
    base_price: d.basePrice,
    cleaning_fee: d.cleaningFee,
    min_nights: d.minNights,
    tourist_tax_per_adult_night: d.touristTaxPerAdultNight,
    alert_email: null, // à renseigner dans Admin → Paramètres
    hero_title: "La mer au bout de la rue",
    hero_subtitle:
      "Un appartement de caractère pour quatre à Saint-Servan, à 250\u00a0m de la plage des Bas-Sablons et du marché. Réservez vos dates et payez en ligne.",
    description:
      "Au cœur de Saint-Servan, un appartement de caractère sous les toits : poutres apparentes, cheminée en pierre, chambre mansardée à l'étage et cuisine équipée baignée de lumière. La plage des Bas-Sablons est à quatre minutes à pied, le marché juste à côté, et la tour Solidor au bout de la balade.",
    rooms: defaultRooms,
    equipment: defaultEquipment,
    house_rules: defaultHouseRules,
    ical_import_urls: [],
    ical_last_sync: null,
  };
}
