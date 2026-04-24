# Reserved Pages 48h — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 personalized reservation pages (`/r/:slug`) with 48h countdown, video, pricing (Essentiel/Pro Stripe), and Crisp chat — served by the existing Express + React stack.

**Architecture:** SQLite `auto1.db` gains a `reservations` table managed via `manager.db` (BotManager's DB connection). Express gets 3 new endpoints + SPA catch-all for `/r/*`. React gets `react-router-dom`, a new `ReservedPage` route, and 4 new components. CSS appended to existing `index.css` with `.reserved-*` prefix to avoid homepage collisions.

**Tech Stack:** Node.js + Express + better-sqlite3 (backend), Vite + React 18 + TypeScript + react-router-dom@^6 (frontend), Stripe Checkout (existing), Crisp (existing, globally loaded).

---

### Task 1: Add ADMIN_TOKEN to .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Open .env.example and add the variable**

```
# Admin token for protected endpoints (e.g. POST /api/reservations/seed)
ADMIN_TOKEN=changeme-secret-token
```

- [ ] **Step 2: Add the same line to your real .env file with a real secret**

```bash
echo "ADMIN_TOKEN=changeme-$(openssl rand -hex 16)" >> .env
```

- [ ] **Step 3: Commit**

```bash
cd /path/to/sniperauto-repo
git add .env.example
git commit -m "chore: add ADMIN_TOKEN env var"
```

---

### Task 2: Add reservations CRUD to db.js

**Files:**
- Modify: `db.js`

- [ ] **Step 1: Append the reservations functions to db.js**

Add these 7 functions just above `module.exports`:

```js
function createReservationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      slug TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      firstName TEXT DEFAULT '',
      deadline INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt INTEGER NOT NULL,
      openedAt INTEGER,
      convertedAt INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
  `);
}

function upsertReservation(db, { slug, email, firstName, deadline }) {
  return db.prepare(`
    INSERT INTO reservations (slug, email, firstName, deadline, status, createdAt)
    VALUES (?, ?, ?, ?, 'active', ?)
    ON CONFLICT(slug) DO UPDATE SET
      email = excluded.email,
      firstName = excluded.firstName,
      deadline = excluded.deadline,
      status = 'active',
      createdAt = excluded.createdAt
  `).run(slug, email, firstName || '', deadline, Date.now());
}

function getReservation(db, slug) {
  return db.prepare('SELECT * FROM reservations WHERE slug = ?').get(slug);
}

function expireReservation(db, slug) {
  db.prepare("UPDATE reservations SET status = 'expired' WHERE slug = ? AND status = 'active'").run(slug);
}

function markReservationOpened(db, slug) {
  db.prepare('UPDATE reservations SET openedAt = ? WHERE slug = ? AND openedAt IS NULL').run(Date.now(), slug);
}

function markReservationConverted(db, slug) {
  db.prepare("UPDATE reservations SET status = 'converted', convertedAt = ? WHERE slug = ?").run(Date.now(), slug);
}

function markReservationWaitlisted(db, slug) {
  db.prepare("UPDATE reservations SET status = 'waitlisted' WHERE slug = ?").run(slug);
}
```

- [ ] **Step 2: Update module.exports to export the new functions**

Replace the existing `module.exports` line at the bottom:

```js
module.exports = {
  getDb,
  upsertDeal,
  getUnnotifiedDeals,
  markNotified,
  getTodayDeals,
  createReservationsTable,
  upsertReservation,
  getReservation,
  expireReservation,
  markReservationOpened,
  markReservationConverted,
  markReservationWaitlisted,
};
```

- [ ] **Step 3: Verify the module loads without error**

```bash
node -e "const db = require('./db'); console.log(Object.keys(db))"
```

Expected output:
```
[
  'getDb', 'upsertDeal', 'getUnnotifiedDeals',
  'markNotified', 'getTodayDeals', 'createReservationsTable',
  'upsertReservation', 'getReservation', 'expireReservation',
  'markReservationOpened', 'markReservationConverted', 'markReservationWaitlisted'
]
```

- [ ] **Step 4: Commit**

```bash
git add db.js
git commit -m "feat: add reservations CRUD to db.js"
```

---

### Task 3: Add reservation endpoints to dashboard.js

**Files:**
- Modify: `dashboard.js`

- [ ] **Step 1: Import the new functions at the top of dashboard.js**

Find the existing import:
```js
const { getDb, upsertDeal, getUnnotifiedDeals, markNotified, getTodayDeals } = require("./db");
```

Replace with:
```js
const {
  getDb, upsertDeal, getUnnotifiedDeals, markNotified, getTodayDeals,
  createReservationsTable, upsertReservation, getReservation,
  expireReservation, markReservationOpened, markReservationConverted,
  markReservationWaitlisted,
} = require("./db");
```

- [ ] **Step 2: Initialize reservations table after manager is created**

Find:
```js
const manager = new BotManager();
```

Add immediately after:
```js
createReservationsTable(manager.db);
```

- [ ] **Step 3: Add GET /api/reservations/:slug**

Add this block after the `/api/waitlist` endpoint (around line 194):

```js
// Reservations: get by slug
app.get("/api/reservations/:slug", (req, res) => {
  const row = getReservation(manager.db, req.params.slug);
  if (!row) return res.status(404).json({ error: "Not found" });

  // Lazy expiration
  if (row.status === "active" && row.deadline < Date.now()) {
    expireReservation(manager.db, row.slug);
    row.status = "expired";
  }

  // Track first open (fire-and-forget)
  markReservationOpened(manager.db, row.slug);

  res.json({
    slug: row.slug,
    firstName: row.firstName,
    email: row.email,
    deadline: row.deadline,
    status: row.status,
  });
});
```

- [ ] **Step 4: Add POST /api/reservations/seed (admin)**

```js
// Reservations: seed (admin only)
app.post("/api/reservations/seed", (req, res) => {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { reservations, durationHours = 48 } = req.body;
  if (!Array.isArray(reservations) || reservations.length === 0) {
    return res.status(400).json({ error: "Missing reservations array" });
  }

  const deadline = Date.now() + durationHours * 3600 * 1000;
  for (const r of reservations) {
    upsertReservation(manager.db, { slug: r.slug, email: r.email, firstName: r.firstName || "", deadline });
  }

  res.json({ ok: true, deadline, count: reservations.length });
});
```

- [ ] **Step 5: Add POST /api/reservations/:slug/waitlist**

```js
// Reservations: re-join waitlist after expiry
app.post("/api/reservations/:slug/waitlist", async (req, res) => {
  const row = getReservation(manager.db, req.params.slug);
  if (!row) return res.status(404).json({ error: "Not found" });
  if (!["expired", "waitlisted"].includes(row.status)) {
    return res.status(400).json({ error: "Reservation not expired" });
  }

  // Ensure waitlist table exists and insert
  manager.db.exec(`CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  manager.db.prepare("INSERT OR IGNORE INTO waitlist (email) VALUES (?)").run(row.email);

  markReservationWaitlisted(manager.db, row.slug);

  res.json({ ok: true });

  // Emails (non-blocking)
  sendWaitlistConfirmation(row.email).catch((e) => console.warn("[Reservation/Waitlist] Email KO:", e.message));
  sendWaitlistAdminNotification(row.email).catch((e) => console.warn("[Reservation/Waitlist] Admin email KO:", e.message));
});
```

- [ ] **Step 6: Modify POST /api/checkout to handle slug**

Find the `/api/checkout` handler. Inside it, find where `const priceId = PRICE_MAP[priceKey]` is used. Add a slug check just before `if (!priceId)`:

```js
// Add after: const { plan, billing, firstName = "", ... } = req.body;
const slug = req.body.slug || null;

// If slug provided, validate reservation is still active
if (slug) {
  const reservation = getReservation(manager.db, slug);
  if (!reservation) return res.status(404).json({ error: "Réservation introuvable" });
  if (reservation.status !== "active" || reservation.deadline < Date.now()) {
    return res.status(410).json({ error: "Réservation expirée" });
  }
}
```

Then add `slug` to the Stripe session metadata. Find:
```js
metadata: { plan, billing, firstName, lastName, email, phone, companyName },
```
Replace with:
```js
metadata: { plan, billing, firstName, lastName, email, phone, companyName, ...(slug ? { slug } : {}) },
```

- [ ] **Step 7: Add slug handling to the Stripe webhook**

In the `checkout.session.completed` handler, find where user info is parsed from `session.metadata`. Add after the existing success logic (within the `if (event.type === "checkout.session.completed")` block), just before or after the subscription email sending:

```js
// Mark reservation as converted if slug present
if (session.metadata?.slug) {
  markReservationConverted(manager.db, session.metadata.slug);
}
```

- [ ] **Step 8: Add SPA catch-all for /r/* routes**

Find this block near the top of dashboard.js:
```js
app.get("/onboarding", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "onboarding.html"));
});
```

Add immediately after:
```js
// SPA fallback: serve React app for reservation pages
app.get("/r/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
```

- [ ] **Step 9: Verify server starts without error**

```bash
node dashboard.js &
sleep 2
curl -s http://localhost:3000/api/reservations/unknown | jq .
# Expected: {"error":"Not found"}
kill %1
```

- [ ] **Step 10: Commit**

```bash
git add dashboard.js
git commit -m "feat: add reservation endpoints and SPA catch-all to dashboard.js"
```

---

### Task 4: Create seed-reservations.js

**Files:**
- Create: `seed-reservations.js`

- [ ] **Step 1: Create the script**

```js
#!/usr/bin/env node
/**
 * Seed the 6 reservation pages.
 * Edit RESERVATIONS below, then run: node seed-reservations.js
 */
require("dotenv").config();
const Database = require("better-sqlite3");
const path = require("path");
const { createReservationsTable, upsertReservation } = require("./db");

// ── EDIT ME ──────────────────────────────────────────────────────────────────
const RESERVATIONS = [
  { slug: "cwauto83",          email: "cwauto83@gmail.com",                firstName: "CW Auto"    },
  { slug: "tlcmotors33",       email: "tlcmotors33@gmail.com",             firstName: "TLC Motors" },
  { slug: "robsmotorss",       email: "robsmotorss@gmail.com",             firstName: "Rob"        },
  { slug: "lleroy273",         email: "L.leroy273@gmail.com",              firstName: "L. Leroy"   },
  { slug: "guillaumeponton",   email: "guillaume.ponton@gmail.com",        firstName: "Guillaume"  },
  { slug: "rodolfofreitas2002",email: "rodolfofreitas2002@hotmail.com",    firstName: "Rodolfo"    },
];
const DURATION_HOURS = 48;
const BASE_URL = process.env.BASE_URL || "https://sniperauto.fr";
// ─────────────────────────────────────────────────────────────────────────────

const db = new Database(path.join(__dirname, "auto1.db"));
db.pragma("journal_mode = WAL");

createReservationsTable(db);

const deadline = Date.now() + DURATION_HOURS * 3600 * 1000;
const deadlineDate = new Date(deadline);

for (const r of RESERVATIONS) {
  upsertReservation(db, { ...r, deadline });
}

const pad = (n) => String(n).padStart(2, "0");
const deadlineStr = `${deadlineDate.toLocaleDateString("fr-FR")} à ${pad(deadlineDate.getHours())}h${pad(deadlineDate.getMinutes())} (heure locale)`;

console.log(`\n✅ ${RESERVATIONS.length} réservations créées`);
console.log(`⏰ Deadline : ${deadlineStr}\n`);
console.log("Liens à envoyer :\n");

for (const r of RESERVATIONS) {
  const padEmail = r.email.padEnd(40);
  console.log(`  ${padEmail} → ${BASE_URL}/r/${r.slug}`);
}

console.log("\nDone.\n");
db.close();
```

- [ ] **Step 2: Run the script to verify it works**

```bash
node seed-reservations.js
```

Expected output (deadline will differ):
```
✅ 6 réservations créées
⏰ Deadline : 26/04/2026 à 14h23 (heure locale)

Liens à envoyer :

  cwauto83@gmail.com                       → https://sniperauto.fr/r/cwauto83
  tlcmotors33@gmail.com                    → https://sniperauto.fr/r/tlcmotors33
  robsmotorss@gmail.com                    → https://sniperauto.fr/r/robsmotorss
  L.leroy273@gmail.com                     → https://sniperauto.fr/r/lleroy273
  guillaume.ponton@gmail.com               → https://sniperauto.fr/r/guillaumeponton
  rodolfofreitas2002@hotmail.com           → https://sniperauto.fr/r/rodolfofreitas2002
```

- [ ] **Step 3: Verify the data in DB**

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('auto1.db');
const rows = db.prepare('SELECT slug, email, firstName, status, deadline FROM reservations').all();
console.table(rows);
db.close();
"
```

All 6 rows should appear with `status = active`.

- [ ] **Step 4: Commit**

```bash
git add seed-reservations.js
git commit -m "feat: add seed-reservations.js CLI script"
```

---

### Task 5: Install react-router-dom and update main.tsx

**Files:**
- Modify: `react-site/package.json`
- Modify: `react-site/src/main.tsx`

- [ ] **Step 1: Install react-router-dom**

```bash
cd react-site
npm install react-router-dom@^6
```

- [ ] **Step 2: Rewrite main.tsx with BrowserRouter and routes**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ReservedPage from './pages/ReservedPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/r/:slug" element={<ReservedPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd react-site
npx tsc --noEmit
```

Expected: no errors (ReservedPage doesn't exist yet — you'll get a module error, that's fine for now, proceed to Task 6).

- [ ] **Step 4: Commit**

```bash
cd ..
git add react-site/package.json react-site/package-lock.json react-site/src/main.tsx
git commit -m "feat: add react-router-dom and route /r/:slug"
```

---

### Task 6: Create Countdown.tsx

**Files:**
- Create: `react-site/src/components/Countdown.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useEffect, useState } from 'react'

interface Props {
  deadline: number
  onExpire: () => void
}

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, '0')
}

export default function Countdown({ deadline, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()))

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const id = setInterval(() => {
      const r = Math.max(0, deadline - Date.now())
      setRemaining(r)
      if (r <= 0) {
        clearInterval(id)
        onExpire()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [deadline, onExpire])

  const totalSeconds = remaining / 1000
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const warning = remaining > 0 && remaining < 6 * 3600 * 1000

  return (
    <div className={`reserved-countdown${warning ? ' reserved-countdown--warning' : ''}`}>
      <div className="reserved-countdown-block">
        <span className="reserved-countdown-value">{pad(hours)}</span>
        <span className="reserved-countdown-label">HEURES</span>
      </div>
      <span className="reserved-countdown-sep">:</span>
      <div className="reserved-countdown-block">
        <span className="reserved-countdown-value">{pad(minutes)}</span>
        <span className="reserved-countdown-label">MINUTES</span>
      </div>
      <span className="reserved-countdown-sep">:</span>
      <div className="reserved-countdown-block">
        <span className="reserved-countdown-value">{pad(seconds)}</span>
        <span className="reserved-countdown-label">SECONDES</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add react-site/src/components/Countdown.tsx
git commit -m "feat: add Countdown component"
```

---

### Task 7: Create ReservedCheckoutModal.tsx

**Files:**
- Create: `react-site/src/components/ReservedCheckoutModal.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState, useEffect } from 'react'

interface Props {
  plan: 'essentiel' | 'pro'
  billing: 'monthly' | 'annual'
  slug: string
  email: string
  firstName: string
  onClose: () => void
}

const PLAN_LABELS: Record<string, string> = {
  essentiel: 'Essentiel',
  pro: 'Pro',
}

const PRICES: Record<string, string> = {
  essentiel_monthly: '29 €/mois',
  essentiel_annual: '278 €/an',
  pro_monthly: '49 €/mois',
  pro_annual: '470 €/an',
}

export default function ReservedCheckoutModal({ plan, billing, slug, email, firstName: defaultFirstName, onClose }: Props) {
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const planLabel = PLAN_LABELS[plan]
  const price = PRICES[`${plan}_${billing}`]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing, slug, firstName, email, phone, lastName: '', companyName: '' }),
      })
      if (res.status === 410) {
        setError('Votre réservation a expiré. Rechargez la page.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Une erreur est survenue.')
        setLoading(false)
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px 36px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Finaliser {planLabel}</h2>
            <p style={{ fontSize: '14px', color: '#007AFF', fontWeight: 600, margin: '4px 0 0' }}>{price}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        <div style={{ background: '#f5f5f7', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✉️</span>
          <span style={{ fontSize: '14px', color: '#555', fontWeight: 500, flex: 1 }}>{email}</span>
          <span style={{ fontSize: '11px', background: '#ddd', borderRadius: '6px', padding: '2px 8px', color: '#888', flexShrink: 0 }}>Verrouillé</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Prénom <span style={{ color: '#e53e3e' }}>*</span></label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Guillaume" style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Numéro de téléphone (WhatsApp) <span style={{ color: '#e53e3e' }}>*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" style={inputStyle} required />
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Utilisé pour recevoir vos alertes WhatsApp</p>
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '12px 14px', color: '#c53030', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#a0c4ff' : '#007AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {loading ? 'Redirection...' : 'Continuer vers le paiement →'}
          </button>
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
            🔒 Paiement sécurisé par Stripe. Aucune carte stockée.
          </p>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '10px',
  fontSize: '15px', color: '#1a1a1a', outline: 'none', background: '#fafafa', boxSizing: 'border-box',
}
```

- [ ] **Step 2: Commit**

```bash
git add react-site/src/components/ReservedCheckoutModal.tsx
git commit -m "feat: add ReservedCheckoutModal component"
```

---

### Task 8: Create ReservedPricing.tsx

**Files:**
- Create: `react-site/src/components/ReservedPricing.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from 'react'
import ReservedCheckoutModal from './ReservedCheckoutModal'

interface Props {
  slug: string
  email: string
  firstName: string
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l4 4 6-7" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function ReservedPricing({ slug, email, firstName }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [modal, setModal] = useState<{ plan: 'essentiel' | 'pro'; billing: 'monthly' | 'annual' } | null>(null)

  const essentielPrice = billing === 'annual' ? '278 €/an' : '29 €/mois'
  const proPrice = billing === 'annual' ? '470 €/an' : '49 €/mois'
  const proSuffix = billing === 'annual' ? ' · 2 mois offerts' : ''

  return (
    <div className="reserved-col-right">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Récupérez votre place
        </span>
        <div className="reserved-pricing-toggle">
          <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')}>Mensuel</button>
          <button className={billing === 'annual' ? 'active' : ''} onClick={() => setBilling('annual')}>
            Annuel <span className="reserved-toggle-badge">–17%</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '12px' }}>
        {/* Essentiel */}
        <div className="reserved-card">
          <div className="reserved-card-name">ESSENTIEL</div>
          <div className="reserved-card-price">{essentielPrice}</div>
          <ul className="reserved-card-features">
            <li><CheckIcon /> 1 alerte active</li>
            <li><CheckIcon /> Scan toutes les 30 min</li>
            <li><CheckIcon /> WhatsApp ou mail</li>
            <li><CheckIcon /> Auto1 uniquement</li>
          </ul>
          <button className="reserved-cta-secondary" onClick={() => setModal({ plan: 'essentiel', billing })}>
            Prendre Essentiel
          </button>
        </div>

        {/* Pro */}
        <div className="reserved-card reserved-card--pro">
          <div className="reserved-card-badge">★ RECOMMANDÉ</div>
          <div className="reserved-card-name" style={{ color: '#007AFF' }}>PRO</div>
          <div className="reserved-card-price" style={{ color: '#007AFF' }}>
            {proPrice}
            {proSuffix && <span style={{ fontSize: '11px', color: '#666', fontWeight: 400 }}>{proSuffix}</span>}
          </div>
          <ul className="reserved-card-features">
            <li><CheckIcon /> <strong>10 alertes actives</strong></li>
            <li><CheckIcon /> <strong>Scan en direct</strong></li>
            <li><CheckIcon /> WhatsApp ou mail</li>
            <li><CheckIcon /> <strong>5 sources</strong> (Auto1, LBC, FB…)</li>
            <li><CheckIcon /> Support prioritaire</li>
          </ul>
          <button className="reserved-cta-primary" onClick={() => setModal({ plan: 'pro', billing })}>
            Je récupère ma place →
          </button>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '10px' }}>
        🔒 Paiement sécurisé Stripe · Sans engagement au mensuel
      </p>

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <button
          className="reserved-crisp-link"
          onClick={() => (window as unknown as { $crisp?: { push: (a: unknown[]) => void } }).$crisp?.push(['do', 'chat:open'])}
        >
          💬 Une question ? Discuter avec nous →
        </button>
      </div>

      {modal && (
        <ReservedCheckoutModal
          plan={modal.plan}
          billing={modal.billing}
          slug={slug}
          email={email}
          firstName={firstName}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add react-site/src/components/ReservedPricing.tsx
git commit -m "feat: add ReservedPricing component"
```

---

### Task 9: Create ReservedPage.tsx

**Files:**
- Create: `react-site/src/pages/ReservedPage.tsx`

- [ ] **Step 1: Create the pages directory and file**

```bash
mkdir -p react-site/src/pages
```

```tsx
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Countdown from '../components/Countdown'
import ReservedPricing from '../components/ReservedPricing'

interface Reservation {
  slug: string
  firstName: string
  email: string
  deadline: number
  status: 'active' | 'converted' | 'expired' | 'waitlisted'
}

export default function ReservedPage() {
  const { slug } = useParams<{ slug: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expired, setExpired] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  useEffect(() => {
    fetch(`/api/reservations/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((data: Reservation | null) => {
        if (!data) return
        setReservation(data)
        if (data.status !== 'active' || data.deadline <= Date.now()) {
          setExpired(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleExpire = useCallback(() => setExpired(true), [])

  const handleWaitlist = async () => {
    setWaitlistLoading(true)
    try {
      const res = await fetch(`/api/reservations/${slug}/waitlist`, { method: 'POST' })
      if (res.ok) setWaitlistDone(true)
    } finally {
      setWaitlistLoading(false)
    }
  }

  const openCrisp = () => {
    (window as unknown as { $crisp?: { push: (a: unknown[]) => void } }).$crisp?.push(['do', 'chat:open'])
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #007AFF', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: '-apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', color: '#1a1a1a' }}>Ce lien n'existe pas</h1>
        <a href="/" style={{ color: '#007AFF', fontSize: '16px' }}>Retour à l'accueil</a>
      </div>
    )
  }

  const res = reservation!
  const isConverted = res.status === 'converted'
  const isExpiredOrWaitlisted = expired || ['expired', 'waitlisted'].includes(res.status)

  return (
    <div className="reserved-page">
      {/* Nav */}
      <nav className="reserved-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#007AFF,#5856d6)', borderRadius: '8px' }} />
          <span style={{ fontWeight: 800, fontSize: '17px', color: '#1a1a1a' }}>SniperAuto</span>
        </div>
        <span style={{ fontSize: '13px', color: '#888' }}>🔒 Page personnelle sécurisée</span>
      </nav>

      {isExpiredOrWaitlisted || isConverted ? (
        /* ── Expiry / Converted state ── */
        <div className="reserved-expired-wrap">
          {isConverted ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h1 className="reserved-expired-title">Votre abonnement SniperAuto est actif</h1>
              <p className="reserved-expired-body">
                Bienvenue dans SniperAuto ! Notre équipe vous contacte pour finaliser votre configuration.
              </p>
              <a href="/" className="reserved-cta-primary" style={{ display: 'inline-block', marginTop: '8px', textDecoration: 'none' }}>
                Retour à l'accueil
              </a>
            </>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⌛</div>
              <h1 className="reserved-expired-title">Votre place a été réattribuée</h1>
              <p className="reserved-expired-body">
                Le délai de 48h est écoulé. Votre place a été proposée à un autre client de la liste d'attente.
                Vous pouvez rejoindre la liste à nouveau pour être recontacté dès qu'une nouvelle place se libère.
              </p>
              {waitlistDone ? (
                <p style={{ color: '#34c759', fontWeight: 600, marginTop: '16px', fontSize: '16px' }}>
                  ✅ Vous êtes inscrit, nous vous recontacterons.
                </p>
              ) : (
                <button className="reserved-cta-primary" onClick={handleWaitlist} disabled={waitlistLoading} style={{ marginTop: '16px' }}>
                  {waitlistLoading ? 'Inscription...' : "Rejoindre à nouveau la liste d'attente"}
                </button>
              )}
            </>
          )}
          <div style={{ marginTop: '24px' }}>
            <button className="reserved-crisp-link" onClick={openCrisp}>
              💬 Une question ? Discuter avec nous →
            </button>
          </div>
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rappel — comment ça marche
            </p>
            <video
              src="/demo-sniperauto.mp4"
              autoPlay muted loop playsInline
              style={{ maxWidth: '480px', width: '100%', borderRadius: '12px' }}
            />
          </div>
        </div>
      ) : (
        /* ── Active state ── */
        <>
          <div className="reserved-hero">
            <p className="reserved-eyebrow">👋 Bonjour {res.firstName || ''}</p>
            <h1 className="reserved-title">
              Votre place est réservée <span style={{ color: '#007AFF' }}>48 h</span>
            </h1>
            <p className="reserved-subtitle">
              Passé ce délai, elle sera réattribuée au prochain client de la liste d'attente.
            </p>
            <Countdown deadline={res.deadline} onExpire={handleExpire} />
          </div>

          <div className="reserved-grid">
            {/* Left: video + benefits */}
            <div className="reserved-col-left">
              <p className="reserved-col-label">Rappel — comment ça marche</p>
              <video src="/demo-sniperauto.mp4" autoPlay muted loop playsInline className="reserved-video" />
              <div className="reserved-benefits">
                <div className="reserved-benefit-card">
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <span>Alertes WhatsApp ou mail</span>
                </div>
                <div className="reserved-benefit-card">
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <span>Scoring IA des deals</span>
                </div>
                <div className="reserved-benefit-card">
                  <span style={{ fontSize: '20px' }}>🔍</span>
                  <span>5 sources 24/7</span>
                </div>
              </div>
            </div>

            {/* Right: pricing */}
            <ReservedPricing slug={res.slug} email={res.email} firstName={res.firstName} />
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
cd react-site
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd ..
git add react-site/src/pages/ReservedPage.tsx
git commit -m "feat: add ReservedPage component"
```

---

### Task 10: Add .reserved-* CSS to index.css

**Files:**
- Modify: `react-site/src/index.css`

- [ ] **Step 1: Append the reserved styles at the very end of index.css**

```css
/* =====================================================
   RESERVED PAGES — /r/:slug
   All classes prefixed .reserved-* to avoid homepage collisions
   ===================================================== */

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reserved-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Nav */
.reserved-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

/* Hero */
.reserved-hero {
  text-align: center;
  padding: 24px 40px 16px;
  background: linear-gradient(180deg, #fafbff 0%, #fff 100%);
  flex-shrink: 0;
}

.reserved-eyebrow {
  font-size: 13px;
  color: #007AFF;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 6px;
}

.reserved-title {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 900;
  color: #1a1a1a;
  margin: 0 0 6px;
  line-height: 1.1;
}

.reserved-subtitle {
  font-size: 14px;
  color: #555;
  margin: 0 0 12px;
}

/* Countdown */
.reserved-countdown {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.reserved-countdown-block {
  background: #111;
  color: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 60px;
  text-align: center;
  transition: background 0.3s;
}

.reserved-countdown--warning .reserved-countdown-block {
  background: #FF3B30;
}

.reserved-countdown-value {
  display: block;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 900;
  line-height: 1;
}

.reserved-countdown-label {
  display: block;
  font-size: 9px;
  opacity: 0.7;
  letter-spacing: 1px;
  margin-top: 3px;
}

.reserved-countdown-sep {
  font-size: 28px;
  font-weight: 900;
  color: #111;
  line-height: 1;
  padding-bottom: 8px;
}

/* Main grid */
.reserved-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
  padding: 16px 40px 24px;
  flex: 1;
}

.reserved-col-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reserved-col-label {
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.reserved-video {
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  background: #000;
}

/* Benefits */
.reserved-benefits {
  display: flex;
  gap: 8px;
}

.reserved-benefit-card {
  flex: 1;
  background: #f5f5f7;
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

/* Pricing */
.reserved-col-right {
  display: flex;
  flex-direction: column;
}

.reserved-pricing-toggle {
  display: flex;
  background: #f5f5f7;
  border-radius: 20px;
  padding: 2px;
}

.reserved-pricing-toggle button {
  border: none;
  background: transparent;
  border-radius: 18px;
  padding: 4px 12px;
  font-size: 11px;
  cursor: pointer;
  color: #555;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.reserved-pricing-toggle button.active {
  background: #111;
  color: #fff;
  font-weight: 700;
}

.reserved-toggle-badge {
  font-size: 9px;
  font-weight: 700;
  opacity: 0.85;
}

/* Cards */
.reserved-card {
  border: 1.5px solid #e5e5ea;
  border-radius: 14px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.reserved-card--pro {
  border: 2px solid #007AFF;
  background: linear-gradient(180deg, #f0f6ff 0%, #fff 100%);
}

.reserved-card-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #007AFF;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.reserved-card-name {
  font-size: 11px;
  font-weight: 700;
  color: #666;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.reserved-card-price {
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1;
}

.reserved-card-features {
  list-style: none;
  padding: 0;
  margin: 4px 0 8px;
  font-size: 11px;
  color: #333;
  line-height: 1.8;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.reserved-card-features li {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* CTAs */
.reserved-cta-primary {
  width: 100%;
  padding: 10px;
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
}

.reserved-cta-primary:hover {
  background: #0066cc;
}

.reserved-cta-primary:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
}

.reserved-cta-secondary {
  width: 100%;
  padding: 10px;
  background: #fff;
  color: #007AFF;
  border: 1.5px solid #007AFF;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.reserved-cta-secondary:hover {
  background: #f0f6ff;
}

.reserved-crisp-link {
  background: none;
  border: none;
  color: #007AFF;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 0;
  text-decoration: underline;
  font-family: inherit;
}

/* Expired/converted state */
.reserved-expired-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  flex: 1;
}

.reserved-expired-title {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 900;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.reserved-expired-body {
  font-size: 16px;
  color: #555;
  max-width: 480px;
  line-height: 1.6;
  margin: 0;
}

/* Mobile */
@media (max-width: 767px) {
  .reserved-nav {
    padding: 12px 20px;
  }

  .reserved-hero {
    padding: 20px 20px 14px;
  }

  .reserved-grid {
    grid-template-columns: 1fr;
    padding: 16px 20px 24px;
  }

  .reserved-benefits {
    flex-direction: column;
  }

  .reserved-benefit-card {
    flex-direction: row;
    text-align: left;
  }

  .reserved-expired-wrap {
    padding: 40px 20px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add react-site/src/index.css
git commit -m "feat: add .reserved-* CSS for reservation pages"
```

---

### Task 11: Build and end-to-end test

**Files:** none new

- [ ] **Step 1: Build the React app**

```bash
cd react-site
npm run build
```

Expected: build completes with no TypeScript or Vite errors. Files land in `../public/`.

- [ ] **Step 2: Run the seed script**

```bash
cd ..
node seed-reservations.js
```

Expected: 6 rows inserted, 6 URLs displayed.

- [ ] **Step 3: Start the dashboard server**

```bash
node dashboard.js &
sleep 2
```

- [ ] **Step 4: Test the GET endpoint**

```bash
curl -s http://localhost:3000/api/reservations/guillaumeponton | jq .
```

Expected:
```json
{
  "slug": "guillaumeponton",
  "firstName": "Guillaume",
  "email": "guillaume.ponton@gmail.com",
  "deadline": 1745680800000,
  "status": "active"
}
```

- [ ] **Step 5: Test 404**

```bash
curl -s http://localhost:3000/api/reservations/unknown | jq .
```

Expected: `{"error": "Not found"}`

- [ ] **Step 6: Test SPA catch-all serves the React app**

```bash
curl -s http://localhost:3000/r/guillaumeponton | grep -c "SniperAuto"
```

Expected: `1` (the HTML page contains "SniperAuto" in the title/meta).

- [ ] **Step 7: Open in browser and verify the full page**

Open `http://localhost:3000/r/guillaumeponton` in a browser.

Verify:
- ✅ Nav: logo + "🔒 Page personnelle sécurisée"
- ✅ "👋 Bonjour Guillaume"
- ✅ Countdown ticking down (3 black blocks)
- ✅ Video autoplays muted in loop on the left
- ✅ 3 benefit cards: "Alertes WhatsApp ou mail", "Scoring IA des deals", "5 sources 24/7"
- ✅ Toggle Annuel selected by default, Pro card has "★ RECOMMANDÉ" badge
- ✅ Crisp widget visible bottom-right
- ✅ "💬 Une question ? Discuter avec nous →" link opens Crisp

- [ ] **Step 8: Test the admin seed endpoint**

```bash
ADMIN_TOKEN=$(grep ADMIN_TOKEN .env | cut -d= -f2)
curl -s -X POST http://localhost:3000/api/reservations/seed \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"reservations":[{"slug":"test123","email":"test@test.com","firstName":"Test"}],"durationHours":1}' | jq .
```

Expected: `{"ok": true, "deadline": ..., "count": 1}`

- [ ] **Step 9: Test expired state**

Manually set a reservation's deadline to the past:

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('auto1.db');
db.prepare('UPDATE reservations SET deadline = ? WHERE slug = ?').run(Date.now() - 1000, 'test123');
db.close();
console.log('Done');
"
```

Then: `curl -s http://localhost:3000/api/reservations/test123 | jq .status`

Expected: `"expired"`

- [ ] **Step 10: Test waitlist endpoint**

```bash
curl -s -X POST http://localhost:3000/api/reservations/test123/waitlist \
  -H "Content-Type: application/json" | jq .
```

Expected: `{"ok": true}`

- [ ] **Step 11: Kill server and commit**

```bash
kill %1
git add -A
git commit -m "feat: complete 48h reservation pages — build passes, endpoints verified"
```

---

## Self-Review

**Spec coverage check:**
- §2.1 react-router-dom → Task 5 ✅
- §2.2 reservations table → Task 2 ✅
- §2.3 /r/:slug routing + SPA fallback → Tasks 5 + 3 (step 8) ✅
- §2.4 all 4 endpoints → Task 3 ✅
- §2.5 seed-reservations.js → Task 4 ✅
- §3.1 ReservedPage states → Task 9 ✅
- §3.2 no-scroll desktop layout → Tasks 9 + 10 ✅
- §3.3 expiry layout + waitlist button → Task 9 ✅
- §3.4 ReservedCheckoutModal (short) → Task 7 ✅
- §3.5 Countdown + red warning < 6h → Task 6 ✅
- §4 CSS .reserved-* → Task 10 ✅
- ADMIN_TOKEN env var → Task 1 ✅
- Crisp link → Tasks 8 + 9 ✅
- Video autoplay → Task 9 ✅
- email pre-filled + locked → Task 7 ✅

**No placeholders:** ✅  
**Type consistency:** `'essentiel' | 'pro'` and `'monthly' | 'annual'` used consistently across ReservedPricing, ReservedCheckoutModal, and /api/checkout payload. ✅
