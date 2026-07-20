# NX Solutions — Deployment & Operations

## Hosting model

The site is a static folder served by **nginx** inside a **Docker** image,
deployed via **Coolify** (self-hosted PaaS) from the GitHub repo. Pushing to
`main` is what triggers a redeploy (Coolify watches the branch).

- **Image:** `nginx:1.27-alpine` (see [`Dockerfile`](../Dockerfile)).
- **Config:** [`nginx.conf`](../nginx.conf) → copied to `/etc/nginx/conf.d/nx.conf`.
- **Port:** 80 (Coolify terminates TLS in front).
- **Healthcheck:** `wget --spider http://localhost/en/`.

Files excluded from the served image (in the Dockerfile `rm` step and
`.dockerignore`): `.git`, `.claude`, `Dockerfile`, `nginx.conf`,
`HANDOFF_README.md`, `diag-zoho.html`, `docs/`, `.DS_Store`.

## Deploy steps

1. Commit + push to `main`:
   ```bash
   git add -A && git commit -m "..." && git push origin main
   ```
2. In **Coolify**, the app redeploys automatically (or click **Redeploy**).
3. **Hard-refresh** the live site (or test in a private window). CSS/JS update
   instantly thanks to `no-cache` + the `?v=N` query; images/fonts are cached
   30 days (new image filenames bypass that).

## Clean URLs — directory-style (host-independent)

Pages are stored as **`<name>/index.html`** (e.g. `en/contact/index.html`,
`en/work/ibp/index.html`), so the clean URL `/en/contact/` resolves on **any**
static server — nginx, the `python3 -m http.server` preview, Coolify's static
buildpack, GitHub Pages, etc. (No reliance on `try_files` rewrites.)

- The only top-level `index.html` files are the section homes: `/`, `/en/`,
  `/ar/`, `/en/work/`, `/ar/work/`.
- Internal links, `canonical`, `hreflang`, `og:url` and `sitemap.xml` all use
  the **trailing-slash** form (`/en/contact/`).
- **Adding a new page:** create `en/<name>/index.html` (+ the `/ar/` mirror)
  and link to `/en/<name>/`.
- nginx still 301s any legacy `*.html` to the clean path and `try_files $uri/`
  serves the directory index — old bookmarks keep working.

## Security headers

Set in `nginx.conf` (re-declared per `location` — nginx `add_header` does not
merge across blocks): `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options:
nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`
(HSTS, 1y + includeSubDomains — site is HTTPS via Coolify). Good for an A on
securityheaders.com. **CSP is intentionally deferred** (the site has many inline
scripts/handlers + Zoho/Google third parties; a strict CSP needs nonces and
real-traffic tuning to avoid breaking chat/forms/analytics).

## Standard files
- `humans.txt`, `.well-known/security.txt` (RFC 9116) — served from root.
- A signature HTML comment in every page `<head>` + a console message in `nx.js`.

## Caching (why "nothing changed" used to happen)

Browsers were caching the old `nx.css` for days. Fixed two ways:

1. **nginx**: CSS/JS = `no-cache, must-revalidate`; HTML = `no-cache`;
   fonts/images = 30-day cache.
2. **Cache-bust query**: every CSS/JS link has `?v=N`. **Bump `N` site-wide on
   every CSS/JS change** (content-only HTML edits don't need it). Currently **`v=59`**.
   ```bash
   grep -rl '?v=59' --include='*.html' . | xargs sed -i '' 's/?v=59/?v=60/g'
   ```

## Regenerating brand icons from the logo

`favicon.png`, `apple-touch-icon.png`, and `og-cover.png` are generated from
`assets/images/logo.png` with a macOS **Swift + CoreGraphics** script that:

- decodes the logo, scans rows to find the gap between the **NX monogram** and
  the **"SOLUTIONS"** wordmark (background detected as near-white/transparent),
- crops the NX block for the favicon/apple-touch (monogram only),
- centers the full logo on a clean canvas for the 1200×630 OG card.

The script lives in the commit history (`git show 855a64f`); re-run with:

```bash
swift /tmp/mkicons.swift   # writes the 3 PNGs into assets/images/
```

If the logo changes, update `assets/images/logo.png` and re-run, then bump
`?v=` if you also reference them with a version.

## DNS / domains & TLS

- **Server IP:** `187.124.218.110`. Both `nx.sa` and `www.nx.sa` A-records point
  here. Other projects share the same Coolify host under their own subdomains
  (e.g. `lam.nx.sa`) or independent domains (e.g. `bznss.one`).
- **Primary/canonical host:** **nx.sa** (apex) — used in every `canonical`,
  `hreflang`, `og:url`, and `sitemap.xml`. Root `index.html` redirects to `/en/`
  or `/ar/` by browser language.
- **TLS:** Coolify's built-in proxy (**Traefik**) terminates TLS and issues
  **Let's Encrypt** certs (HTTP-01, port 80). nginx listens on plain 80 behind it.

### Adding a domain / subdomain (e.g. www, a new app)

A hostname works only if it is added to the app's **Domains (FQDN)** field in
Coolify — that is what makes Traefik both **route** it to the container and
**issue** its TLS cert. DNS pointing at the IP is **not** enough on its own.

- **Gotcha we hit (2026-07-20):** `www.nx.sa` resolved but was **not** in
  Coolify's Domains list → Traefik served its default self-signed cert (browser:
  *"not secure"*) on HTTPS and a bare **404** on HTTP. HSTS `includeSubDomains`
  (sent by the apex) then *forced* browsers onto the broken HTTPS for www.
- **Fix:** Coolify → the nx.sa app → **Configuration → General → Domains**, set
  `https://nx.sa,https://www.nx.sa` (both with `https://` so each gets a cert),
  Save + Redeploy. Traefik issues the www cert automatically.
- **Canonical redirect:** `nginx.conf` 301s `www.nx.sa` → apex
  (`if ($host = www.nx.sa) { return 301 https://nx.sa$request_uri; }`). Only
  fires once Coolify routes www to the container.
- **Verify:**
  ```bash
  curl -sSI https://www.nx.sa            # 301 → https://nx.sa/ , valid cert
  curl -sSL -o/dev/null -w '%{http_code} ssl=%{ssl_verify_result}\n' https://www.nx.sa  # 200 ssl=0
  ```
  End state: `http://www.nx.sa → 307 (Traefik) → https://www.nx.sa → 301 (nginx) → https://nx.sa/ → 200`.

## Analytics & tracking (managed in one file)

All third-party tracking is injected from a **single managed file**,
`assets/js/nx-zoho.js` (`?v=` bumped on change), loaded on every page. One named
place = snippets are easy to find, swap, and can't be dropped by accident during
page edits (each block has a named id).

- **Google Tag Manager** — container `GTM-W6KJDFJJ`, inline in every page
  `<head>` (+ `<noscript>` after `<body>`).
- **Google Analytics 4** — id `G-PH5BPW7MM2`, via `gtag` from `nx-zoho.js`.
  Fires **exactly one** `page_view` per load — verified there is **no duplicate
  GA4 tag inside the GTM container**. ⚠️ Do **not** add a GA4 Configuration tag
  for this id in the GTM dashboard, or every visit double-counts.
- **Zoho PageSense** — heatmaps/session analytics (`id="pagesenseCode"`, hash `8246671c…`).
- **Zoho SalesIQ** — live chat (`id="zsiqscript"`, widget `e073f31…`), ships the
  `zcookiebar` PDPL cookie banner.
- **Zoho CRM Web-to-Lead** — onboarding form posts to `crm.zoho.sa/crm/WebToLeadForm`
  (wired in `nx-zoho.js` / `nx-form.js`).
- The **Privacy policy** (`*/legal/privacy/`) already discloses SalesIQ + PageSense.

## Cloudflare CDN — DEFERRED (planned production task)

Decision **2026-07-20: defer**; do it as a separate careful step, not alongside
other infra changes. Tracked in `docs/TODO.md`.

- **Free plan is fine at scale** — unmetered bandwidth + unmetered DDoS,
  independent of visitor count. Caveats: heavy **video/large-file** serving is
  paid-only (Cloudflare ToS 2.8); WAF custom rules / rate-limiting / image
  optimisation are paid; the **origin (this Coolify server) still bears all
  dynamic traffic** — Cloudflare only offloads cacheable/static assets.
- **Per-DNS-record, per-zone:** adding the `nx.sa` zone does **not** auto-proxy
  subdomains. Proxy each record (orange cloud) or add a proxied wildcard
  `*.nx.sa` (Free supports 1 level; Universal SSL covers `nx.sa` + `*.nx.sa`, so
  `lam.nx.sa` is covered). `bznss.one` is a **separate zone**.
- **Coolify interop (critical):** SSL/TLS mode must be **Full (strict)**
  (Flexible → redirect loop, because the origin forces HTTPS/HSTS). Let's Encrypt
  HTTP-01 can fail behind the orange cloud → use **either** a **Cloudflare Origin
  Certificate** (15-yr, covers `nx.sa` + `*.nx.sa`) on the origin **or** a
  **DNS-01** challenge (Cloudflare API token). Recommended: **Origin Cert +
  Full (strict)**, one zone at a time, off-peak, `nx.sa` first then `bznss.one`.
- Optional hardening: firewall the origin to accept 80/443 from Cloudflare IP
  ranges only, so the origin IP can't be bypassed.

## Post-deploy checklist

- [ ] Home loads in EN + AR; animated hexagon hero renders; no console errors.
- [ ] Favicon shows the NX monogram in the browser tab.
- [ ] Share the URL in WhatsApp/Slack → OG card shows the logo (re-scrape if
      cached: Facebook Sharing Debugger / LinkedIn Post Inspector).
- [ ] Submit the onboarding form → lead appears in Zoho CRM.
- [ ] SalesIQ chat bubble appears; PageSense records (check Zoho dashboards).
