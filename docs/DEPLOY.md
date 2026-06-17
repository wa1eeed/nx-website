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

## Clean URLs (no `.html`)

nginx serves extensionless URLs and canonicalises to them:
- **Routing:** `try_files $uri $uri.html $uri/` — `/en/contact` serves
  `en/contact.html`, `/en/work/` serves `en/work/index.html`.
- **301 redirect:** any `*.html` request redirects to the clean path
  (`/en/contact.html` → `/en/contact`, `/en/index.html` → `/en/`).
- All internal links, `canonical`, `hreflang`, `og:url` and `sitemap.xml`
  use the clean form. **Keep new links extensionless.**

> Local note: the `python3 -m http.server` preview does NOT do `try_files`,
> so extensionless URLs 404 there — test clean URLs against nginx/production.

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
2. **Cache-bust query**: every CSS/JS link has `?v=N`. **Bump `N` on every
   CSS/JS change.** Currently `v=4`.
   ```bash
   grep -rl '?v=4' en/ ar/ | xargs sed -i '' 's/?v=4/?v=5/g'
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

## DNS / domain

- Primary domain: **nx.sa** (canonical host used in all `<link rel="canonical">`,
  `hreflang`, OG URLs, and `sitemap.xml`).
- Root `index.html` redirects to `/en/` or `/ar/` by browser language.

## Post-deploy checklist

- [ ] Home loads in EN + AR; animated hexagon hero renders; no console errors.
- [ ] Favicon shows the NX monogram in the browser tab.
- [ ] Share the URL in WhatsApp/Slack → OG card shows the logo (re-scrape if
      cached: Facebook Sharing Debugger / LinkedIn Post Inspector).
- [ ] Submit the onboarding form → lead appears in Zoho CRM.
- [ ] SalesIQ chat bubble appears; PageSense records (check Zoho dashboards).
