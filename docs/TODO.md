# NX Solutions — TODO / Roadmap

Prioritized backlog. `[ ]` open · `[~]` in progress · `[x]` done.
Last updated: 2026-07-29.

---

## 🤝 Affiliate / NX Partners program (in progress)

- [x] **2026-07-29 — Landing page shipped (AR + EN)** at `/{ar,en}/affiliate/`
      (`body.p-affiliate`). Sections: hero + interactive **partner-dashboard
      preview** (animated earnings count-up, sparkline, copy-referral-link toast,
      mini-stats — all labelled "معاينة/preview"), why-partner grid, how-it-works
      steps, what-you-promote (links to services/solutions/work), **earnings
      estimator** (3 sliders, live math), audiences, FAQ, and a **portal** card
      with **Register / Login** tabs. Footer column **"الشراكات / Partnerships"**
      added site-wide (65 pages) beside Policies. CSS `.aff-*` + JS module
      scoped to `.p-affiliate` in `nx.js`. `?v=98`.
- [~] **Registration wiring is interim.** The register form posts to the existing
      **Zoho Web-to-Lead** endpoint (same tokens as `nx-form.js`), tagged in the
      note with `[NX Partners / برنامج التسويق بالعمولة]` + channel/audience, so
      applications reach the CRM today. **Re-point to the dedicated affiliate
      backend** once built (change the POST target in the `nx.js` affiliate module).
- [~] **Login is a front-end placeholder** — the portal isn't live, so submitting
      shows an honest "portal launching soon" message. Wire to real auth in the
      backend phase.
- [ ] **Insert real program figures.** Commission %, tiers, cookie/attribution
      window, payout threshold + schedule are currently **qualitative** (FAQ) and
      the estimator uses a clearly-labelled **illustrative 15%** default. Replace
      with the finalized numbers (estimator default in `nx.js`, FAQ copy in both
      `/affiliate/` pages) — nothing fabricated is presented as a commitment.
- [x] **2026-07-29 — Phase 2a: portal & admin UI shipped (AR + EN)** as a
      polished, best-in-class SaaS front-end with **demo data** at
      `/{ar,en}/affiliate/portal/` (`body.p-portal`) and
      `/{ar,en}/affiliate/admin/` (`body.p-admin`), `noindex`. Dark sidebar +
      light workspace, gold money accents. **Partner dashboard:** Overview
      (KPIs + 8-month earnings chart + quick link + recent conversions), **Wallet**
      (available/pending/lifetime balance, next-payout, colour-coded transaction
      ledger, withdraw modal), **Referral links** (per-campaign links + copy),
      **Marketing kit** (filterable gallery: banners/social/email/logos with
      copy/download + auto-embedded link), **Settings** (profile + payout details).
      **Admin:** Overview, Partners (approve/view + statuses), Payouts
      (mark-paid — records only, no money movement), Program settings (rates,
      tiers, window, minimum). New files: `assets/css/nx-portal.css`,
      `assets/js/nx-portal.js` (all rendered from in-file `DATA` — swap for
      `fetch()` to wire the API). Not linked from the public login yet (kept
      honest as "launching soon"); direct URLs for review.
- [x] **2026-07-29 — Phase 2a v2 upgrade.** Light sidebar logo (CSS filter);
      **coupon codes** alongside referral links (e.g. `KHALID10`, 10% off) — in
      overview + a "Links & codes" hero, tracked in conversions ("via") and the
      admin partners table; **Products & services catalog** — every real NX
      offering with a **deep referral link** (`/…/?ref=CODE`) + copy + share, plus
      an admin **Products & offers** manager (per-product commission %); more
      **marketing tools** (X post, email signature, one-liners) + a **quick-share
      bar** (WhatsApp/X/LinkedIn/Email — real share URLs with the partner link);
      **in-portal AR/EN switch** in the navbar (globe pill) + Settings (preserves
      the view via hash); a **tracking & security** transparency strip.
- [ ] **Phase 2b tracking spec (best-practice, to implement):** first-party
      click endpoint issuing a signed, HttpOnly, SameSite cookie (referral code +
      first-touch timestamp); server-side click log (IP hash, UA, geo) for the
      attribution window; **coupon path** attributes at checkout when the code is
      applied; de-dup + click-fraud heuristics (rate limits, bot filtering,
      self-referral block); conversions confirmed server-side before the ledger
      credits; append-only commission ledger; PDPL-compliant retention. No PII in
      URLs; HTTPS + HSTS.
- [x] **2026-07-29 — Phase 2b: real backend built + dev-verified** in `backend/`
      (Node + Express + PostgreSQL, bcryptjs, helmet, rate-limit; DB-backed
      sessions). Auth (register→pending→admin-approve→login), tracking (`GET /r`
      click+signed cookie; `POST /track/conversion` webhook — attributes by ref
      OR coupon, attribution window, self-referral block, idempotent), append-only
      commission ledger (approve=credit / reverse=debit / payout paid=debit —
      **never moves money**), partner API (shapes match the portal demo `DATA`) +
      admin API. Dockerfile + docker-compose for Coolify. Verified end-to-end vs
      local Postgres 16. Not yet deployed or wired to the front-end.
- [x] **2026-07-29 — Phase 2c front-end wired** to the backend + verified locally.
      New `assets/js/nx-api.js` (`window.NXApi`); `nx-portal.js` renders demo then
      swaps to LIVE via `/api/auth/me` (401→login, 404/network→demo) and wires real
      actions; landing Register→`/api/auth/register` (added password field, Zoho
      fallback) + Login→`/api/auth/login`→portal. `?v=101`.
- [x] **2026-07-29 — go-live prep:** `backend/DEPLOY.md` (Coolify + nginx proxy
      snippet + checklist), `GET /api/program` public terms, landing estimator now
      reads live figures, and `npm run create-admin` (non-destructive prod admin).
      Real figures now flow from ONE place: set them in the admin → site updates.
- [ ] **Phase 2c — actually go live (needs the user / infra):** (1) deploy
      `backend/` on Coolify — real `SESSION_SECRET`/`IP_SALT`/`WEBHOOK_SECRET`,
      Postgres, `PUBLIC_ORIGIN=https://nx.sa`, `COOKIE_DOMAIN=.nx.sa`; migrate +
      create a real admin. (2) nginx on nx.sa: proxy `/api` and `/r` to the
      backend; don't serve `/backend`. (3) insert the **real program figures**
      (commission %, coupon %, tiers, attribution window, min payout, schedule).
      (4) route real referral/deep links via `/r`; wire checkout/CRM to
      `POST /track/conversion`.
- [ ] ~~Phase 2b: build the real backend~~ — decided stack
      **Node.js + PostgreSQL, self-hosted on Coolify/Docker** (data stays in-domain
      for PDPL). Implement: partner accounts + auth (email+password + sessions,
      admin-approval activation), unique referral links, click/conversion tracking
      & attribution, commission ledger, payout records (status workflow; actual
      transfer stays external via NX's bank — no fund movement in code), and the
      admin approval/console APIs. Then replace the portal's demo `DATA` with API
      calls and re-point the landing Register POST off Zoho onto the backend.


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
> markup change.
>
> **2026-07-28:** the "Quick look" button no longer plays a video — it opens a
> rich in-page **story** (animated screen + 2-column spec sheet) built from the
> real screenshots, so the story-video MP4s are **no longer needed** (IBP/Nqlah).

**Project screenshots** → `assets/images/projects/`
- [x] **IBP** — real AR + EN screens (`ibp-*-{ar,en}.png`).
- [~] **Nqlah — needs real ENGLISH screens.** Real **Arabic** screens are in place
      (`nqlah-{fleet,tracking,escrow,promotions,wallet}-ar.png`, 1600px). The five
      **`nqlah-*-en.png` files are COPIES of the Arabic ones** (temporary, added
      2026-07-28) because only Arabic captures were available. **Replace each
      `-en.png` with a real English capture** when ready — same filenames, no
      markup change. Arabic source originals: `~/Downloads/NQLAH-Shots/`.
- [~] **NX Health — needs real ENGLISH screens.** Real **Arabic** web + app
      screens in place (`health-{command,dashboard,patient,telemed,appointments,
      pharmacy,lab,billing}-ar.png` + `health-app-{home,booking,video,results,
      card}-ar.png`). The matching **`-en.png` files are COPIES of the Arabic**
      (temporary, 2026-07-28). Replace each with a real English capture — same
      filenames, no markup change. Sources: `~/Downloads/Clinic-Refine/` (web),
      `~/Downloads/Clinic-Refine-APP/` (app).
- [~] **NX Logistic — needs real ARABIC screens for tracking + billing.** Real
      captures in place for dashboard / org / orgchart (both AR + EN). The
      **tracking** and **billing** screens were provided in English only, so
      `lam-tracking-ar.png` and `lam-billing-ar.png` are temporary copies of the
      English captures (2026-07-29). Replace with real Arabic captures — same
      filenames. Source: `~/Downloads/NX-LAM/`.
- [ ] **Nitaq** — real screens, AR + EN  *(placeholder in place)*
- [~] **iWork — needs real cross-language screens for 2 of 4.** Real captures in
      place for **overview** and **agent** (both AR + EN). The **landing hero**
      was provided AR-only and the **"The platform" features** board EN-only, so
      `iwork-landing-en.png` (=AR copy) and `iwork-platform-ar.png` (=EN copy)
      are temporary placeholders (2026-07-29). Replace with real captures —
      same filenames. Source: `~/Downloads/iWork/`.

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
