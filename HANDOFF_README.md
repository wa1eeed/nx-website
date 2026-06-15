# NX Solutions Platform — Build Handoff

Bilingual (EN/AR) enterprise website for **NX Solutions** (nx.sa), a Saudi
enterprise engineering & compliance partner. Positioning: "anti-vibe-coding" —
institutional-grade engineering, deep Saudi regulatory compliance (SAMA, ZATCA,
Nafath, NCA, PDPL, PCI-DSS).

## Design system (LOCKED — do not redesign)

The visual direction is finalized and approved. Premium light + tasteful
3D/motion. Treat the existing pages as the source of truth.

- **Palette:** canvas `#F6F7F9`, surface `#FFF`, ink `#0A1A2F`, brand `#144272`,
  brand-2 `#205295`, highlight `#2C74B3`, sky `#5BA3DF`, gold (accent, used
  sparingly) `#B7902E`. Gradient: `135deg, #144272 → #205295 → #2C74B3`.
- **Type:** Plus Jakarta Sans (display/body) + JetBrains Mono (labels, numbers,
  eyebrows — this carries the "engineering" personality).
- **Components:** mono eyebrow with leading rule; pill buttons; glass nav with
  scroll shadow; SVG line icons ONLY (no emoji); hairline-divided rails/rows
  instead of busy card grids; dark metrics band; per-page hero "signature"
  visual; `.rv` scroll-reveal; FAQ accordion.
- **Each page has a unique hero signature:** home = 3D layered architecture
  blueprint; scale = 3D DD scorecard stack; launch = spec/terminal card;
  grow = animated before/after meters; 360 = manual-vs-automated flow lanes;
  connect = live regulatory badge grid; work = filterable case-study grid.

## Status

DONE (in this folder, v2 design system):
- [x] `/en/index.html` — homepage (incl. Showcase teaser section)
- [x] `/en/work/index.html` — full Showcase / case-studies page (filterable)
- [x] `/en/services/launch.html`
- [x] `/en/services/grow.html`
- [x] `/en/services/automation360.html`
- [x] `/en/services/connect.html`
- [x] `/en/services/scale.html`

TODO:
- [ ] **Refactor first:** extract the repeated inline `<style>` block into a
      single `assets/css/nx.css` and link it from every page. All pages share
      the same token + component CSS — this removes ~300 lines of duplication
      per file. Same for the shared nav/footer JS → `assets/js/nx.js`.
- [ ] `/en/solutions/` — 7 sector pages: fintech, proptech, healthtech,
      insurtech, ecommerce, on-demand, logistics. (Sector content + Saudi
      regulator focus is in the PRD.)
- [ ] `/ar/**` — full RTL Arabic mirror of everything (Tajawal font, `dir="rtl"`,
      lang switcher already points to `/ar/...` paths).
- [ ] `/en/legal/` + `/ar/legal/` — privacy (PDPL), terms, SLA, liability, cookies.
- [ ] 404 page.
- [ ] SEO: per-page canonical + hreflang (en/ar) pairs, sitemap.xml, robots.txt,
      JSON-LD Organization + Service schema.

LATER PHASES (real apps — Claude Code territory):
- [ ] Admin backend + simple CRM (leads, pipeline, clients).
- [ ] Affiliate program (referral tracking, commissions dashboard).
- [ ] Sales/marketing funnel landing-page builder (see "Sales and marketing
      funnels" reference doc).

## Placeholders to replace
- WhatsApp number `966XXXXXXXXX` (all pages)
- Email `hello@nx.sa`
- CR number `XXXXXXXXXX`
- Showcase case studies are REPRESENTATIVE — swap with real client data/metrics.
- Logo: currently an inline "NX" SVG mark — replace with real brand SVG.
- Hero video `assets/videos/...` and OG images `assets/images/og-*.jpg`.

## Run locally
```bash
cd nx-build
python3 -m http.server 8000   # then open http://localhost:8000/en/
```

## Suggested first Claude Code prompt
> Read HANDOFF_README.md. First, refactor the shared inline CSS from the
> existing /en pages into assets/css/nx.css and link it everywhere without
> changing any visuals. Then generate the 7 /en/solutions/ sector pages using
> the same design system and the sector content from the PRD.
