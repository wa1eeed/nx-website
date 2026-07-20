# NX Solutions — TODO / Roadmap

Prioritized backlog. `[ ]` open · `[~]` in progress · `[x]` done.
Last updated: 2026-07-20.

---

## 🗓️ Scheduled / deferred — production infra

- [ ] **Cloudflare CDN rollout** — deferred **2026-07-20** by decision (run it as
      a standalone, off-peak change, not bundled with other infra work). Full
      runbook: `docs/DEPLOY.md` → "Cloudflare CDN — DEFERRED". Summary:
      1. Zone `nx.sa` first, then `bznss.one` (separate zone). `lam.nx.sa` + other
         subdomains via a proxied wildcard `*.nx.sa`.
      2. SSL/TLS **Full (strict)**; install a **Cloudflare Origin Certificate**
         (or DNS-01) so Let's Encrypt renewal survives behind the proxy.
      3. Orange-cloud the records, verify no redirect loop, then firewall the
         origin to Cloudflare IPs only.
      - Free plan stays free at any traffic volume (unmetered); only heavy
        video/large-file hosting would need a paid product.

## 🖼️ Pending media (drop-in, no code change needed)

The work cards show the real projects (IBP, Nqlah, Nitaq, iWork).

> **2026-07-20:** 1×1 transparent placeholder PNGs are committed at every missing
> path below, so pages no longer 404 (they fall back to the branded
> gradient+label). Drop the **real** file at the same path to replace it — no
> markup change. The story-video MP4s are still missing (the "Quick look" button
> opens a broken video until they're added).

**Project screenshots** → `assets/images/projects/` (IBP real; others placeholder)
- [ ] `nqlah-desktop.png`, `nqlah-mobile.png`  *(placeholder in place)*
- [ ] `nitaq-desktop.png`, `nitaq-mobile.png`  *(placeholder in place)*
- [ ] `iwork-desktop.png`, `iwork-mobile.png`  *(placeholder in place)*

**"Quick look" story videos** → `assets/videos/work/` (9:16, ≤10s MP4) — **missing**
- [ ] `ibp.mp4`, `nqlah.mp4`, `nitaq.mp4`, `iwork.mp4`

> Manifests: `assets/images/work/_WORK_CARD_SCREENSHOTS.txt`,
> `assets/videos/work/_STORY_VIDEOS.txt`.

## 📣 Conversion content (next batch — partly done)

- [x] Buying-FAQ accordion on the homepage (pricing/timeline/IP/compliance/post-launch).
- [x] Animation layer: count-up stats, scroll-reveal stagger, smooth scroll, micro-interactions.
- [x] Image optimisation pass (logo 552→108 KB, IBP shots & integration-1 resized; ~1.3 MB saved).
- [ ] **Testimonials / social proof** section with REAL client quotes (names, logos) — placeholder structure not yet added; needs real data.
- [ ] **About / "عن NX"** page (team, story, trust).
- [ ] **Pricing / packages** page (even "from …") to cut friction.
- [ ] Stronger CTA framing ("Book a free 15-min consultation").
- [ ] Optional heavier motion (Lenis smooth-scroll lib / GSAP ScrollTrigger / view transitions) — deferred; current layer is dependency-free.

---

## 🧩 Solutions / Industries IA expansion (in progress)

- [x] **Solutions section** at `/platforms/` (UI label "Solutions/الحلول"):
      index + **Business Operating Systems (ERP)** + **Booking & Reservations**,
      EN + AR. Animated orbit hero (no gradient split), "who it serves" bridge,
      platform models, Saudi-regulatory FAQ (ZATCA/SAMA/Mada/PDPL/GOSI), CTA.
      Nav item added site-wide; sitemap + v=29 updated.
- [ ] **New Industry pages** (full): EdTech, FoodTech, GovTech, Tourism &
      Hospitality — mirror the existing 7 sector pages.
- [ ] **Roll the new pattern onto existing sector/service pages**: animated hero
      (remove the gradient split), a "platform types" section, and a
      regulatory FAQ.
- [ ] Optional: surface Solutions on the homepage (a section/teaser) + footer column.

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

## 🛠️ Professional hardening (done this batch)

- [x] **Clean URLs** — extensionless routing + 301 from `.html`; all links,
      canonical/hreflang/og + sitemap updated.
- [x] **Security headers** in nginx (X-Frame-Options, nosniff, Referrer-Policy,
      Permissions-Policy, HSTS) → securityheaders.com ~A.
- [x] `humans.txt`, `.well-known/security.txt`, head signature comment, console message.
- [ ] **Content-Security-Policy** — deferred; needs nonces + real-traffic tuning
      so it doesn't break inline scripts / Zoho / Google. Add as report-only first.
- [ ] **Minify** CSS/JS/HTML for production — needs a build step (gzip already
      compresses transfer); revisit with the Astro move.

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

## 🟠 P1 — Selected-work cards

- [x] Brokerage card: full template (devices fully visible in dark header,
      footer "View case study" button replacing stats, animated API chip) on
      **both** homepage `#work` and `/work/` index.
- [x] Added the animated `.api` chip to all work cards (home + `/work/`).
- [ ] **Build detail pages for the other works** (fintech/neobank, e-commerce,
      healthtech, insurtech, logistics) so each card can flip to the full
      device + footer-button template. Needs content + screenshots per work.
      Until then those cards keep their stat header/footer.
- [ ] Keep homepage `#work` and `/work/` index **in sync** on every work change
      (see PROJECT.md "Work-card sync rule").

## 🟡 P2 — Medium priority

- [ ] **Content review of all 7 sector pages** (EN + AR) for accuracy and tone.
- [ ] **404 page** (branded) + nginx wiring.
- [x] **Analytics**: GA4 (`G-PH5BPW7MM2`) + GTM + Zoho PageSense + SalesIQ, all
      managed in `nx-zoho.js` (see DEPLOY.md "Analytics & tracking"; GA4 fires
      once — no duplicate tag in GTM).
- [x] **Cookie / privacy notice** (PDPL): Zoho `zcookiebar` banner live; Privacy
      policy discloses SalesIQ + PageSense.
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
- [x] **2026-07** — Full content rewrite pass: relatable AR + de-jargoned EN,
      correct regulators (InsurTech → Insurance Authority, not SAMA), buyer-voiced
      FAQs, and rewritten SEO/social meta across sectors/services/solutions.
- [x] **2026-07** — FinTech page rebuilt as a full **Tech-Enabler** narrative
      (brochure-grade, EN+AR): build + integrate open banking/payments via
      SAMA-licensed partners = capability without the licence. Positioning
      propagated to the homepage + related-sector links site-wide. Added CSS
      components `.ob/.te-flow/.caplist/.bankgrid/.mth/.rolecol/.tiers`.
- [x] **2026-07-20** — Fixed `www.nx.sa` "not secure": add `www` to the app's
      Domains in Coolify (Traefik issues the cert) + nginx `www → apex` 301.
      See DEPLOY.md "DNS / domains & TLS".
- [x] **2026-07-20** — Transparent placeholder PNGs kill the project-image 404s.

---

## 🔮 Next session

> A new task to be discussed — placeholder. Capture the goal, scope, and
> priority here once defined.
