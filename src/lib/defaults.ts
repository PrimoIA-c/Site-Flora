/**
 * Contenus par défaut (utilisés en mode démo et quand un champ `settings` est vide).
 * Les modifications courantes se font depuis /admin/parametres.
 */
import { siteConfig } from "@/config/site";
import type { Settings } from "./types";

export const defaultRooms = [
  {
    name: "Le salon",
    text: "Pièce de vie sous poutres apparentes : canapé, fauteuil, télévision, table ronde pour quatre et ancienne cheminée en pierre.",
  },
  {
    name: "La chambre",
    text: "À l'étage, par un escalier en bois : chambre mansardée sous la charpente, lit double, commode, penderie et fenêtre de toit.",
  },
  {
    name: "La cuisine",
    text: "Cuisine équipée sous fenêtre de toit : plaque de cuisson, four, bouilloire, grille-pain, lave-linge et grand plan de travail.",
  },
  {
    name: "La salle d'eau",
    text: "Cabine de douche, meuble vasque avec miroir éclairé, toilettes, serviettes fournies.",
  },
];

export const defaultEquipment = [
  { label: "Wi-Fi fibre", enabled: true },
  { label: "Cuisine équipée", enabled: true },
  { label: "Lave-vaisselle", enabled: false },
  { label: "Lave-linge", enabled: true },
  { label: "Linge de lit et serviettes", enabled: true },
  { label: "Télévision", enabled: true },
  { label: "Lit bébé sur demande", enabled: true },
  { label: "Chaise haute", enabled: true },
  { label: "Jeux de plage", enabled: true },
  { label: "Fer à repasser", enabled: true },
  { label: "Place de parking", enabled: false },
  { label: "Balcon", enabled: false },
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
      "Un appartement pour quatre à Saint-Malo, à 100 m de la plage et 200 m du marché. Réservez vos dates et payez en ligne.",
    description:
      "Au calme, à deux pas des remparts, un appartement de caractère sous les toits : poutres apparentes, cheminée en pierre, chambre mansardée à l'étage et cuisine équipée baignée de lumière. La plage est à cent mètres — on y descend en maillot, on remonte les pieds pleins de sable.",
    rooms: defaultRooms,
    equipment: defaultEquipment,
    house_rules: defaultHouseRules,
    ical_import_urls: [],
    ical_last_sync: null,
  };
}
