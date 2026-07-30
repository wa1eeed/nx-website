# NX Partners backend — deploy & go-live (Coolify)

Phase 2c go-live. The marketing site (static) is already on Coolify. This adds
the **NX Partners backend** (Node + PostgreSQL) and routes `/api` + `/r` on
`nx.sa` to it, so the portal/landing talk to it on the same origin (cookies just
work, no CORS).

> Reminder: the backend **never moves money** — it records/approves/tracks
> commission and payout *status* only. Bank transfers happen outside it.

---

## 1) Provision on Coolify

**Recommended — one Compose service (app + Postgres)** using the included
`backend/docker-compose.yml`:

1. Coolify → your project → **+ New Resource → Docker Compose**.
2. Repository = this repo, **Base directory = `/backend`**, compose file =
   `docker-compose.yml`.
3. Set environment variables (Coolify → the resource → Environment):
   ```
   DB_PASSWORD=<openssl rand -base64 24>
   SESSION_SECRET=<openssl rand -base64 48>
   IP_SALT=<openssl rand -base64 48>
   WEBHOOK_SECRET=<openssl rand -base64 48>
   PUBLIC_ORIGIN=https://nx.sa
   COOKIE_DOMAIN=.nx.sa
   ```
4. Deploy. The app container runs `migrate` on boot (idempotent) then starts.
   Postgres data persists in the `pgdata` volume.

**Alternative** — a managed Postgres + a plain Node service: create a Postgres
resource, then a Node app from `/backend` with `DATABASE_URL` pointing at it and
the same secrets. Coolify sets `PORT`; the app honors it.

Generate the three secrets locally:
```bash
for k in SESSION_SECRET IP_SALT WEBHOOK_SECRET; do echo "$k=$(openssl rand -base64 48)"; done
```
The app **refuses to boot in production** if any secret is left at its `dev-` default.

## 2) Create the first admin (one-off, non-destructive)

Never run `npm run seed` in production (it wipes partners+products). Instead, in
the app container's terminal (Coolify → the app → Terminal):
```bash
node src/db/create-admin.js you@nx.sa 'a-strong-password' 'NX Partnerships'
```
This creates (or promotes) an active admin. Log in at `https://nx.sa/en/affiliate/`
→ Log in → you land in `/en/affiliate/admin/`.

Optionally load the real product catalog once (products only) — or add them from
the admin's **Products & offers** tab.

## 3) Route /api and /r to the backend (same-origin)

The front-end calls same-origin `/api/*`, `/r`, `/track/*`. Point those paths at
the backend. If the static site is served by **nginx**, add to its `server`
block (backend reachable at `BACKEND` — a service name/host:port, e.g.
`http://nx-partners-app:4000`):

```nginx
# NX Partners backend
location /api/ { proxy_pass http://BACKEND/api/; include /etc/nginx/proxy_params; }
location = /r  { proxy_pass http://BACKEND/r;   include /etc/nginx/proxy_params; }
location /track/ { proxy_pass http://BACKEND/track/; include /etc/nginx/proxy_params; }

# never expose the backend source from the static image
location /backend/ { return 404; }
```
`proxy_params` (create if missing) should forward the real client IP + scheme so
attribution + Secure cookies work:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
```
The app already runs `trust proxy`, so `req.ip` is the real client.

**If you prefer a subdomain** (`api.nx.sa`) instead of a path proxy: give the
backend its own domain in Coolify, keep `PUBLIC_ORIGIN=https://nx.sa` and
`COOKIE_DOMAIN=.nx.sa`, and add `<meta name="nx-api" content="https://api.nx.sa">`
to the 6 affiliate pages' `<head>`. CORS + same-site cookies are already handled.

## 4) Set the REAL program figures (no redeploy needed)

Log into the admin → **Program settings** → set and save:
base commission %, coupon discount %, growth/elite tier %, referral window (days),
minimum payout, payout schedule.

These persist in the DB and are served publicly at `GET /api/program`; the
landing **earnings estimator** reads it automatically, so the site reflects the
real rate the moment you save — nothing is hard-coded.

## 5) Wire the real tracking

- **Referral links / deep links:** route them through the click endpoint, e.g.
  `https://nx.sa/r?ref=CODE&to=/services/grow/` (logs the click, drops the
  first-party cookie, 302s to the page). Partners' links in the portal already
  point at `nx.sa/?ref=CODE`; add an nginx rewrite from `/?ref=` to `/r` if you
  want the bare form tracked, or hand out the `/r` form.
- **Conversions:** when a referred deal closes, your checkout/CRM calls
  `POST https://nx.sa/track/conversion` with header `x-webhook-secret: <WEBHOOK_SECRET>`
  and `{ ref | coupon, product, deal_value, client_email?, external_ref }`.
  It creates a **pending** conversion; approve it in the admin to credit the ledger.

## Go-live checklist
- [ ] Compose deployed; `GET https://nx.sa/api/health` → `{"ok":true}`.
- [ ] Real `SESSION_SECRET` / `IP_SALT` / `WEBHOOK_SECRET` set; `PUBLIC_ORIGIN=https://nx.sa`; `COOKIE_DOMAIN=.nx.sa`.
- [ ] `/api` + `/r` + `/track/` proxied; `/backend/` returns 404.
- [ ] First admin created; admin console loads live.
- [ ] Program figures set in the admin; estimator shows the real rate.
- [ ] A test click on `/r?ref=…` logs, and a test `POST /track/conversion` creates a pending conversion.
- [ ] Register on the landing → account appears **pending** in the admin → approve → partner can log in.
