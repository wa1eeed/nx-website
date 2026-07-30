# NX Partners backend — deploy & go-live (Coolify)

The marketing site is already live on Coolify: a single **nginx** container
(Traefik terminates TLS; `www.nx.sa` → `nx.sa`). This adds the **NX Partners
backend** (Node + PostgreSQL) as its **own** Coolify resource at **`api.nx.sa`**,
so the live site's nginx config is never touched.

> Reminder: the backend **never moves money** — it records/approves/tracks
> commission and payout *status* only. Bank transfers happen outside it.

---

## 0) Publish the front-end (one redeploy)

The affiliate pages/portal are in the repo but not deployed yet
(`https://nx.sa/ar/affiliate/` currently 404s). In Coolify → the **static site**
app → **Redeploy** (or push-to-deploy if a webhook is set). After it, the
landing + portal are live in **demo mode** until the backend below is up — that's
expected and safe (they fall back to the labelled preview).

## 1) Create the backend resource

> **No database yet? You don't need one in advance.** `docker-compose.yaml`
> ships its **own** PostgreSQL container with a persistent `pgdata` volume — the
> DB is created automatically on first deploy. (If you'd rather use a
> Coolify-managed PostgreSQL, provision one in a click and point `DATABASE_URL`
> at it instead — then deploy just the `app` service.)

**Recommended — one Compose service (app + Postgres)** using
`backend/docker-compose.yaml`:

1. Coolify → same project → **+ New Resource → Docker Compose**.
2. Repository = this repo, **Base directory = `/backend`**, compose =
   `docker-compose.yaml`.
3. Give the **app** service the domain **`api.nx.sa`** (Coolify → the app →
   Domains → `https://api.nx.sa`; port `4000`). Traefik issues its TLS cert.
   Add an `A`/`CNAME` DNS record for `api.nx.sa` → the server first.
4. Environment variables:
   ```
   DB_PASSWORD=<openssl rand -base64 24>
   SESSION_SECRET=<openssl rand -base64 48>
   IP_SALT=<openssl rand -base64 48>
   WEBHOOK_SECRET=<openssl rand -base64 48>
   PUBLIC_ORIGIN=https://nx.sa
   COOKIE_DOMAIN=.nx.sa
   ```
5. Deploy. The app runs `migrate` on boot (idempotent) then starts; Postgres
   persists in the `pgdata` volume.

Generate secrets:
```bash
for k in SESSION_SECRET IP_SALT WEBHOOK_SECRET; do echo "$k=$(openssl rand -base64 48)"; done
```
The app **refuses to boot in production** if any secret is still a `dev-` default.

Sanity check once up: `https://api.nx.sa/api/health` → `{"ok":true}`.

## 2) Why this "just works" with the front-end

- The 6 affiliate pages already carry `<meta name="nx-api" content="https://api.nx.sa">`,
  so `window.NXApi` calls `https://api.nx.sa/...`.
- `PUBLIC_ORIGIN=https://nx.sa` → CORS allows the site origin **with credentials**.
- `COOKIE_DOMAIN=.nx.sa` → the session cookie is shared between `nx.sa` and
  `api.nx.sa` (same registrable domain → SameSite=Lax is sent on these
  same-site requests; Secure over HTTPS in prod). No nginx changes on the site.

> If you ever move the API to a different host, change the `<meta name="nx-api">`
> on the 6 pages (and `PUBLIC_ORIGIN`) — nothing else.

## 3) Create the first admin — easiest: via env vars (no terminal)

Add two Environment variables and redeploy; the app creates/promotes this admin
on boot (idempotent):
```
ADMIN_EMAIL=you@nx.sa
ADMIN_PASSWORD=a-strong-password-8+chars
```
Then log in at `https://nx.sa/en/affiliate/` → you land in `/en/affiliate/admin/`.
(You can remove `ADMIN_PASSWORD` afterwards; the admin persists in the DB.)

Alternative (terminal, one-off): `node src/db/create-admin.js you@nx.sa 'pass' 'Name'`.

## 4) Set the REAL program figures (no redeploy)

Admin → **Program settings** → set & save: base commission %, coupon %,
growth/elite tier %, referral window (days), minimum payout, payout schedule.
These persist in the DB and are served at `GET /api/program`; the landing
**earnings estimator** reads it, so the public site shows the real rate the
moment you save — nothing hard-coded.

## 5) Wire the real tracking

- **Referral / deep links:** partners share the clean links the portal shows —
  `https://nx.sa/?ref=CODE` or any deep link `https://nx.sa/…/?ref=CODE`. Every
  nx.sa page auto-fires a background beacon to `api.nx.sa/track/click` that logs
  the click + drops the first-party attribution cookie (no redirect, no nginx
  changes). A redirect form `https://api.nx.sa/r?ref=CODE&to=/services/grow/` is
  also available for external/ad links.
- **Conversions:** when a referred deal closes, the checkout/CRM calls
  `POST https://api.nx.sa/track/conversion` with header
  `x-webhook-secret: <WEBHOOK_SECRET>` and
  `{ ref | coupon, product, deal_value, client_email?, external_ref }` →
  creates a **pending** conversion; approve it in the admin to credit the ledger.

## Go-live checklist
- [ ] Static app redeployed → `https://nx.sa/ar/affiliate/` loads (demo).
- [ ] DNS `api.nx.sa` → server; domain added in Coolify (Traefik cert issued).
- [ ] Backend up → `https://api.nx.sa/api/health` = `{"ok":true}`; real secrets set;
      `PUBLIC_ORIGIN=https://nx.sa`; `COOKIE_DOMAIN=.nx.sa`.
- [ ] First admin created; admin console loads live from `nx.sa`.
- [ ] Program figures set; estimator shows the real rate.
- [ ] Register on the landing → account **pending** in admin → approve → login works.
- [ ] Test `/r?ref=…` click + a `POST /track/conversion` create records.

---

### Appendix — same-origin alternative (only if you later drop the subdomain)
To serve the API under `nx.sa/api` instead, add this to the site's `nginx.conf`
**using a resolver + variable** so a down/misnamed backend returns 502 for `/api`
only and never stops nginx from starting:
```nginx
location ~ ^/(api|r|track)(/|$) {
    resolver 127.0.0.11 valid=30s ipv6=off;      # Docker DNS
    set $nx_upstream nx-partners-app:4000;         # backend service name:port
    proxy_pass http://$nx_upstream$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location /backend/ { return 404; }
```
Then remove the `<meta name="nx-api">` from the 6 pages (same-origin) and set
`PUBLIC_ORIGIN=https://nx.sa` (no `COOKIE_DOMAIN` needed).
