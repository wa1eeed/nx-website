# NX Solutions — Website

Bilingual (EN/AR) static marketing site for **NX Solutions** (nx.sa) — the
technology partner for the digital transformation of enterprises and companies.

Hand-written static HTML + one CSS file + vanilla JS. **No build step.**

## Quick start

```bash
python3 -m http.server 8765    # then open http://localhost:8765/en/  or  /ar/
```

## Documentation

- 📘 [`docs/PROJECT.md`](docs/PROJECT.md) — architecture, design system, bilingual
  rules, integrations, SEO, conventions.
- ✅ [`docs/TODO.md`](docs/TODO.md) — prioritized roadmap and a log of what's done.
- 🚀 [`docs/DEPLOY.md`](docs/DEPLOY.md) — Docker/nginx/Coolify deploy, caching,
  icon regeneration, post-deploy checklist.

## Stack

Static HTML · CSS (`assets/css/nx.css`) · vanilla JS · nginx in Docker via
Coolify · Zoho (CRM, Desk, SalesIQ, PageSense).

> Edit files directly, mirror every change in **both** `/en/` and `/ar/`, and
> bump the `?v=N` cache-bust query after any CSS/JS change. See the docs.
