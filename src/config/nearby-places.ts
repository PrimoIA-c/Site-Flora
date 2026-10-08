/**
 * Lieux autour du logement (données OpenStreetMap, octobre 2026).
 * Distances à vol d'oiseau depuis le 45 rue Georges Clemenceau ; temps de marche estimés.
 * Pour ajouter un lieu : copiez une ligne et changez le nom, la catégorie et les coordonnées.
 */
export type PlaceCategory = "plage" | "marche" | "commerce" | "table" | "patrimoine" | "transport";

export interface NearbyPlace {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  /** Distance affichée */
  distance: string;
  /** Temps de marche affiché */
  walk: string;
  note?: string;
}

export const CATEGORIES: Record<PlaceCategory, { label: string; color: string }> = {
  plage: { label: "Plages", color: "#2f7fa8" },
  marche: { label: "Marchés", color: "#d9725a" },
  commerce: { label: "Commerces", color: "#e7a42d" },
  table: { label: "Tables", color: "#7a5c99" },
  patrimoine: { label: "Patrimoine", color: "#0e2338" },
  transport: { label: "Transports", color: "#6b7178" },
};

export const NEARBY_PLACES: NearbyPlace[] = [
  { name: "Plage des Bas-Sablons", category: "plage", lat: 48.63829, lng: -2.02034, distance: "250 m", walk: "4 min", note: "Piscine d'eau de mer à marée basse" },
  { name: "Plage de Solidor", category: "plage", lat: 48.634, lng: -2.02283, distance: "730 m", walk: "12 min" },
  { name: "Plage du Môle", category: "plage", lat: 48.64509, lng: -2.0314, distance: "1,2 km", walk: "20 min" },

  { name: "Marché de Saint-Servan", category: "marche", lat: 48.63782, lng: -2.01686, distance: "230 m", walk: "4 min", note: "Mardi et vendredi matin" },
  { name: "Poissonnerie Mathieu Crustacés", category: "marche", lat: 48.63973, lng: -2.01536, distance: "190 m", walk: "4 min" },

  { name: "Pharmacie", category: "commerce", lat: 48.63894, lng: -2.01761, distance: "90 m", walk: "2 min" },
  { name: "Pâtisserie Stéphane Denis", category: "commerce", lat: 48.6387, lng: -2.01726, distance: "130 m", walk: "2 min" },
  { name: "Boulangerie Mariette", category: "commerce", lat: 48.63768, lng: -2.0166, distance: "250 m", walk: "5 min" },
  { name: "Carrefour City", category: "commerce", lat: 48.63661, lng: -2.01505, distance: "410 m", walk: "7 min", note: "Ouvert 7 j/7" },

  { name: "Effet Mer", category: "table", lat: 48.63998, lng: -2.01861, distance: "60 m", walk: "1 min" },
  { name: "Le Bac O' Sablons", category: "table", lat: 48.63793, lng: -2.01946, distance: "230 m", walk: "4 min" },
  { name: "Port Solidor et ses crêperies", category: "table", lat: 48.63531, lng: -2.02313, distance: "750 m", walk: "13 min" },

  { name: "Tour Solidor", category: "patrimoine", lat: 48.63403, lng: -2.02607, distance: "870 m", walk: "15 min" },
  { name: "Cité d'Alet & Mémorial 39-45", category: "patrimoine", lat: 48.63728, lng: -2.02923, distance: "900 m", walk: "15 min" },
  { name: "Intra-Muros (Grand' Porte)", category: "patrimoine", lat: 48.64898, lng: -2.02375, distance: "1,1 km", walk: "20 min" },

  { name: "Arrêt de bus Clemenceau", category: "transport", lat: 48.63922, lng: -2.01767, distance: "60 m", walk: "1 min" },
  { name: "Gare maritime (ferries)", category: "transport", lat: 48.64152, lng: -2.01973, distance: "240 m", walk: "4 min" },
];
