export type Lang = "fr" | "en";

/** Choisit le texte selon la langue : t(lang, "Bonjour", "Hello"). */
export const t = (lang: Lang, fr: string, en: string) => (lang === "en" ? en : fr);

/** Traduction en anglais des messages d'erreur renvoyés par le serveur (rédigés en français). */
const ERRORS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Choisissez vos dates d'arrivée et de départ\.$/, () => "Choose your arrival and departure dates."],
  [/^Choisissez vos dates\.$/, () => "Choose your dates."],
  [/^La date d'arrivée est déjà passée\.$/, () => "The arrival date is in the past."],
  [/^Le logement accueille de 1 à (\d+) adultes\.$/, (m) => `The apartment sleeps 1 to ${m[1]} adults.`],
  [/^Le logement accueille jusqu'à (\d+) enfants\.$/, (m) => `The apartment sleeps up to ${m[1]} children.`],
  [/^Séjour minimum : (\d+) nuits pour ces dates\.$/, (m) => `Minimum stay: ${m[1]} nights for these dates.`],
  [/^Pour un séjour de plus de 60 nuits, contactez-nous\.$/, () => "For stays longer than 60 nights, please contact us."],
  [/^Certaines nuits de ce séjour ne sont plus disponibles\.$/, () => "Some nights of this stay are no longer available."],
  [/^Le paiement en ligne n'est pas encore configuré/, () => "Online payment is not set up yet."],
  [/^Ces dates viennent d'être réservées/, () => "These dates have just been booked. Please choose other dates."],
  [/^Le paiement n'a pas pu être initialisé/, () => "Payment could not be started. Please try again in a moment."],
  [/^Requête invalide\.$/, () => "Invalid request."],
  [/^Dates invalides\.$/, () => "Invalid dates."],
  [/^Indiquez votre nom\.$/, () => "Please enter your name."],
  [/^Adresse e-mail invalide\.$/, () => "Invalid e-mail address."],
  [/^Numéro de téléphone invalide\.$/, () => "Invalid phone number."],
  [/^Merci d'accepter les conditions générales de location\.$/, () => "Please accept the rental terms and conditions."],
  [/^Merci de remplir votre nom/, () => "Please fill in your name, a valid e-mail and a message (at least 10 characters)."],
  [/^Une erreur est survenue\.$/, () => "Something went wrong."],
  [/^Connexion impossible/, () => "Connection failed. Check your network and try again."],
];

export function translateError(lang: Lang, msg: string): string {
  if (lang !== "en") return msg;
  for (const [re, fn] of ERRORS) {
    const m = msg.match(re);
    if (m) return fn(m);
  }
  return msg;
}

/** Légendes de photos en anglais (« La chambre, côté rangements » → « Bedroom, storage »). */
const PHOTO_WORDS: Record<string, string> = {
  "le salon": "Living room",
  "la chambre": "Bedroom",
  "la cuisine": "Kitchen",
  "la salle d'eau": "Shower room",
  "le logement": "The apartment",
  "coin canapé": "sofa corner",
  "coin repas": "dining area",
  "côté télévision": "TV corner",
  "côté rangements": "storage",
  "l'escalier": "staircase",
  "vue d'ensemble": "overview",
  "plan de travail": "worktop",
  douche: "shower",
  toilettes: "toilet",
};

export function photoLabelEn(label: string): string {
  return label
    .split(",")
    .map((part) => PHOTO_WORDS[part.trim().toLowerCase()] ?? part.trim())
    .join(", ");
}
