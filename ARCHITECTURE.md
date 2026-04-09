# ARCHITECTURE.md — SniperAuto / Auto1-Monitor

---

## 1. PROJECT STRUCTURE

```
auto1-monitor/
│
├── Core Application
│   ├── dashboard.js            # Express API server + Stripe webhook (port 3000)
│   ├── bot-manager.js          # Bot orchestration, cron scheduling, EventEmitter
│   ├── scraper.js              # Auto1 Playwright scraper (authenticated)
│   ├── whatsapp.js             # Green API WhatsApp client
│   ├── email.js                # Resend email service
│   ├── db.js                   # SQLite database helpers (better-sqlite3)
│   ├── index.js                # Legacy cron runner
│   └── stripe-setup.js         # Stripe product/price bootstrapping
│
├── bots/                       # Marketplace scrapers
│   ├── aramis.js               # Aramis Pro vehicle scraper
│   └── leboncoin.js            # LeBonCoin classifieds scraper
│
├── react-site/                 # React landing page (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css           # All styles (40K)
│   │   └── components/
│   │       ├── Nav.tsx          # Navigation + animated radar logo
│   │       ├── Hero.tsx         # Hero + WhatsApp chat mockup
│   │       ├── Marketplaces.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── PourQui.tsx
│   │       ├── DealsRates.tsx
│   │       ├── Pricing.tsx
│   │       ├── Testimonials.tsx
│   │       ├── FAQ.tsx
│   │       ├── CTASection.tsx
│   │       └── Footer.tsx
│   ├── public/                 # Static assets (logos, favicon, og-image)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── remotion-video/             # Marketing video generation
│   ├── src/scenes/             # Video scene components
│   ├── remotion.config.ts
│   └── package.json
│
├── public/                     # Static files served by Express
│   ├── index.html              # Main landing page (96K)
│   ├── success.html            # Post-checkout page
│   ├── og-image.png
│   ├── favicon/
│   └── logos/
│
├── auth-state/                 # Playwright session cache (Auto1)
├── auth-state-aramis/          # Playwright session cache (Aramis)
├── logs/                       # Application logs
├── auto1.db                    # SQLite database
├── .env                        # Environment variables (secrets)
├── package.json
├── IDEAS.md                    # Business ideas
└── PLAN-RADARVO.md             # Launch plan & positioning
```

---

## 2. HIGH-LEVEL SYSTEM DIAGRAM

```
                    ┌──────────────┐
                    │   Visitors   │
                    └──────┬───────┘
                           │ HTTPS
                    ┌──────▼───────┐
                    │  React SPA   │ (Vite, port 5173)
                    │  Landing Page│
                    └──────┬───────┘
                           │ /api/checkout, /api/contact
         ┌─────────────────▼─────────────────┐
         │      Express Dashboard Server      │ (port 3000)
         │  REST API + Static Files + SSE     │
         └──┬──────┬──────┬──────┬──────┬────┘
            │      │      │      │      │
    ┌───────▼┐ ┌───▼───┐ ┌▼─────┐ ┌────▼───┐ ┌──▼──────┐
    │ SQLite │ │Stripe │ │Resend│ │Green   │ │Playwright│
    │  (DB)  │ │(Pay)  │ │(Mail)│ │API (WA)│ │(Scraper) │
    └────────┘ └───────┘ └──────┘ └────────┘ └────┬─────┘
                                                    │
                          ┌─────────────────────────┼──────────┐
                          │                         │          │
                   ┌──────▼──────┐  ┌───────────────▼┐  ┌─────▼──────┐
                   │  Auto1.com  │  │ pro.aramisauto  │  │ leboncoin  │
                   │  (auction)  │  │   .com (B2B)    │  │ .fr (C2C)  │
                   └─────────────┘  └─────────────────┘  └────────────┘
```

---

## 3. CORE COMPONENTS

### Bot Manager (`bot-manager.js`)
- **Purpose**: Orchestrate all scraping bots — scheduling, execution, notification dispatch
- **Tech**: Node.js EventEmitter + node-cron
- **Key flow**: Cron trigger → Run scraper → Store deals in SQLite → Send WhatsApp alerts → Log results

### Dashboard Server (`dashboard.js`)
- **Purpose**: REST API for bot management, Stripe webhook, SSE events, static file serving
- **Tech**: Express.js on port 3000
- **Endpoints**: CRUD bots, trigger scans, checkout sessions, contact/waitlist forms

### Scrapers
| Scraper | File | Target | Auth | Filters |
|---------|------|--------|------|---------|
| Auto1 | `scraper.js` | auto1.com | Email/password | Price ≤ 1000€, year ≥ 2002, test drive OK |
| Aramis | `bots/aramis.js` | pro.aramisauto.com | Email/password | Configurable |
| LeBonCoin | `bots/leboncoin.js` | leboncoin.fr | None | Price range, keywords |

### React Landing Page (`react-site/`)
- **Purpose**: Marketing SPA for SniperAuto
- **Tech**: React 18 + Vite + TypeScript
- **Features**: Glassmorphism UI, WhatsApp chat mockup, Stripe checkout integration, animated radar logo

### Remotion Video (`remotion-video/`)
- **Purpose**: Generate marketing videos programmatically
- **Tech**: Remotion 4.0

---

## 4. DATA STORES

### SQLite (`auto1.db`)
- **Type**: SQLite 3 via `better-sqlite3`
- **Purpose**: All application data (deals, bots, subscribers, logs)

**Key Tables**:

| Table | Purpose |
|-------|---------|
| `deals` | Discovered vehicle listings (id, title, price, km, year, fuel, location, image, bot_id, notified) |
| `bots` | Bot configurations (type, url, cron_schedule, filters, enabled, status) |
| `scan_logs` | Scan history (bot_id, total_found, new_deals, notified, duration_ms, error) |
| `subscribers` | Stripe customers (email, stripe_customer_id, plan, billing, status) |
| `waitlist` | Pre-launch email signups |
| `daily_reports` | Aggregated daily stats |

### Playwright Auth State (`auth-state/`, `auth-state-aramis/`)
- **Type**: File-based browser session cache
- **Purpose**: Persist login cookies to avoid re-authenticating on every scrape

---

## 5. EXTERNAL INTEGRATIONS

| Service | Purpose | Method |
|---------|---------|--------|
| **Green API** | WhatsApp Business notifications | REST API (instance ID + token) |
| **Stripe** | Subscription payments (29-99€/mo) | SDK — Checkout Sessions + Webhooks |
| **Resend** | Transactional emails (confirmation, admin alerts) | SDK (API key) |
| **Auto1.com** | Vehicle auction marketplace | Playwright browser scraping |
| **Aramis Pro** | B2B vehicle marketplace | Playwright browser scraping |
| **LeBonCoin** | C2C classifieds | Playwright browser scraping |

---

## 6. DEPLOYMENT & INFRASTRUCTURE

**Current**: Local macOS machine
- Node.js process managed by macOS **LaunchAgent** (`com.auto1.monitor.plist`)
- Auto-restarts on crash and on boot
- Logs: `bot.log` / `bot-error.log`

**Planned** (from PLAN-RADARVO.md):
- Railway or Fly.io for Node.js
- Supabase for auth + database
- Vercel/Netlify for React landing page

**CI/CD**: None currently — manual `git push` to GitHub

---

## 7. SECURITY CONSIDERATIONS

| Area | Implementation |
|------|---------------|
| **Auth** | Credential-based login to marketplaces (env vars) |
| **Secrets** | `.env` file, gitignored |
| **Payments** | Stripe Checkout (PCI-compliant, server-side only) |
| **Webhook verification** | `STRIPE_WEBHOOK_SECRET` (TODO: not yet configured) |
| **Data encryption** | TLS via Stripe/Resend/Green API SDKs |
| **Session storage** | Playwright auth state in gitignored directories |

**Known gaps**:
- No API authentication on dashboard endpoints
- Stripe webhook secret not configured (`whsec_TODO`)
- Credentials stored in `.env` (not a secrets manager)

---

## 8. DEVELOPMENT & TESTING

### Local Setup
```bash
cd auto1-monitor
npm install
cp .env.example .env   # Fill in credentials
npx playwright install  # Install browser binaries
npm start               # Start dashboard on :3000
```

### React Site
```bash
cd react-site
npm install
npm run dev             # Vite dev server on :5173
```

### Remotion Video
```bash
cd remotion-video
npm install
npm start               # Remotion Studio
npm run build           # Render to MP4
```

### Testing
- `node test-run.js` — Quick scraper test
- `node test-whatsapp.js` — WhatsApp connectivity test
- `node test-aramis-preview.js` — Aramis scraper test
- No formal test framework (Jest, Vitest) configured

### Code Quality
- TypeScript in React site (strict mode)
- No linter/formatter configured for backend JS

---

## 9. FUTURE CONSIDERATIONS

### Technical Debt
- Stripe webhook secret not configured
- No API authentication on dashboard
- No automated tests
- Backend is plain JS (no TypeScript)
- Single SQLite file (not scalable for multi-instance)

### Planned Migrations
- Move to cloud hosting (Railway/Fly.io)
- Supabase for auth & PostgreSQL
- Add more marketplace scrapers

### Roadmap Features
- Programmatic SEO pages (city × car model)
- AI-powered deal scoring
- Mobile app (React Native)
- Webhook API for Pro subscribers
- Daily PDF reports

---

## 10. GLOSSARY

| Term | Definition |
|------|-----------|
| **Auto1** | B2B vehicle auction platform for professionals |
| **Aramis Pro** | B2B vehicle wholesale marketplace |
| **LeBonCoin** | French C2C classifieds (like Craigslist) |
| **Green API** | WhatsApp Business API wrapper service |
| **Deal** | A vehicle listing discovered by a scraper |
| **Bot** | A configured scraper targeting a specific marketplace/URL |
| **Scan** | One execution of a scraper (finds deals, sends alerts) |
| **SSE** | Server-Sent Events — real-time dashboard updates |
| **RadarVO** | Alternate product name (Radar Véhicules d'Occasion) |
| **SniperAuto** | Primary product brand name |

---

## 11. PROJECT IDENTIFICATION

| Field | Value |
|-------|-------|
| **Project Name** | SniperAuto (Auto1-Monitor) |
| **Repository** | https://github.com/Mathieuking7/swift-target-auto.git |
| **Primary Contact** | sosparebrise34.contact@gmail.com |
| **Tech Stack** | Node.js, Express, Playwright, SQLite, React, Vite, Remotion |
| **Last Updated** | 2026-03-19 |
