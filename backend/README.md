# NX Partners — backend (Node + PostgreSQL)

Phase 2b of the affiliate/commission-marketing program. Powers the partner
dashboard and admin console (`/{ar,en}/affiliate/portal|admin/`) and the public
referral tracking. Self-hostable on Coolify/Docker; data stays in-domain (PDPL).

> **Money-safety rule:** this service **never moves money**. It records,
> approves and tracks commission and payout *status* only. Actual bank transfers
> are executed by NX outside this system.

## Stack
Express · PostgreSQL (`pg`, raw SQL) · bcryptjs · helmet · express-rate-limit.
Opaque DB-backed sessions in an HttpOnly, SameSite=Lax cookie. No ORM.

## Run locally
```bash
cd backend
cp .env.example .env            # then edit secrets + DATABASE_URL
npm install
createdb nx_partners            # or point DATABASE_URL at any Postgres
npm run migrate
npm run seed                    # demo products + admin + a demo partner with history
npm start                       # http://localhost:4000/api/health
```
`npm run reset` = drop + migrate + seed.

## Run with Docker
```bash
cd backend
SESSION_SECRET=$(openssl rand -base64 48) IP_SALT=$(openssl rand -base64 48) \
WEBHOOK_SECRET=$(openssl rand -base64 48) docker compose up --build
```

## Environment
See `.env.example`. In production the app refuses to boot if `SESSION_SECRET`,
`IP_SALT` or `WEBHOOK_SECRET` are left at their `dev-` defaults.

## API
Base: JSON, cookie auth. State-changing requests are same-origin guarded; the
marketing origin (`PUBLIC_ORIGIN`) is allowed via CORS with credentials.

**Auth** — `POST /api/auth/register` (application + password → *pending*) ·
`POST /api/auth/login` (active only) · `POST /api/auth/logout` · `GET /api/auth/me`

**Tracking** —
`GET /r?ref=CODE&c=<campaign>&to=/services/grow/` logs the click, sets a
first-party attribution cookie, and 302s to the site.
`POST /track/conversion` (header `x-webhook-secret`) reports a sale from the
checkout/CRM → attributes by `ref` or `coupon` (enforces the attribution window
+ blocks self-referral) → creates a **pending** conversion.

**Partner** (`/api/partner/*`, auth) — `overview` · `wallet` · `conversions` ·
`links` (GET/POST) · `catalog` · `profile` (GET/PATCH) · `payouts` (POST request).

**Admin** (`/api/admin/*`, admin) — `overview` · `partners` +
`partners/:id/{approve,suspend,reinstate}` · `conversions` +
`conversions/:id/{approve,reject,reverse}` (approve/reverse post to the ledger) ·
`offers` + `offers/:id` · `payouts` + `payouts/:id/{approve,paid,reject}`
(`paid` records the ledger debit) · `settings` (GET/PUT).

## How money is accounted
Balances derive from an **append-only `ledger`**: `commission` credits on
conversion *approval*, `reversal` debits on reversal, `payout` debits when a
payout is marked *paid*. Pending conversions are shown separately and never hit
the ledger until approved.

## Wiring the front-end
The partner/admin pages currently render from an in-file `DATA` object in
`assets/js/nx-portal.js`. Swap each render for a `fetch()` to the matching
endpoint above (shapes already match). Point the landing **Register** form at
`POST /api/auth/register` and **Login** at `POST /api/auth/login`, and route the
referral links/deep-links through `GET /r` so clicks are logged.

## Tracking & security (best-practice)
First-party signed attribution cookie · server-side click log with hashed IPs
(PDPL) · 30s de-dupe + self-referral block · attribution window enforced on the
server · conversions confirmed server-side before crediting · rate limiting ·
helmet headers · bcrypt password hashing · parameterized SQL · secrets via env.
