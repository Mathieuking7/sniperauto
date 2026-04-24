# Pages de réservation 48h — SniperAuto

**Date** : 2026-04-24
**Auteur** : Mathieu (via brainstorm Claude)
**Statut** : Approuvé pour implémentation

---

## 1. Contexte et objectif

6 clients en liste d'attente reçoivent un email avec un lien personnel vers une page web leur annonçant qu'une **place SniperAuto leur est réservée pour 48h**. S'ils ne souscrivent pas dans ce délai, leur place est réattribuée et ils doivent rejoindre la liste d'attente à nouveau.

### Objectifs business

- **Conversion maximale** sur 48h par effet de scarcity réelle.
- **Réutilisation de la DA existante** (logo, couleurs Apple #007AFF/#5856d6, floating shapes, CSS actuel) — pas de refonte.
- **Hors scope** : envoi automatique des emails (Mathieu envoie à la main), refonte du site, analytics avancé.

### Clients concernés

| Slug | Email | Prénom affiché (fallback) |
|---|---|---|
| `cwauto83` | cwauto83@gmail.com | *CW Auto* |
| `tlcmotors33` | tlcmotors33@gmail.com | *TLC Motors* |
| `robsmotorss` | robsmotorss@gmail.com | *Rob* |
| `lleroy273` | L.leroy273@gmail.com | *L. Leroy* |
| `guillaumeponton` | guillaume.ponton@gmail.com | *Guillaume* |
| `rodolfofreitas2002` | rodolfofreitas2002@hotmail.com | *Rodolfo* |

Les prénoms sont éditables manuellement en tête du script `seed-reservations.js` avant exécution. Si `firstName` est vide dans la BDD, le hero affiche simplement `👋 Bonjour` sans nom (fallback gracieux).

---

## 2. Architecture

### 2.1 Stack et dépendances

- **Frontend** : Vite + React 18 + TS (existant). Ajout de `react-router-dom@^6`.
- **Backend** : Express `dashboard.js` (existant). Ajout de 3 endpoints + modifs sur `/api/checkout` et le webhook Stripe.
- **BDD** : SQLite `bot.db` (existant, via `db.js`). Nouvelle table `reservations`.
- **Stripe** : aucun nouveau prix, on réutilise les 6 price IDs existants (`STRIPE_PRICE_ESSENTIEL_MONTHLY/ANNUAL`, `STRIPE_PRICE_PRO_MONTHLY/ANNUAL`, `STRIPE_PRICE_SETUP_ESSENTIEL/PRO`).
- **Crisp** : déjà chargé globalement dans `react-site/index.html` (website ID `b51e79c5-2edd-4ee2-9eb6-f91b657c3f67`). Un lien explicite dans la page déclenche `window.$crisp?.push(['do','chat:open'])`.

### 2.2 Schéma BDD

Nouvelle table dans `bot.db` :

```sql
CREATE TABLE IF NOT EXISTS reservations (
  slug TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  firstName TEXT DEFAULT '',
  deadline INTEGER NOT NULL,          -- timestamp ms UTC
  status TEXT NOT NULL DEFAULT 'active',  -- active | converted | expired | waitlisted
  createdAt INTEGER NOT NULL,
  openedAt INTEGER,
  convertedAt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
```

### 2.3 Routage frontend

Refactor de `react-site/src/main.tsx` pour introduire `BrowserRouter` :

| Route | Composant | Usage |
|---|---|---|
| `/` | `<App/>` (existant, inchangé) | Homepage actuelle |
| `/r/:slug` | `<ReservedPage/>` (nouveau) | Page personnelle (active ou expirée) |

Requiert une config serveur pour fallback SPA (Express sert `index.html` pour tout GET qui ne matche pas une route API). À vérifier dans `dashboard.js` (probablement déjà en place via `express.static`, sinon ajout d'un handler catch-all).

### 2.4 Endpoints backend

Tous dans `dashboard.js`.

#### `GET /api/reservations/:slug`
- Lit la résa, **expire lazy** (si `status='active'` et `deadline < now` → UPDATE vers `expired`).
- Écrit `openedAt` à la première ouverture.
- Réponse 200 : `{ slug, firstName, email, deadline, status }` (email renvoyé pour affichage dans la modal en lecture seule).
- Réponse 404 si slug inconnu.

#### `POST /api/reservations/seed` (admin)
- Protégé par header `x-admin-token` matché contre `process.env.ADMIN_TOKEN`.
- Body : `{ reservations: [{ slug, email, firstName }], durationHours: 48 }`.
- Crée les lignes avec `deadline = Date.now() + durationHours*3600*1000`, `status='active'`.
- Upsert : si un slug existe déjà, remplace (pour réexécution).

#### `POST /api/reservations/:slug/waitlist`
- Utilisé uniquement si la résa est `expired` ou `waitlisted`.
- Réutilise la logique de l'endpoint `/api/waitlist` existant (upsert email dans la table waitlist).
- Flip `status='waitlisted'`.
- Envoie l'email de confirmation waitlist via `sendWaitlistConfirmation()` existant.

#### Modification de `POST /api/checkout`
- Accepte un champ `slug` optionnel en body.
- Si `slug` présent : vérifier que la résa existe et a `status='active'` et `deadline > now`. Sinon → 410 Gone (`{ error: "Réservation expirée" }`).
- Passer `slug` dans la `metadata` Stripe.

#### Modification du webhook `checkout.session.completed`
- Si `session.metadata.slug` présent : `UPDATE reservations SET status='converted', convertedAt=now WHERE slug=?`.
- Le reste du flow email/WhatsApp existant ne change pas.

### 2.5 Script CLI

**Nouveau fichier** `seed-reservations.js` à la racine du projet :
- Charge `.env`, ouvre `bot.db`, crée la table si elle n'existe pas.
- Contient en tête un tableau `const RESERVATIONS = [...]` avec les 6 entrées (slug, email, firstName — éditables par Mathieu).
- Calcule `deadline = now + 48h`.
- Upsert les 6 lignes.
- Affiche les 6 URLs à copier-coller dans les mails, ex : `https://sniperauto.fr/r/guillaumeponton`.
- Affiche la deadline en heure locale FR pour confirmation.

Exécution : `node seed-reservations.js`.

---

## 3. Composants frontend

### 3.1 `ReservedPage.tsx`

Route `/r/:slug`. Au mount : `fetch('/api/reservations/' + slug)`.

États :
- **Loading** — spinner centré.
- **Not found** (404) — message bref "Ce lien n'existe pas" + retour vers `/`.
- **Active** (status='active' ET deadline > now) → layout no-scroll décrit en §3.2.
- **Expirée** (status ∈ {expired, waitlisted} OU deadline ≤ now) → layout expiration décrit en §3.3.
- **Convertie** (status='converted') → même écran qu'expirée, mais message "Votre abonnement est actif" + pas de CTA waitlist.

### 3.2 Layout actif — no-scroll desktop

**Dimensions cibles** : 1440×900 sans scroll. Mobile (<768px) : stack vertical naturel avec scroll.

**Structure** (du haut en bas) :

1. **Nav compacte** : logo SniperAuto (gauche) + mention `🔒 Page personnelle sécurisée` (droite). Hauteur ~50px.
2. **Hero centré** :
   - Eyebrow bleu en uppercase : `👋 Bonjour {firstName}` (ou juste `👋 Bonjour` si firstName vide).
   - H1 : `Votre place est réservée <span style="color:#007AFF">48 h</span>`.
   - Sous-titre : `Passé ce délai, elle sera réattribuée au prochain client de la liste d'attente.`
   - **Countdown** (composant `Countdown.tsx`) : 3 blocs noirs arrondis `HEURES / MINUTES / SECONDES`, `setInterval(1000)` qui recalcule depuis `deadline - Date.now()`. Passe en **rouge (#FF3B30)** quand il reste < 6h.
3. **Row 2 colonnes** (`display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px`) :

**Colonne gauche — Rappel produit** :
   - Label `RAPPEL — COMMENT ÇA MARCHE`.
   - `<video src="/demo-sniperauto.mp4" autoPlay muted loop playsInline />` avec `aspect-ratio: 16/10`, `border-radius: 12px`.
   - Sous la vidéo, **3 cartes bénéfices** en flex row :
     - 💬 **Alertes WhatsApp ou mail**
     - 🎯 **Scoring IA des deals**
     - 🔍 **5 sources 24/7**

**Colonne droite — Pricing + CTA** (composant `ReservedPricing.tsx`) :
   - Header + toggle `Mensuel / Annuel` (annuel sélectionné par défaut, badge `–17%` sur le toggle annuel).
   - **Carte Essentiel** :
     - Bordure grise `1.5px #e5e5ea`.
     - `ESSENTIEL`, prix gros (278€/an ou 29€/mois selon toggle), suffixe `/an` ou `/mois`.
     - Features : `1 alerte active`, `Scan toutes les 30 min`, `WhatsApp ou mail`, `Auto1 uniquement`.
     - Bouton outline bleu : `Prendre Essentiel` → ouvre `ReservedCheckoutModal` avec `plan='essentiel'`.
   - **Carte Pro** (highlight) :
     - Bordure bleue épaisse `2px #007AFF`, léger gradient `linear-gradient(180deg,#f0f6ff 0%,#fff 100%)`.
     - Badge `★ RECOMMANDÉ` en haut.
     - `PRO`, prix gros en bleu (470€/an ou 49€/mois), suffixe inclut `· 2 mois offerts` en annuel.
     - Features en **gras** sur les points différenciants : **10 alertes actives**, **Scan en direct**, `WhatsApp ou mail`, **5 sources** (Auto1, LBC, FB…), `Support prioritaire`.
     - Bouton plein bleu : `Je récupère ma place →` → ouvre `ReservedCheckoutModal` avec `plan='pro'`.
   - Sous les boutons : `🔒 Paiement sécurisé Stripe · Sans engagement au mensuel`.
   - **Lien Crisp** : `💬 Une question ? Discuter avec nous →` (texte-lien bleu, onClick `window.$crisp?.push(['do','chat:open'])` avec fallback silencieux si Crisp pas chargé).

### 3.3 Layout expiration

Même nav. Layout simplifié, pas de no-scroll requis :
- H1 : `Votre place a été réattribuée`.
- Paragraphe explicatif (voir §1 objectif business).
- Bouton plein bleu : `Rejoindre à nouveau la liste d'attente` → POST `/api/reservations/:slug/waitlist`.
- Après succès : bloc de confirmation `✅ Vous êtes inscrit, nous vous recontacterons.`
- Vidéo demo conservée en bas (rappel visuel).
- Pas de cards pricing (boutons Stripe cachés).
- Lien Crisp toujours présent.

Si `status='converted'` : même layout mais message `✅ Votre abonnement SniperAuto est actif.` + pas de bouton waitlist + lien `Retour à l'accueil`.

### 3.4 `ReservedCheckoutModal.tsx`

Dérivé de `CheckoutModal.tsx` existant, **champs réduits** :

- Header : `Finaliser {planLabel} · {price}` (ex: "Finaliser Pro · 470 €/an").
- **Email** affiché en lecture seule (chip gris avec l'email de la résa, non éditable — prouve qu'on sait qui ils sont).
- **Prénom** (pré-rempli avec `firstName` de la BDD, éditable) — requis.
- **Téléphone WhatsApp** (placeholder `+33 6 00 00 00 00`) — requis.
- Note : *"Utilisé pour recevoir vos alertes WhatsApp"*.
- Bouton plein bleu : `Continuer vers le paiement →`.
- Bandeau : `🔒 Paiement sécurisé par Stripe. Aucune carte stockée.`
- Sur submit : POST `/api/checkout` avec `{ plan, billing, slug, firstName, email, phone, lastName: '', companyName: '' }`. Redirection vers `session.url`.

### 3.5 `Countdown.tsx`

Props : `{ deadline: number; onExpire: () => void }`.
- `setInterval(1000)` qui calcule `remaining = deadline - Date.now()`.
- Si `remaining <= 0` : appelle `onExpire` (qui dans `ReservedPage` force un refetch → page passe en mode expirée).
- 3 blocs affichés : `HH`, `MM`, `SS` (padLeft '0').
- Classe CSS conditionnelle `.countdown--warning` (fond `#FF3B30`) si `remaining < 6h`.

---

## 4. CSS

Ajout d'un bloc dédié à la fin de `react-site/src/index.css`, toutes les classes préfixées `.reserved-*` pour éviter de polluer la homepage :

- `.reserved-page` (container plein écran, `min-height: 100vh`, `display: flex; flex-direction: column`).
- `.reserved-hero`, `.reserved-countdown`, `.reserved-countdown-block`, `.reserved-countdown--warning`.
- `.reserved-grid` (la row 2 cols), `.reserved-col-left`, `.reserved-col-right`.
- `.reserved-video` (aspect-ratio 16/10, border-radius 12px).
- `.reserved-benefits` (flex row), `.reserved-benefit-card`.
- `.reserved-pricing-toggle`.
- `.reserved-card`, `.reserved-card--pro`, `.reserved-card-badge`.
- `.reserved-cta-primary`, `.reserved-cta-secondary`, `.reserved-crisp-link`.
- Media query `@media (max-width: 767px) { .reserved-grid { grid-template-columns: 1fr; } }` — stack mobile.

Pas de libs CSS externes. La DA (couleurs, fonts, floating shapes) est inchangée.

---

## 5. Sécurité & edge cases

- **Slug comme secret** : acceptable pour 6 personnes sur 48h. Pas de login. L'entropie vient du fait que les slugs sont dérivés d'emails dont un tiers ne peut pas deviner la liste exacte. Si un slug fuite, la pire conséquence est qu'un inconnu voit une page avec 1 email affiché + un CTA Stripe — pas de PII sensible.
- **Admin endpoint protégé** par `ADMIN_TOKEN` en `.env` (variable à ajouter).
- **Validation serveur** : `/api/checkout` refuse les résas non-actives ou expirées → 410, évite qu'un client contourne le countdown en rejouant le POST.
- **Double soumission** : si un client paie Essentiel puis Pro, les deux passent (Stripe gère 2 subscriptions). Acceptable en v1.
- **Fuseau horaire** : deadline stockée en ms UTC, calcul côté client depuis `Date.now()` → cohérent quel que soit le fuseau du visiteur.

---

## 6. Plan de test manuel

1. Run `seed-reservations.js` → vérifier les 6 lignes en BDD, les 6 URLs affichées.
2. Ouvrir `/r/guillaumeponton` → page active, countdown tourne, vidéo joue, Crisp disponible.
3. Cliquer `Je récupère ma place` → modal → remplir → redirection Stripe → payer en mode test → webhook marque `converted`.
4. Rafraîchir `/r/guillaumeponton` → doit passer en mode "abonnement actif".
5. Éditer directement en BDD `deadline = Date.now() - 1000` pour une autre résa → rafraîchir → mode expiré + bouton waitlist fonctionne.
6. Tester sur mobile (DevTools) → stack vertical OK, tout accessible par scroll.
7. Bloquer Crisp dans DevTools → le lien ne doit rien casser (fallback silencieux).

---

## 7. Livrables récapitulatifs

**Nouveaux fichiers** :
- `react-site/src/pages/ReservedPage.tsx`
- `react-site/src/components/Countdown.tsx`
- `react-site/src/components/ReservedCheckoutModal.tsx`
- `react-site/src/components/ReservedPricing.tsx`
- `seed-reservations.js` (racine)

**Fichiers modifiés** :
- `react-site/src/main.tsx` (ajout BrowserRouter)
- `react-site/package.json` (dépendance `react-router-dom`)
- `react-site/src/index.css` (bloc `.reserved-*` en fin de fichier)
- `dashboard.js` (endpoints + check slug + webhook branch)
- `db.js` (CRUD reservations)
- `.env.example` (ajout `ADMIN_TOKEN`)

**Hors scope** :
- Envoi automatique des emails aux 6 (Mathieu envoie manuellement).
- Refonte homepage, Nav, Footer.
- Nouveaux prix Stripe.
- Cron d'expiration (lazy check suffit).
- Login / session / PII.
