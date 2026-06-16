# NX Solutions — TODO / Roadmap

Prioritized backlog. `[ ]` open · `[~]` in progress · `[x]` done.
Last updated: 2026-06-16.

---

## 🖼️ Pending images (drop-in, no code change needed)

Files go in `assets/images/work/brokerage/` with these EXACT names.
Missing ones fall back to a clean gradient placeholder.

**Real Estate Brokerage case study**
- [x] `integration-1.png` — full-width hero (mapping / National Address) ✅ added
- [ ] `integration-2.png` — REGA  ⚠️ *not received yet*
- [ ] `integration-3.png` — Ejar  ⚠️ *not received yet*
- [ ] `integration-4.png` — spatial analytics  ⚠️ *not received yet*
- [x] `integration-5.png` — 3D city view ✅ added
- [ ] `laptop-1.png`, `laptop-2.png`, `laptop-3.png` — homepage work-card laptop carousel
- [ ] `phone-1.png`, `phone-2.png` — homepage work-card phone carousel
- [ ] `dashboard-1.png` (Listings), `dashboard-2.png` (Live bidding),
      `dashboard-3.png` (Contracts/Ejar), `dashboard-4.png` (Map & GIS) — detail-page laptop frames

> See `assets/images/work/brokerage/_PLACEHOLDER_README.txt` for sizes.
> Also: optimise `integration-*.png` for web (currently ~1.2–1.4 MB each;
> resize to ≤1280px and/or compress) before heavy traffic.

---

## 🔴 P0 — Blockers / must-do before go-live confidence

- [ ] **Redeploy on Coolify** and hard-refresh to confirm the latest hero
      (animated hexagon cells), favicon, and OG image are live on nx.sa.
- [ ] **Validate the lead pipeline end-to-end on production**: submit the
      onboarding form on the live domain and confirm the lead lands in Zoho CRM
      (this was flaky before — verify it once more from nx.sa, not localhost).
- [ ] **Re-scrape social cards** after deploy: run the live URL through the
      [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/),
      [Twitter Card Validator], and LinkedIn Post Inspector so the new
      `og-cover.png` replaces any cached preview.

## 🟠 P1 — High priority

- [ ] **Real ZMA / Zoho Campaigns code**: obtain the correct snippet (different
      domain than PageSense) and add it to `assets/js/nx-zoho.js`.
- [ ] **Replace placeholder project screenshots**: add real screens for Nitaq,
      Nqlah, IBP Insure, iWork on `projects.html` (currently IBP has a carousel;
      others may use placeholders).
- [ ] **Accessibility pass**: keyboard nav for the mobile drawer + FAQ, focus
      states, `aria-*` on the carousel, color-contrast audit on the gold accent.
- [ ] **Performance check**: run Lighthouse on the live home page; confirm the
      animated SVG hero doesn't regress LCP/CLS on mid-range mobile.
- [ ] **Verify Arabic typography** of the new hero labels (Tajawal) and the
      SEO titles render correctly across browsers.

## 🟡 P2 — Medium priority

- [ ] **Content review of all 7 sector pages** (EN + AR) for accuracy and tone.
- [ ] **404 page** (branded) + nginx wiring.
- [ ] **Analytics**: decide on GA4 / Plausible and add to `nx-zoho.js`.
- [ ] **Cookie / privacy notice** (PDPL) if any tracking sets cookies.
- [ ] **Per-page OG images** (optional) instead of the single shared logo card,
      for richer link previews on key pages (services, projects).
- [ ] **Sitemap lastmod** dates + submit to Google Search Console & Bing.

## 🟢 P3 — Nice to have / later

- [ ] Blog / insights section (SEO long-tail).
- [ ] Case-study detail pages behind the `work` grid.
- [ ] Dark mode.
- [ ] Subtle page-transition / view-transition polish.
- [ ] Automate icon regeneration + `?v=` bump in a small `make` script.

---

## ✅ Done (high-level log)

- [x] Full design system in one CSS file; 7 core pages + 7 sector pages.
- [x] Mobile off-canvas nav drawer (burger on reading-start side).
- [x] Full Arabic (RTL) mirror — 32 pages — with Tajawal + bidi fixes.
- [x] 3-step onboarding form wired to Zoho CRM Web-to-Lead (iframe POST).
- [x] Dedicated contact pages + Zoho Desk widget; unified nav CTA.
- [x] `/projects` page with 4 platforms + device frames + IBP carousel.
- [x] Image logo across nav + footer; removed text logo.
- [x] SEO: hreflang, canonical, OG/Twitter, JSON-LD, sitemap, robots, manifest.
- [x] Fixed reversed RTL phone/WhatsApp numbers; removed em-dashes.
- [x] Docker + nginx deploy config for Coolify.
- [x] Cache-busting strategy (`?v=N` + nginx no-cache for CSS/JS).
- [x] Zoho SalesIQ + PageSense centralized in `nx-zoho.js` (speed-safe).
- [x] Interactive cloud-network hero → animated hexagon sector cells.
- [x] SEO repositioning (AR "الشريك التقني..."; EN global, no "Saudi").
- [x] Brand favicon (NX monogram) + apple-touch-icon + OG social image.
- [x] Project + deploy documentation (`docs/`).
- [x] Legal pages (Privacy/PDPL, Terms, SLA) in EN + AR + sitemap.
- [x] Footer "Policies & Compliance" rename + tagline matched to SEO.
- [x] Removed phone/WhatsApp from contact; fixed form step-3 overflow.
- [x] Root `/` share meta + favicon cache-bust.
- [x] Google Analytics 4 (gtag) + Google Tag Manager (GTM-W6KJDFJJ).
- [x] Fixed Arabic hero labels (SVG→HTML overlay) + reworded hero/trust copy.
- [x] Replaced text compliance badges with real regulator logos (7 authorities).
- [x] IBP screenshots now fit the laptop frame (matched aspect ratio).
- [x] Real Estate Brokerage case study: device-mockup work card + full
      detail page (EN + AR) + integration grid + CTA → form (images pending above).

---

## 🔮 Next session

> A new task to be discussed — placeholder. Capture the goal, scope, and
> priority here once defined.
