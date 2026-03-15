# RadarVO - Plan de Lancement Complet

## 1. La Marque

**Nom:** RadarVO
**Tagline:** "Chaque bonne affaire, avant tout le monde."
**Domaine:** radarvo.fr

Pourquoi RadarVO:
- "VO" = Vehicule d'Occasion, jargon pro immediatement compris
- "Radar" = surveillance, detection, vitesse
- Court, memorable, .fr disponible
- Score marche francais: 9/10

Alternatives backup: FlashVO, SpotVO

---

## 2. Le Marche

### Chiffres cles France
- 5.44M transactions VO/an
- 120 000+ professionnels auto (garagistes, concessionnaires, mandataires)
- 40 000 garages independants
- 14M visiteurs/mois sur LeBonCoin auto
- Marche VO France: ~50Mds EUR/an

### Concurrence directe: quasi inexistante
- LeBonScrap: extension Chrome limitee, pas de WhatsApp, pas multi-marketplace
- Apify: technique, pas user-friendly, cher
- VETTX (US): prouve le marche mais pas en France
- **Aucun SaaS francais d'alertes multi-marketplace VO**

---

## 3. Pricing

| | Starter | Pro | Business |
|---|---|---|---|
| Prix | **29 EUR/mois** | **49 EUR/mois** | **99 EUR/mois** |
| Bots | 1 | 5 | Illimites |
| Scans | 10/jour | Temps reel | Temps reel |
| Alertes | Email | Email + WhatsApp | Email + WhatsApp + Webhook |
| Marketplaces | 1 | Toutes | Toutes |
| Filtrage IA | Non | Oui | Oui |
| Support | Community | Email prioritaire | Telephone + onboarding |
| Cible | Particuliers, petits revendeurs | Garagistes independants | Concessions, mandataires |

**Psychologie prix:**
- 29 EUR = prix d'un plein d'essence, pas un investissement
- Ancrage: le plan Business a 99 EUR fait paraitre Pro a 49 EUR comme une bonne affaire
- Un seul bon deal trouve rembourse 6 mois d'abonnement

---

## 4. Levier Psychologique #1: La Perte

> "Combien de deals avez-vous rate cette semaine?"

La peur de rater une bonne affaire (Loss Aversion) est 2x plus puissante que l'attrait du gain. Toute la communication doit etre orientee autour des deals RATES, pas trouves.

**Applications concretes:**
- Landing page: compteur de deals "expires dans les dernieres 24h"
- Email d'onboarding: "Voici 3 deals que vous auriez pu avoir hier"
- Rapport gratuit personnalise: "Deals rates cette semaine dans votre zone"
- Notification WhatsApp: "Ce deal part dans les prochaines heures"

---

## 5. Plan d'Action - Etape par Etape

### SEMAINE 1-2: Fondations
- [ ] Acheter radarvo.fr
- [ ] Deployer landing page (deja faite) sur radarvo.fr
- [ ] Mettre en place Supabase auth (inscription/login)
- [ ] Integrer Stripe (3 plans)
- [ ] Deployer sur Railway/Fly.io
- [ ] Creer page Instagram @radarvo
- [ ] Creer groupe WhatsApp "RadarVO Beta"

### SEMAINE 3-4: Premiers 10 Clients (Outreach Direct)

**Strategie "Rapport Deals Rates"** (MFS: 31/40 - meilleur levier)

1. Identifier 50 garagistes/revendeurs dans ta zone
2. Pour chacun, generer un rapport PDF personnalise:
   - "5 deals que vous avez rate cette semaine sur Auto1/LBC"
   - Avec photos, prix, et combien ils auraient pu gagner
3. Envoyer par WhatsApp/email avec message:
   > "Bonjour, je suis [prenom]. J'ai developpe un outil qui detecte les bonnes affaires VO avant tout le monde. Voici ce que vous avez rate cette semaine. Interessé par un essai gratuit de 14 jours?"
4. Objectif: 10 essais gratuits → 5 conversions

**En parallele:**
- Rejoindre 5-10 groupes Facebook de pros auto
- Poster des deals interessants (pas de spam) avec mention "trouve par RadarVO"
- Repondre aux questions sur les prix VO dans les groupes

### MOIS 2: Validation + Iteration
- [ ] Recueillir feedback des 10 premiers clients
- [ ] Ajuster fonctionnalites selon retours
- [ ] Ajouter Facebook Marketplace scraper
- [ ] Ajouter La Centrale scraper
- [ ] Creer 3 posts LinkedIn/semaine (deals du jour, stats marche)
- [ ] Lancer programme "Parrainage Pro": 1 mois gratuit pour parrain + filleul

### MOIS 3: Scaling a 50 Clients
- [ ] SEO: pages "Meilleurs deals [marque] occasion France" (programmatique)
- [ ] Video YouTube: "Comment j'ai trouve une [voiture] a [prix] en 5 minutes"
- [ ] Partenariat avec 2-3 influenceurs auto YouTube/TikTok
- [ ] Publicite Facebook ciblee: garagistes, mandataires auto
- [ ] Budget pub: 500 EUR/mois max

### MOIS 4-6: Objectif 100 Clients = 4 900 EUR MRR
- [ ] Contenu SEO regulier (blog deals, guides)
- [ ] Webinaire mensuel "Comment sourcer des VO rentables"
- [ ] Stand au salon auto local
- [ ] API pour integrations (gros comptes Business)
- [ ] Embaucher 1 freelance support client

---

## 6. Canaux d'Acquisition (par priorite)

| Canal | Cout | Vitesse | Impact | Action |
|---|---|---|---|---|
| Cold outreach + rapport deals | 0 EUR | 1 semaine | Fort | Faire soi-meme |
| Groupes Facebook pros auto | 0 EUR | 2 semaines | Moyen | 30 min/jour |
| Parrainage Pro | 0 EUR (1 mois offert) | 1 mois | Fort | Automatiser |
| SEO programmatique | 0 EUR | 3-6 mois | Tres fort | Pages deals par ville/marque |
| LinkedIn (contenu pro) | 0 EUR | 1 mois | Moyen | 3 posts/semaine |
| Facebook Ads | 500 EUR/mois | 1 semaine | Moyen | Apres validation produit |
| YouTube/TikTok auto | 0-500 EUR | 1 mois | Fort | Partenariats |

---

## 7. Objectifs Financiers

| Mois | Clients | MRR | ARR |
|---|---|---|---|
| M1 | 5 | 245 EUR | - |
| M3 | 30 | 1 470 EUR | - |
| M6 | 100 | 4 900 EUR | 58 800 EUR |
| M12 | 300 | 14 700 EUR | 176 400 EUR |

Hypothese: mix 60% Pro (49EUR) + 30% Starter (29EUR) + 10% Business (99EUR)

**Break-even:** ~50 clients (serveur + outils ~200 EUR/mois)

---

## 8. Stack Technique (deja en place)

- Scraping: Playwright (Auto1, LBC) - **fait**
- Notifications: Green API WhatsApp - **fait**
- DB: SQLite - **fait**
- Dashboard: Express.js - **fait**
- Filtrage IA: Claude API - **fait**
- A ajouter: Supabase (auth), Stripe (paiement), Railway (deploy)

---

## 9. Messages Cles (Copywriting)

**Headline:** "Ne ratez plus jamais une bonne affaire VO"

**Sous-titre:** "RadarVO surveille Auto1, LeBonCoin et 4 autres marketplaces 24/7. Recevez les meilleurs deals sur WhatsApp avant tout le monde."

**Social proof future:** "RadarVO a detecte 2 847 deals cette semaine. Combien en avez-vous rate?"

**CTA principal:** "Essai gratuit 14 jours - Sans carte bancaire"

**Objection prix:** "Un seul bon deal trouve = 6 mois d'abonnement rembourses"

---

## 10. Risques et Mitigations

| Risque | Mitigation |
|---|---|
| Marketplaces bloquent le scraping | Rotation proxies, respect rate limits, API officielles si dispo |
| Peu de traction initiale | Rapport "deals rates" gratuit comme porte d'entree |
| Client churne apres essai | Onboarding WhatsApp personnalise, deals quotidiens |
| Concurrent copie | Avance technique, communaute, data historique |
| Green API WhatsApp instable | Backup Twilio, multi-canal (email + Telegram) |
