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
`POST /api/auth/login` (active only) · `POST /api/auth/logout` · `GET /api/auth/me` ·
`POST /api/auth/forgot` · `GET|POST /api/auth/reset`

Partners and administrators sign in through **separate pages** —
`/{lang}/affiliate/login/` and `/{lang}/affiliate/admin-login/` — against the same
endpoint. The page checks the returned role and, at the wrong door, logs the session
straight back out and points at the right one. The role decides access; the page
only decides where you land.

**Tracking** —
`GET /r?ref=CODE&c=<campaign>&to=/services/grow/` logs the click, sets a
first-party attribution cookie, and 302s to the site.
`POST /track/conversion` (header `x-webhook-secret`) reports a sale from the
checkout/CRM → attributes by `ref` or `coupon` (enforces the attribution window
+ blocks self-referral) → creates a **pending** conversion.
`POST /track/lead` records a client request from a site form. A `ref`/`coupon` (or
the signed attribution cookie) attributes it to a partner; with `direct: true` in
the body an *unattributed* request is recorded too (`partner_id NULL`, no
commission) so the admin works a single queue, where it shows tagged **direct**.
Both site forms — the contact form and the product request forms — set `direct`,
so this table holds contact details for every site lead, not only affiliate ones;
treat its retention like any other lead store. Partners still only ever see their
own (`GET /api/partner/leads`), and without contact details.
`meta` carries whatever else that form asked, stored as submitted (flat scalars,
sanitized) so the admin console can show the form the way the CRM does.

**Two attribution paths, deliberately different.** A code that arrives only in the
signed cookie goes through `attribute()`, which demands a logged click inside the
window — a bare `?ref=` on a URL proves nothing. A code submitted *on the form*
goes through `attributeCode()`: it matches either the referral **or** the coupon
code and needs no prior click, because deliberately entering a partner's code is
itself the evidence. Requiring a click there would silently rob partners who sell
face to face. Both paths still require an active partner and block self-referral.

**Partner** (`/api/partner/*`, auth) — `overview` · `wallet` · `conversions` ·
`links` (GET/POST) · `catalog` · `profile` (GET/PATCH) · `payouts` (POST request).

**Admin** (`/api/admin/*`, admin) — `overview` · `partners` +
`partners/:id/{approve,suspend,reinstate}` · `conversions` +
`conversions/:id/{approve,reject,reverse}` (approve/reverse post to the ledger) ·
`leads` + `leads/:id/{won,lost,reopen}` · `offers` (GET/POST) + `offers/:id`
(PATCH) · `payouts` + `payouts/:id/{approve,paid,reject}`
(`paid` records the ledger debit) · `settings` (GET/PUT).

`leads/:id/won` takes a `deal_value`. For an attributed lead it creates an approved
conversion and credits the commission; for a direct one it just closes the lead
with the deal value on record — there is nobody to pay.

## Email
Transactional mail goes through **Resend** over plain `fetch` — no SDK. Configure
`RESEND_API_KEY`, `MAIL_FROM` (its domain must be **Verified** in Resend),
`MAIL_REPLY_TO` and `MAIL_ADMIN`. Without a key the app still boots and every flow
still answers normally; it just logs instead of delivering.

Four messages, each in the recipient's own language:

| When | To | Carries |
|---|---|---|
| A request arrives (`POST /track/lead`) | `MAIL_ADMIN` | client details, which partner (or *Direct*), a link to the queue |
| A lead is marked won or lost | the client | the outcome, plus whatever the admin typed in `message` — that is the "reply" |
| A lead is marked won **and** has a partner | the partner | the client, the product, and the commission credited |
| A password reset is requested | the partner | a single-use link |

`send()` never throws at the caller and notifications are never awaited into a
response: a mail outage must not cost a visitor their submission, and must not make
an admin think a decision failed and click it twice.

**Because of that, a broken mail setup is invisible from the outside** — `/forgot`
answers 200 either way. `GET /api/admin/mail-status` (admin) reports whether a key
is configured, the From address, the alert inbox, and the last failure reason;
`POST /api/admin/mail-test` sends a real message to the signed-in admin. Both are
surfaced in the admin console under **Program settings → Outbound email**. If reset
links are not arriving, look there first.

## How money is accounted
Balances derive from an **append-only `ledger`**: `commission` credits on
conversion *approval*, `reversal` debits on reversal, `payout` debits when a
payout is marked *paid*. Pending conversions are shown separately and never hit
the ledger until approved.

## The product catalogue
`products` is the single source of truth for what partners may promote. Publishing
a card on `/{lang}/solutions/` does **not** register it — the catalogue also carries
a commission rate and a `promotable` flag, which the partnerships team decides. Add
one from the admin console (**Products & offers → Add product**, i.e.
`POST /api/admin/offers`); `schema.sql` only seeds the reference set.

The portal shows **ready-to-launch products only**. NX's consulting services are
sold by its own team, so `kind = 'service'` rows are not promotable and the portal
has no Services view; `renderCatalog()` still knows how to fill one if it comes
back, and meanwhile a service left promotable renders with the products rather
than vanishing. A `path` that keeps its language segment
(`/ar/solutions/plate-market/`) is language-locked — `deepLink()` leaves it alone
instead of prefixing the partner's own language onto a 404.

Retiring an entry means setting `promotable = false`, never deleting the row:
conversions reference `product_id`.

## Tracking & security (best-practice)
First-party signed attribution cookie · server-side click log with hashed IPs
(PDPL) · 30s de-dupe + self-referral block · attribution window enforced on the
server · conversions confirmed server-side before crediting · rate limiting ·
helmet headers · bcrypt password hashing · parameterized SQL · secrets via env.
