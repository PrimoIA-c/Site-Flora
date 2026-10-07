# Super Papa de Flora — site de location saisonnière à Saint-Malo

Site complet de réservation en ligne pour un appartement (4 personnes, à 100 m de la plage) :
calendrier des disponibilités, paiement Stripe, e-mails automatiques, espace gérant, synchronisation Airbnb/Booking et pages légales françaises.

**Stack** : Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Stripe Checkout · Resend · Framer Motion + Lenis · Vercel.

> 💡 **Mode démo** : sans aucune clé, le site tourne déjà avec des données fictives en mémoire.
> Idéal pour le découvrir : `npm install && npm run dev`, puis http://localhost:3000 et http://localhost:3000/admin.

---

## Sommaire

1. [Installation locale](#1-installation-locale)
2. [Supabase (base de données + photos)](#2-supabase)
3. [Stripe (paiement)](#3-stripe)
4. [Resend (e-mails)](#4-resend)
5. [Déploiement sur Vercel](#5-déploiement-sur-vercel)
6. [Changer le nom du site](#6-changer-le-nom-du-site)
7. [Utiliser l'admin](#7-utiliser-ladmin)
8. [Synchronisation Airbnb / Booking (iCal)](#8-synchronisation-airbnb--booking-ical)
9. [Sécuriser l'admin](#9-sécuriser-ladmin)
10. [Check-list avant la mise en ligne](#10-check-list-avant-la-mise-en-ligne)
11. [Comment ça marche (technique)](#11-comment-ça-marche)

---

## 1. Installation locale

Prérequis : **Node.js 20 ou plus**.

```bash
npm install
cp .env.example .env.local      # puis remplissez les valeurs (voir sections suivantes)
npm run dev                     # http://localhost:3000
```

Commandes utiles : `npm run build` (compilation de production), `npm run typecheck`.

---

## 2. Supabase

1. Créez un compte sur [supabase.com](https://supabase.com) → **New project** (région conseillée : *West EU (Paris)* ou *Central EU (Frankfurt)*).
2. Dans le projet : **SQL Editor → New query**, collez le contenu de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Cela crée les tables `bookings`, `blocked_dates`, `pricing`, `photos`, `settings` et le bucket de stockage public `photos`.
3. *(Facultatif)* Nouvelle requête avec [`supabase/seed.sql`](supabase/seed.sql) → **Run** pour charger des réservations et dates bloquées de démonstration.
   Le bas du fichier contient les requêtes pour tout effacer avant la mise en ligne.
4. **Project Settings → API**, copiez dans `.env.local` :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ clé secrète, jamais dans du code public.

Redémarrez `npm run dev` : le bandeau « Mode démo » disparaît de l'admin.

---

## 3. Stripe

1. Créez un compte sur [stripe.com](https://stripe.com). Restez en **mode test** tant que tout n'est pas vérifié.
2. **Développeurs → Clés API** : copiez la *clé secrète* (`sk_test_…`) dans `STRIPE_SECRET_KEY`.
3. **Webhook** (indispensable : c'est lui qui confirme les paiements) :
   - **En local** : installez la [Stripe CLI](https://stripe.com/docs/stripe-cli), puis
     ```bash
     stripe login
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
     La commande affiche un secret `whsec_…` → `STRIPE_WEBHOOK_SECRET`.
   - **En production** : **Développeurs → Webhooks → Ajouter un endpoint**
     - URL : `https://VOTRE-DOMAINE/api/webhooks/stripe`
     - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`
     - Copiez le *secret de signature* → `STRIPE_WEBHOOK_SECRET` (sur Vercel).
4. Testez avec la carte **4242 4242 4242 4242**, date future, CVC quelconque.
   Carte refusée : 4000 0000 0000 0002.

Pour passer en réel : activez votre compte Stripe, remplacez les clés `sk_test_` par `sk_live_` et recréez le webhook en mode live.

---

## 4. Resend

1. Compte sur [resend.com](https://resend.com) → **API Keys → Create** → `RESEND_API_KEY`.
2. Pour tester sans domaine : `EMAIL_FROM="Super Papa de Flora <onboarding@resend.dev>"` (Resend n'envoie alors qu'à l'adresse de votre compte).
3. En production : **Domains → Add domain**, ajoutez les enregistrements DNS indiqués, puis
   `EMAIL_FROM="Super Papa de Flora <reservation@votre-domaine.fr>"`.
4. Dans l'admin → **Paramètres**, renseignez l'**adresse qui reçoit les alertes** (nouvelles réservations, messages de contact).

Sans clé Resend, les e-mails sont simplement affichés dans les journaux du serveur.

E-mails envoyés automatiquement :
| Quand | À qui |
|---|---|
| Paiement confirmé | Client (récapitulatif) + gérant (« Nouvelle réservation » : dates, nom, contact, montant) |
| Dates prises pendant le paiement (rare) | Client (remboursement automatique) + gérant |
| Annulation depuis l'admin (option) | Client |
| Formulaire de contact | Gérant (répondre = répondre au client) |

---

## 5. Déploiement sur Vercel

1. Poussez le projet sur GitHub (ou GitLab).
2. [vercel.com](https://vercel.com) → **Add New → Project** → importez le dépôt (framework détecté automatiquement).
3. **Settings → Environment Variables** : ajoutez toutes les variables de `.env.example`, avec
   `NEXT_PUBLIC_SITE_URL=https://votre-domaine.fr` (sans slash final).
4. **Deploy**. Puis **Settings → Domains** pour brancher votre nom de domaine.
5. Créez le webhook Stripe de production (section 3) avec l'URL définitive.
6. Les tâches planifiées de [`vercel.json`](vercel.json) s'activent seules :
   synchro iCal chaque jour à 5 h, nettoyage des paiements abandonnés à 5 h 30.
   Définissez `CRON_SECRET` : Vercel l'envoie automatiquement à ces tâches.

---

## 6. Changer le nom du site

Tout est centralisé dans **[`src/config/site.ts`](src/config/site.ts)** :

```ts
export const siteConfig = {
  name: "Super Papa de Flora",   // ← le nouveau nom ici
  shortName: "Super Papa",
  ...
```

Le même fichier contient l'adresse, le téléphone, le numéro d'enregistrement du meublé, les distances « À proximité », la capacité et les horaires.
Pensez aussi à `EMAIL_FROM` (nom d'expéditeur des e-mails).

Les **textes éditoriaux** (titre de l'accueil, présentation, pièces, équipements, règlement) se modifient sans code dans **Admin → Paramètres**.

---

## 7. Utiliser l'admin

Accès : lien **Admin** en pied de page, ou `/admin`. La section n'est pas indexée par Google (`noindex` + `robots.txt`).

| Page | Ce qu'on y fait |
|---|---|
| **Tableau de bord** | Chiffre d'affaires, prochaine arrivée, séjours à venir / passés, paiements en cours |
| **Réservations** | Liste filtrable ; fiche détaillée (client, dates, montant, historique) ; **annulation** avec remboursement Stripe et e-mail au client en option |
| **Calendrier** | Un clic sur une nuit libre = bloquée, un clic sur une nuit bloquée = libérée. Blocage d'une période entière. Liens iCal |
| **Tarifs** | Prix de base, ménage, durée minimale, taxe de séjour ; **prix par période** (haute saison…) avec durée minimale propre |
| **Photos** | Ajout (plusieurs à la fois), légende, **glisser-déposer** pour l'ordre, ★ = photo de couverture, suppression |
| **Paramètres** | E-mail d'alerte, textes de l'accueil, pièces, équipements (cases à cocher), règlement intérieur |

**Astuce photos** : donnez à une photo la même légende qu'une pièce (« Salon », « Chambre 1 »…) pour qu'elle s'affiche à côté de cette pièce sur la page *Le logement*. Tant qu'aucune photo n'est ajoutée, des emplacements élégants et libellés s'affichent.

---

## 8. Synchronisation Airbnb / Booking (iCal)

- **Export** (vos réservations → Airbnb/Booking) : copiez le lien `https://votre-domaine.fr/calendrier.ics` (affiché dans Admin → Calendrier) et collez-le dans
  Airbnb (*Calendrier → Disponibilités → Synchroniser les calendriers → Importer*) et Booking (*Tarifs et disponibilités → Synchroniser les calendriers*).
  Le flux est anonymisé (« Réservé »).
- **Import** (Airbnb/Booking → votre site) : récupérez leur lien d'export `.ics`, collez-le dans Admin → Calendrier → *Liens iCal à importer*, puis *Synchroniser maintenant*.
  Les nuits importées apparaissent en gris et ne sont plus réservables. Synchronisation automatique quotidienne.

> Une synchro iCal n'est jamais instantanée (Airbnb relit les calendriers toutes les quelques heures). Le risque de doublon est faible mais existe : c'est inhérent au format iCal.

---

## 9. Sécuriser l'admin

⚠️ **Tant que l'admin est sans mot de passe, quiconque connaît l'adresse `/admin` voit les coordonnées de vos clients et peut annuler des réservations.** Ne gardez pas cet état avec de vraies réservations (c'est aussi une exigence RGPD).

**Option simple (1 minute)** : sur Vercel, ajoutez `ADMIN_PASSWORD=un-mot-de-passe-solide` (et éventuellement `ADMIN_USER`). Le navigateur demandera identifiant et mot de passe pour toute la partie `/admin`. C'est géré par [`src/middleware.ts`](src/middleware.ts).

**Option complète (comptes Supabase)** : tout passe déjà par une seule fonction, [`src/lib/admin-auth.ts`](src/lib/admin-auth.ts) → `requireAdmin()`, appelée par le layout admin et par chaque action. Pour brancher Supabase Auth :
1. `npm install @supabase/ssr` ; activez *Authentication → Email* dans Supabase et créez votre compte gérant.
2. Créez une page `/admin/connexion` (formulaire e-mail + mot de passe ou lien magique) — placez-la hors du layout admin (ex. `src/app/connexion-admin`).
3. Dans `requireAdmin()`, lisez la session avec `createServerClient` de `@supabase/ssr`, vérifiez que l'e-mail figure dans une variable `ADMIN_EMAILS`, sinon `redirect("/connexion-admin")`.

Aucune autre modification n'est nécessaire.

---

## 10. Check-list avant la mise en ligne

- [ ] `src/config/site.ts` : adresse, téléphone, e-mail, **numéro d'enregistrement du meublé** (obligatoire à Saint-Malo, affiché dans le pied de page et les e-mails), coordonnées GPS.
- [ ] Pages légales : remplacez chaque **[À COMPLÉTER]** (surligné en jaune) dans `src/app/(site)/mentions-legales`, `conditions-generales`, `confidentialite`, `cookies`. Barème d'annulation et dépôt de garantie en particulier. Faites relire si possible.
- [ ] **Taxe de séjour** : vérifiez le montant auprès de Saint-Malo Agglomération (Admin → Tarifs). Le site l'applique par adulte et par nuit, mineurs exonérés.
- [ ] Admin → Paramètres : e-mail d'alerte, textes. Admin → Photos : vos photos.
- [ ] Avis voyageurs : la page d'accueil affiche 3 emplacements vides clairement signalés — remplacez-les par de **vrais** avis (dans `src/app/(site)/page.tsx`, section « AVIS ») ou supprimez la section.
- [ ] Supprimez les données de démo (bas de `supabase/seed.sql`).
- [ ] Stripe en mode live + webhook live. Faites une vraie réservation d'1 € de test puis remboursez-la.
- [ ] `ADMIN_PASSWORD` défini (section 9).
- [ ] Domaine Resend vérifié.

---

## 11. Comment ça marche

### Arborescence

```
src/
├── config/site.ts              ← nom du site et infos fixes (UN SEUL fichier)
├── middleware.ts               ← mot de passe optionnel de l'admin
├── app/
│   ├── (site)/                 ← pages publiques (accueil, logement, réserver, contact, légal…)
│   ├── admin/                  ← espace gérant + actions serveur (actions.ts)
│   ├── api/checkout            ← crée la réservation « en attente » + la session Stripe
│   ├── api/webhooks/stripe     ← confirme / annule selon Stripe
│   ├── api/contact             ← formulaire de contact
│   ├── api/availability        ← disponibilités en JSON
│   ├── api/ical/sync, api/cron ← tâches planifiées
│   └── calendrier.ics          ← flux iCal exporté
├── components/
│   ├── motion/                 ← animations (vague du hero, marée, mots, ondulation, curseur, Lenis)
│   ├── site/                   ← en-tête, pied de page, galerie, carte, cookies…
│   ├── booking/                ← calendrier + formulaire de réservation
│   └── admin/                  ← composants de l'admin
└── lib/
    ├── db.ts                   ← TOUT l'accès aux données (Supabase ou démo)
    ├── booking.ts              ← paiement, confirmation, annulation, remboursement
    ├── pricing.ts              ← calcul du prix (partagé client/serveur)
    ├── email.ts, ical.ts, stripe.ts, dates.ts
    └── demo-data.ts            ← données fictives du mode démo
supabase/schema.sql, seed.sql
```

### Anti double réservation (4 niveaux)

1. **Calendrier** : les nuits prises sont grisées/hachurées et non sélectionnables.
2. **Avant paiement** : le serveur recalcule le prix et vérifie les disponibilités (réservations + nuits bloquées + iCal). Le montant envoyé par le navigateur est ignoré.
3. **Pendant le paiement** : une réservation « en attente » bloque les dates 30 minutes. Une **contrainte d'exclusion PostgreSQL** (`bookings_no_overlap`) rend physiquement impossible l'enregistrement de deux séjours actifs qui se chevauchent, même si deux clients cliquent à la même milliseconde.
4. **Après paiement** (webhook) : nouvelle vérification. Si les dates ne sont plus libres (cas extrême : paiement terminé après expiration), le client est **remboursé automatiquement** et le gérant prévenu.

La confirmation est idempotente : le webhook et la page de confirmation peuvent arriver en même temps, un seul e-mail part.

### Statuts de réservation

`pending` (en attente de paiement) → `paid` (payée) ou `cancelled` (annulée : abandon, expiration, annulation gérant, remboursement).

### Calcul du prix

`total = Σ prix de chaque nuit (tarif de la période ou prix de base) + ménage (option) + taxe de séjour × adultes × nuits`.
La durée minimale est celle de la période de la date d'arrivée, sinon celle des paramètres.

### Animations & performance

- Vague du hero : trois couches SVG recalculées à chaque image, mise en pause hors écran.
- Sections « marée » : masque `clip-path` à bord ondulé piloté par le scroll.
- Titres mot par mot, galerie horizontale au scroll avec parallaxe, carte dont les tracés se dessinent, ondulation au clic, curseur discret (souris uniquement).
- `prefers-reduced-motion` respecté partout (masques, parallaxe, défilement doux et curseur désactivés ; seuls de brefs fondus subsistent).
- Polices auto-hébergées (Fraunces + Instrument Sans, `font-display: swap`), images servies en AVIF/WebP via `next/image`, pages publiques mises en cache (ISR 60 s), JS initial ≈ 160 ko.
