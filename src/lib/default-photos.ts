/**
 * Photos du logement livrées avec le site (dossier public/photos).
 * Elles s'affichent tant qu'aucune photo n'a été ajoutée depuis Admin → Photos.
 * Dès qu'une photo est ajoutée dans l'admin, ce sont celles de l'admin qui s'affichent.
 *
 * Le libellé sert aussi à placer la photo à côté de la bonne pièce sur la page « Le logement »
 * (même nom que la pièce dans Admin → Paramètres). Une légende qui COMMENCE par le nom
 * de la pièce (« La chambre, côté rangements ») ajoute une photo secondaire à côté de cette pièce.
 */
import type { Photo } from "./types";

const files: [string, string][] = [
  ["01-salon-sejour.jpg", "Le salon"],
  ["02-salon-canape.jpg", "Le salon, coin canapé"],
  ["03-chambre-lit.jpg", "La chambre"],
  ["04-coin-repas-cheminee.jpg", "Le salon, coin repas"],
  ["05-salon-television.jpg", "Le salon, côté télévision"],
  ["06-chambre-commode.jpg", "La chambre, côté rangements"],
  ["07-escalier-chambre.jpg", "La chambre, l'escalier"],
  ["08-cuisine.jpg", "La cuisine"],
  ["09-cuisine-vue-ensemble.jpg", "La cuisine, vue d'ensemble"],
  ["10-cuisine-evier.jpg", "La cuisine, plan de travail"],
  ["11-salle-d-eau.jpg", "La salle d'eau"],
  ["12-douche.jpg", "La salle d'eau, douche"],
  ["13-wc.jpg", "La salle d'eau, toilettes"],
];

export const defaultPhotos: Photo[] = files.map(([file, label], i) => ({
  id: `default-${i + 1}`,
  storage_path: `public/photos/${file}`,
  url: `/photos/${file}`,
  label,
  position: i,
  is_cover: i === 0,
}));
