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
