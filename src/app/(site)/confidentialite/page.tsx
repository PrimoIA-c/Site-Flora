import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage, T } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité" updated="[À COMPLÉTER : date]">
      <p>
        Cette politique explique comment {siteConfig.name} collecte et utilise vos données personnelles, conformément au Règlement général sur la
        protection des données (RGPD, UE 2016/679) et à la loi Informatique et Libertés.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        <T>Nom, adresse</T> — contact : <T>e-mail</T>.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Réservation :</strong> nom, e-mail, téléphone, dates de séjour, nombre de voyageurs, message éventuel, montant payé.</li>
        <li><strong>Paiement :</strong> traité directement par Stripe ; nous ne voyons ni ne conservons vos numéros de carte.</li>
        <li><strong>Formulaire de contact :</strong> nom, e-mail, téléphone (facultatif), message.</li>
        <li><strong>Données techniques :</strong> journaux de connexion conservés par l&apos;hébergeur pour la sécurité du site.</li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Gérer votre réservation, votre séjour et le paiement — <em>exécution du contrat</em>.</li>
        <li>Vous envoyer les e-mails de confirmation et d&apos;information pratique — <em>exécution du contrat</em>.</li>
        <li>Tenir la comptabilité et reverser la taxe de séjour — <em>obligation légale</em>.</li>
        <li>Répondre à vos messages — <em>intérêt légitime</em>.</li>
      </ul>
      <p>Aucune donnée n&apos;est vendue, ni utilisée à des fins publicitaires.</p>

      <h2>Destinataires et sous-traitants</h2>
      <ul>
        <li>Stripe (paiement) — Stripe Payments Europe Ltd., Irlande.</li>
        <li>Supabase (base de données) — région <T>Europe</T>.</li>
        <li>Resend (envoi des e-mails) — États-Unis.</li>
        <li>Vercel (hébergement du site) — États-Unis.</li>
      </ul>
      <p>
        Les transferts hors de l&apos;Union européenne sont encadrés par les clauses contractuelles types de la Commission européenne et/ou le cadre
        de protection des données UE–États-Unis, selon le prestataire.
      </p>

      <h2>Durées de conservation</h2>
      <ul>
        <li>Données de réservation : durée de la relation, puis archivage <strong>10 ans</strong> pour les pièces comptables (Code de commerce, art. L.123-22).</li>
        <li>Messages de contact : <strong>3 ans</strong> après le dernier échange.</li>
        <li>Choix relatif aux cookies : <strong>6 mois</strong>.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité, ainsi que
        du droit de définir des directives relatives au sort de vos données après votre décès. Écrivez à <T>e-mail</T>. Vous pouvez également
        introduire une réclamation auprès de la CNIL (www.cnil.fr).
      </p>

      <h2>Sécurité</h2>
      <p>
        Le site est servi en HTTPS ; la base de données n&apos;est accessible qu&apos;avec une clé serveur secrète ; les paiements sont
        conformes à la norme PCI-DSS via Stripe.
      </p>
    </LegalPage>
  );
}
