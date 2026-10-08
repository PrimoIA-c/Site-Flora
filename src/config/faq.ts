/**
 * Infos pratiques / FAQ (français et anglais).
 * Les réponses marquées « À CONFIRMER » dans les commentaires sont à valider avec le propriétaire.
 */
import { siteConfig } from "./site";

export interface FaqGroup {
  title: string;
  items: { q: string; a: string }[];
}

const { checkInTime, checkOutTime } = siteConfig.defaults;

export const FAQ_FR: FaqGroup[] = [
  {
    title: "Arrivée & départ",
    items: [
      { q: "À quelle heure puis-je arriver ?", a: `Arrivée à partir de ${checkInTime}, départ avant ${checkOutTime}. Si vous avez besoin d'un autre horaire, écrivez-nous : nous faisons au mieux selon les réservations.` },
      // À CONFIRMER : boîte à clés ou remise en main propre
      { q: "Comment récupérer les clés ?", a: "Les modalités d'arrivée (remise des clés en main propre ou en autonomie) vous sont envoyées par e-mail quelques jours avant votre séjour, avec le code d'accès si besoin." },
      { q: "Le ménage est-il inclus ?", a: "Le ménage de fin de séjour est proposé en option au moment de la réservation. Sinon, merci de rendre le logement dans l'état où vous l'avez trouvé." },
    ],
  },
  {
    title: "Venir à Saint-Servan",
    items: [
      { q: "En train ?", a: "La gare SNCF de Saint-Malo (TGV direct depuis Paris) est à environ 1,3 km : une vingtaine de minutes à pied, ou quelques minutes en bus ou en taxi." },
      { q: "En ferry depuis l'Angleterre ou les îles Anglo-Normandes ?", a: "Le terminal ferry du Naye est à 4 minutes à pied de l'appartement : idéal pour une arrivée ou un départ en bateau." },
      // À CONFIRMER : stationnement
      { q: "Où se garer ?", a: "Le stationnement se fait dans les rues du quartier (zones gratuites et payantes selon les rues). Nous vous indiquons les meilleures options à proximité avant votre arrivée." },
      { q: "Y a-t-il des transports à proximité ?", a: "L'arrêt de bus « Clemenceau » est à une minute à pied et relie le quartier au reste de Saint-Malo." },
    ],
  },
  {
    title: "Sur place",
    items: [
      { q: "Le linge est-il fourni ?", a: "Oui : draps, serviettes et linge de maison sont fournis. Il ne manque que votre maillot de bain." },
      { q: "Combien de personnes peuvent dormir ?", a: "Jusqu'à 4 voyageurs : un lit double dans la chambre à l'étage et un canapé-lit 2 places dans le salon." },
      { q: "La cuisine est-elle équipée ?", a: "Entièrement : plaque de cuisson, four, lave-vaisselle, lave-linge, bouilloire, grille-pain et toute la vaisselle." },
      // À CONFIRMER : animaux
      { q: "Les animaux sont-ils acceptés ?", a: "Les animaux ne sont pas admis, merci de votre compréhension." },
    ],
  },
  {
    title: "Réservation & paiement",
    items: [
      { q: "Comment se passe le paiement ?", a: "Le paiement se fait en ligne par carte bancaire, de façon sécurisée via Stripe. Vos dates sont bloquées immédiatement et vous recevez une confirmation par e-mail." },
      { q: "Et si je dois annuler ?", a: "Les conditions d'annulation sont détaillées dans nos conditions générales de location. En cas de doute, contactez-nous avant de réserver." },
      { q: "Pourquoi réserver ici plutôt que sur une plateforme ?", a: "Pas de frais de service ajoutés, un échange direct avec le propriétaire et la même sécurité de paiement." },
    ],
  },
  {
    title: "Les marées",
    items: [
      { q: "Les marées, c'est important à Saint-Malo ?", a: "Oui ! Saint-Malo connaît parmi les plus grandes marées d'Europe : la mer peut monter et descendre de plus de 12 mètres. Elles changent complètement le paysage, à voir à marée haute comme à marée basse. Pour la baignade ou la pêche à pied, consultez toujours l'horaire officiel du jour." },
    ],
  },
];

export const FAQ_EN: FaqGroup[] = [
  {
    title: "Arrival & departure",
    items: [
      { q: "What time can I check in?", a: `Check-in from ${checkInTime}, check-out by ${checkOutTime}. Need a different time? Just ask and we'll do our best depending on other bookings.` },
      { q: "How do I get the keys?", a: "Arrival details (key handover in person or self check-in) are sent by e-mail a few days before your stay, with an access code if needed." },
      { q: "Is cleaning included?", a: "End-of-stay cleaning is available as an option when you book. Otherwise, please leave the apartment as you found it." },
    ],
  },
  {
    title: "Getting here",
    items: [
      { q: "By ferry from the UK or the Channel Islands?", a: "The Naye ferry terminal is a 4-minute walk from the apartment — perfect if you arrive or leave by boat." },
      { q: "By train?", a: "Saint-Malo railway station (direct high-speed trains from Paris) is about 1.3 km away: around 20 minutes on foot, or a few minutes by bus or taxi." },
      { q: "Where can I park?", a: "Parking is on the streets of the neighbourhood (free and paid zones depending on the street). We'll send you the best nearby options before you arrive." },
      { q: "Public transport?", a: "The “Clemenceau” bus stop is a 1-minute walk away, connecting the neighbourhood to the rest of Saint-Malo." },
    ],
  },
  {
    title: "The apartment",
    items: [
      { q: "Is bed linen provided?", a: "Yes: sheets, towels and household linen are provided. Just bring your swimsuit." },
      { q: "How many people can stay?", a: "Up to 4 guests: a double bed in the upstairs bedroom and a 2-person sofa bed in the living room." },
      { q: "Is the kitchen equipped?", a: "Fully: hob, oven, dishwasher, washing machine, kettle, toaster, plus all the crockery and cutlery." },
      { q: "Are pets allowed?", a: "Sorry, pets are not allowed." },
    ],
  },
  {
    title: "Booking & payment",
    items: [
      { q: "How do I pay?", a: "Online by card, securely through Stripe. Your dates are locked immediately and you get an e-mail confirmation." },
      { q: "Why book here rather than on a platform?", a: "No added service fees, direct contact with the owner, and the same secure payment." },
    ],
  },
  {
    title: "The tides",
    items: [
      { q: "Do the tides matter in Saint-Malo?", a: "Very much! Saint-Malo has some of the biggest tides in Europe — the sea can rise and fall by more than 12 metres, completely changing the landscape. For swimming or rock-pooling, always check the official tide times of the day." },
    ],
  },
];
