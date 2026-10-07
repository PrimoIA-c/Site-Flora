import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage, T } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales" updated="[À COMPLÉTER : date]">
      <p>
        Conformément à l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN), voici
        l&apos;identité des intervenants du site <strong>{siteConfig.name}</strong>.
      </p>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Nom et prénom (ou raison sociale) : <T /></li>
        <li>Statut : <T>particulier loueur en meublé non professionnel / entreprise — préciser</T></li>
        <li>Adresse : <T /></li>
        <li>E-mail : <T /> · Téléphone : <T /></li>
        <li>SIRET (si applicable) : <T /></li>
        <li>N° de TVA intracommunautaire (si applicable) : <T /></li>
        <li>Directeur de la publication : <T /></li>
      </ul>

      <h2>Meublé de tourisme</h2>
      <p>
        Logement situé à {siteConfig.location.city} ({siteConfig.location.address}). Numéro d&apos;enregistrement de la déclaration de meublé de
        tourisme, obligatoire à Saint-Malo : <strong>{siteConfig.registrationNumber}</strong>.
      </p>
      <p>
        Classement « meublé de tourisme » : <T>non classé / nombre d&apos;étoiles et date</T>. La taxe de séjour est collectée pour le compte
        de la commune de Saint-Malo et reversée par le loueur (ou par la plateforme de paiement, le cas échéant).
      </p>

      <h2>Hébergement</h2>
      <ul>
        <li>
          Site hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.
        </li>
        <li>
          Base de données et photos hébergées par <strong>Supabase Inc.</strong> — supabase.com — région d&apos;hébergement : <T>ex. Europe (Paris / Francfort)</T>.
        </li>
      </ul>

      <h2>Paiement</h2>
      <p>
        Les paiements sont traités par <strong>Stripe Payments Europe Ltd.</strong> (Dublin, Irlande). Aucune donnée bancaire ne transite par nos
        serveurs ni n&apos;y est conservée.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, photographies et éléments graphiques de ce site sont la propriété de l&apos;éditeur, sauf mention contraire. Toute reproduction sans
        autorisation est interdite. Crédits photos : <T />.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        Conformément aux articles L.612-1 et suivants du Code de la consommation, le client peut recourir gratuitement à un médiateur de la
        consommation : <T>nom et coordonnées du médiateur, si le loueur est un professionnel</T>. Plateforme européenne de règlement en ligne des
        litiges : ec.europa.eu/consumers/odr.
      </p>
    </LegalPage>
  );
}
