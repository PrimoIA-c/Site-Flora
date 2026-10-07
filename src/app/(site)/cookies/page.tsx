import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { CookieSettingsButton } from "./settings-button";

export const metadata: Metadata = { title: "Politique de cookies" };

export default function Cookies() {
  return (
    <LegalPage title="Politique de cookies" updated="[À COMPLÉTER : date]">
      <p>
        Un cookie est un petit fichier déposé sur votre appareil lors de la visite d&apos;un site. Conformément aux recommandations de la CNIL, les
        traceurs non essentiels ne sont déposés qu&apos;avec votre accord.
      </p>

      <h2>Ce que nous utilisons</h2>
      <h3>Strictement nécessaires (sans consentement)</h3>
      <ul>
        <li>
          <strong>cookie-consent</strong> (stockage local) : mémorise votre choix concernant les cookies — 6 mois.
        </li>
        <li>
          <strong>Stripe</strong> : lors du paiement, sur la page sécurisée de Stripe, des cookies de prévention de la fraude sont déposés par Stripe
          (voir stripe.com/fr/cookie-settings).
        </li>
      </ul>
      <h3>Mesure d&apos;audience (avec consentement)</h3>
      <p>
        Aucun outil de mesure d&apos;audience n&apos;est actif à ce jour. Si nous en ajoutons un, il ne sera chargé qu&apos;après votre accord
        et cette page sera mise à jour.
      </p>

      <h2>Modifier votre choix</h2>
      <p>Vous pouvez revenir sur votre choix à tout moment :</p>
      <CookieSettingsButton />
      <p>Vous pouvez aussi configurer votre navigateur pour bloquer les cookies ; certaines fonctions (paiement) pourraient alors ne plus fonctionner.</p>
    </LegalPage>
  );
}
