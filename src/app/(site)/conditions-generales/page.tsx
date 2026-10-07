import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LegalPage, T } from "@/components/site/LegalPage";
import { formatEUR } from "@/lib/dates";
import { getSettings } from "@/lib/db";

export const revalidate = 300;
export const metadata: Metadata = { title: "Conditions générales de location" };

export default async function CGL() {
  const s = await getSettings();
  const { capacity, defaults } = siteConfig;
  return (
    <LegalPage title="Conditions générales de location" updated="[À COMPLÉTER : date]">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent la location saisonnière du meublé de tourisme « {siteConfig.name} », situé {siteConfig.location.address},
        enregistré sous le n° <strong>{siteConfig.registrationNumber}</strong>, entre le propriétaire (« le Loueur », <T>nom</T>) et toute personne
        effectuant une réservation (« le Locataire »). Toute réservation vaut acceptation sans réserve des présentes conditions.
      </p>

      <h2>2. Capacité</h2>
      <p>
        Le logement accueille au maximum <strong>{capacity.adults} adultes et {capacity.children} enfants</strong>. Ce nombre ne peut être dépassé, y
        compris ponctuellement. En cas de dépassement, le Loueur peut refuser l&apos;accès au logement sans remboursement.
      </p>

      <h2>3. Réservation et paiement</h2>
      <ul>
        <li>La réservation s&apos;effectue en ligne. Elle devient ferme à réception du paiement, confirmée par e-mail.</li>
        <li>
          Le prix comprend la location du logement, les charges (eau, électricité, chauffage, Wi-Fi) et le linge. Le ménage de fin de séjour est proposé
          en option ({formatEUR(s.cleaning_fee)}).
        </li>
        <li>
          <strong>Modalités de paiement :</strong> le montant total du séjour est réglé en ligne à la réservation par carte bancaire via Stripe.{" "}
          <T>Si vous préférez un acompte : préciser le pourcentage, sa qualification (acompte ou arrhes) et l&apos;échéance du solde</T>.
        </li>
        <li>Durée minimale de séjour : {s.min_nights} nuits, pouvant varier selon la période (indiquée lors de la réservation).</li>
        <li>
          Conformément à l&apos;article L.221-28 12° du Code de la consommation, le droit de rétractation de 14 jours ne s&apos;applique pas aux
          prestations d&apos;hébergement fournies à une date déterminée.
        </li>
      </ul>

      <h2>4. Taxe de séjour</h2>
      <p>
        La taxe de séjour est due par les personnes majeures et collectée pour le compte de la commune de Saint-Malo. Son montant est de{" "}
        <strong>{formatEUR(s.tourist_tax_per_adult_night)} par adulte et par nuit</strong> <T>montant à vérifier auprès de Saint-Malo Agglomération selon le classement du logement</T>. Les mineurs en sont exonérés.
      </p>

      <h2>5. Annulation</h2>
      <h3>Par le Locataire</h3>
      <p>Toute annulation doit être notifiée par écrit (e-mail). Barème de remboursement, hors frais de ménage remboursés intégralement :</p>
      <ul>
        <li>plus de <T>30</T> jours avant l&apos;arrivée : remboursement de <T>100 %</T> ;</li>
        <li>entre <T>30</T> et <T>14</T> jours : remboursement de <T>50 %</T> ;</li>
        <li>moins de <T>14</T> jours ou non-présentation : <T>aucun remboursement</T>.</li>
      </ul>
      <p>La taxe de séjour n&apos;est jamais due en cas d&apos;annulation. Une interruption de séjour ne donne lieu à aucun remboursement. Nous recommandons la souscription d&apos;une assurance annulation.</p>
      <h3>Par le Loueur</h3>
      <p>En cas d&apos;annulation par le Loueur, le Locataire est intégralement remboursé des sommes versées, <T>et indemnisé selon…</T>.</p>

      <h2>6. Dépôt de garantie (caution)</h2>
      <p>
        Un dépôt de garantie de <T>montant, ex. 300 €</T> est demandé <T>à l&apos;arrivée / par empreinte bancaire / par virement</T>. Il est restitué
        dans un délai maximal de <T>7</T> jours après le départ, déduction faite, sur justificatifs, des éventuelles dégradations, objets manquants ou
        frais de remise en état.
      </p>

      <h2>7. Arrivée et départ</h2>
      <ul>
        <li>Arrivée à partir de <strong>{defaults.checkInTime}</strong>, départ avant <strong>{defaults.checkOutTime}</strong>, sauf accord préalable.</li>
        <li>Modalités de remise des clés : <T>boîte à clés, accueil en personne…</T>, communiquées quelques jours avant l&apos;arrivée.</li>
        <li>Un état des lieux et un inventaire peuvent être réalisés à l&apos;arrivée et au départ.</li>
      </ul>

      <h2>8. Animaux</h2>
      <p>Les animaux <T>ne sont pas admis / sont admis sous conditions : préciser</T>.</p>

      <h2>9. Utilisation des lieux et dégradations</h2>
      <ul>
        <li>Le Locataire use paisiblement du logement et respecte le <Link href="/logement">règlement intérieur</Link> et le voisinage.</li>
        <li>Le logement est non-fumeur. Les fêtes et événements sont interdits.</li>
        <li>
          Toute dégradation, casse ou perte est à la charge du Locataire et doit être signalée sans délai. Le Locataire doit être couvert par une
          assurance responsabilité civile / villégiature.
        </li>
        <li>Le Locataire ne peut ni sous-louer, ni céder la location.</li>
      </ul>

      <h2>10. Fiche individuelle de police</h2>
      <p>
        En application de l&apos;article R.814-1 du CESEDA, les voyageurs de nationalité étrangère sont invités à remplir une fiche individuelle de
        police à leur arrivée.
      </p>

      <h2>11. Litiges</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité, le cas échéant
        via un médiateur de la consommation (voir <Link href="/mentions-legales">mentions légales</Link>).
      </p>
    </LegalPage>
  );
}
