# NX Solutions — Project Documentation

Bilingual (EN/AR) static marketing website for **NX Solutions** (nx.sa) — the
technology partner for the digital transformation of enterprises and companies.
Positioning: institutional-grade engineering with deep Saudi regulatory
compliance (SAMA, ZATCA, Nafath, NCA ECC, PDPL, PCI-DSS).

- **Live domain:** https://nx.sa
- **Repo:** https://github.com/wa1eeed/nx-website
- **Hosting:** self-hosted via Coolify → Docker (nginx)
- **Stack:** hand-written static HTML + one CSS file + vanilla JS. **No build
  step, no framework, no bundler.** Edit files directly.

---

## 1. Repository layout

```
/
├── index.html              # root — JS redirect to /en/ or /ar/ by browser lang
├── en/                     # English site (LTR)
│   ├── index.html          # homepage
│   ├── projects.html       # 4 NX platforms showcase (device frames)
│   ├── contact.html        # contact page + Zoho Desk widget
│   ├── services/           # launch, grow, automation360, connect, scale
│   ├── solutions/          # INDUSTRIES (who we serve): fintech, proptech,
│   │                       #   insurtech, healthtech, logistics, ecommerce,
│   │                       #   on-demand (7 sectors). UI label "Industries/القطاعات".
│   ├── platforms/          # SOLUTIONS (platform types we build). UI label
│   │                       #   "Solutions/الحلول". index + business-systems (ERP)
│   │                       #   + booking. Animated orbit hero, "who it serves"
│   │                       #   bridge, platform models, Saudi-regulatory FAQ.
│   └── work/index.html     # filterable case-study grid
├── ar/                     # Arabic site (RTL) — exact mirror of /en/
├── assets/
│   ├── css/nx.css          # the ENTIRE design system (single source of truth)
│   ├── js/
│   │   ├── nx.js           # nav drawer, scroll-reveal, FAQ, carousels, meters
│   │   ├── nx-form.js      # 3-step onboarding form → Zoho CRM Web-to-Lead
│   │   └── nx-zoho.js      # all 3rd-party scripts (SalesIQ, PageSense)
│   └── images/
│       ├── logo.png        # master NX SOLUTIONS logo (1408×768, teal)
│       ├── favicon.png     # NX monogram only (256²) — generated from logo
│       ├── apple-touch-icon.png  # NX on white (180²) — generated from logo
│       ├── og-cover.png    # full logo on canvas (1200×630) — social share
│       └── projects/       # IBP platform screenshots (carousel)
├── humans.txt              # team/credits (tech-company touch)
├── .well-known/security.txt # security contact (RFC 9116)
├── robots.txt              # allows all + sitemap pointer
├── sitemap.xml             # 32 URLs with hreflang alternates
├── site.webmanifest        # PWA manifest (theme #136B7E)
├── nginx.conf              # clean-URL routing + .html→clean 301 + security headers + cache
├── Dockerfile              # nginx:1.27-alpine image for Coolify
└── docs/                   # ← you are here (PROJECT.md, TODO.md, DEPLOY.md)
```

Total HTML pages keep growing (EN + AR perfect mirror); latest additions are the
3 Solutions pages per language under `platforms/`.

### Information architecture (3 axes — don't conflate)
- **Services** (what we do): launch, grow, automation360, connect, scale.
- **Industries / القطاعات** (who we serve): the 7 sectors under `/solutions/`
  (the directory name stays `solutions` for URL stability; the UI says "Industries").
- **Solutions / الحلول** (platform *types* we build): under `/platforms/` —
  Business Operating Systems (ERP), Booking & Reservations, plus index cards that
  cross-link to On-Demand, Marketplaces, Government Integration and Custom Platforms.

---

## 2. Design system (LOCKED — do not redesign)

Defined entirely in [`assets/css/nx.css`](../assets/css/nx.css) via CSS custom
properties at `:root`.

- **Palette:** canvas `#F6F7F9`, surface `#FFF`, ink `#0A1A2F`, brand `#144272`,
  brand-2 `#205295`, highlight `#2C74B3`, sky `#5BA3DF`, gold `#B7902E`.
  Gradient: `135deg, #144272 → #205295 → #2C74B3`. Logo teal: `#136B7E`.
- **Type:** Plus Jakarta Sans (display/body) + JetBrains Mono (labels, numbers,
  eyebrows) + **Tajawal** (Arabic, and the language-toggle button).
- **Components:** mono eyebrow with leading rule; pill buttons; glass nav with
  scroll shadow; SVG line icons only (no emoji); hairline-divided rails;
  dark metrics band; per-page hero "signature" visual; `.rv` scroll-reveal;
  FAQ accordion.
- **Responsive:** `clamp()` typography; mobile breakpoint at `max-width:860px`;
  mobile nav is an off-canvas side drawer with the burger on the reading-start
  side (right in RTL, left in LTR).

### Home hero signature (current)
An **interactive SVG "cloud constellation"**: a central NX cloud node links out
to five hexagonal sector cells. Each hexagon has a **laser-traced border** and a
**live animated mini-scene** inside (logistics map+tracking, fintech wallets+
transfer+bars, proptech skyline+pin, e-commerce basket+items, on-demand phone+
orders). Pure SVG + CSS/SMIL — **zero JS, no library**, respects
`prefers-reduced-motion`. Other pages keep their own signatures (see §6).

---

## 3. Bilingual / RTL rules

- `/en/**` is `dir="ltr"`, `/ar/**` is `dir="rtl"`. Pages are 1:1 mirrors.
- Every page cross-links its translation via the nav language toggle and
  `<link rel="alternate" hreflang>` (en / ar / x-default).
- **Phone/WhatsApp numbers** in RTL use `dir="ltr"` + `unicode-bidi:plaintext`
  + `display:inline-block` so the digits don't reorder. Number:
  `+966 57 000 9449` → `tel:+966570009449`, `wa.me/966570009449`.
- No em/en dashes ("—") anywhere in content (an AI-writing tell); use commas.
- Arabic copy avoids the "نهندس/هندسة" framing per client preference.

---

## 4. Integrations (Zoho + Google)

| Tool | Purpose | Where | Notes |
|------|---------|-------|-------|
| **Zoho CRM Web-to-Lead** | Capture onboarding-form leads | `assets/js/nx-form.js` | Posts via a hidden iframe (native form POST, `x-www-form-urlencoded`). Endpoint `crm.zoho.sa`. Fields: Name, Email, Phone, Company, Role, Sector, Note. |
| **Zoho Desk feedback widget** | Contact-page support form | `en|ar/contact.html` | Embedded iframe (`desk.zoho.sa`). |
| **Zoho SalesIQ** | Live chat + visitor tracking | `assets/js/nx-zoho.js` | `salesiq.zohopublic.sa`. |
| **Zoho PageSense** | Heatmaps / recordings | `assets/js/nx-zoho.js` | Loaded **async** (non-blocking) to protect page speed. The anti-flicker head snippet is intentionally NOT used (no visual A/B test running). |
| **Google Analytics 4** | Measurement | `assets/js/nx-zoho.js` (block 4) | gtag.js, property `G-PH5BPW7MM2`. |
| **Google Tag Manager** | Tag container | inline in every page `<head>` + `<body>` noscript | `GTM-W6KJDFJJ`. NOT in `nx-zoho.js` — a tag manager must load early in `<head>`. Marked with `<!-- Google Tag Manager -->` comments. |

**All Zoho + GA scripts live in one file — [`nx-zoho.js`](../assets/js/nx-zoho.js)** —
loaded `defer` and injected after the page is interactive, so they never block
first paint / LCP. To update a widget, change only its URL/token in that file.
(GTM is the exception — see the table note.)

> ⚠️ GA4 (gtag) and GTM both write to `window.dataLayer` and coexist. If GTM is
> later set to fire the same GA4 property, remove the standalone gtag block in
> `nx-zoho.js` to avoid double-counting.

> ⚠️ The "Zoho Marketing Automation (ZMA)" snippet supplied earlier was a
> duplicate of the PageSense URL, so it was **not** added (would double-load
> PageSense). A real ZMA/Campaigns code (different domain) can be dropped into
> `nx-zoho.js` when available.

---

## 5. SEO

- Per-page `<title>`, meta description, keywords, canonical.
- Open Graph + Twitter card on every page; social image = `og-cover.png` (logo).
- `hreflang` alternates (en/ar/x-default), JSON-LD (Organization / WebSite /
  Service), `sitemap.xml` (32 URLs), `robots.txt`, `site.webmanifest`.
- **Home title positioning:**
  - AR: «NX Solutions، الشريك التقني للتحول الرقمي للمنشآت والشركات السعودية».
  - EN: "NX Solutions, The Technology Partner for Digital Transformation of
    Enterprises & Companies" — deliberately **without "Saudi"** to target
    global companies.
- **Favicon = NX monogram only** (the "SOLUTIONS" wordmark is cropped off).

---

## 6. Per-page hero signatures

| Page | Signature visual |
|------|------------------|
| home | interactive cloud core → 6 hexagon sector cells with live mini-scenes; auto-cycles the active cell, two-way data packets, radar/glow core, a "your business" CTA cell, a live ops counter, and tap-to-focus |
| solutions/* (sectors) | distinct animated SVG scene per sector (`.hviz`): fintech=payment-flow+bars, proptech=skyline+map-ping, insurtech=shield+radar-sweep, healthtech=ECG monitor, logistics=route+moving-truck, ecommerce=cart+dropping-items, on-demand=phone+radiating-pings. SMIL-animated, no JS. Clean hero bg (no gradient split). |
| platforms/* (solutions) | animated orbit hero (`.sol-orbit`); index = `.plat-card` grid with top-accent + arrow-shift hover |
| services/scale | 3D due-diligence scorecard stack |
| services/launch | spec / terminal card |
| services/grow | animated before/after meters |
| services/automation360 | manual-vs-automated flow lanes |
| services/connect | live regulatory badge grid |
| work | "wallet" project cards (see below) |
| projects | 4 platforms with laptop/phone device frames + IBP carousel (to be redesigned) |
| work/{ibp,nqlah,nitaq,iwork} | per-project case-study pages: hero+stats, regulator strip, capabilities grid, screenshot showcase, CTA → form |

### Work cards (homepage `#work` + `/work/`) — KEEP IN SYNC
Both places show the same 4 real projects (IBP, Nqlah, Nitaq, iWork) and **must be
updated together**. Card = `<article class="case wallet-case work-card" data-project="<id>">`:
- a **peek** card that emerges from the top, carrying a **rotating screenshot carousel**
  (`/assets/images/projects/<id>-*.png`, 2s) over a placeholder; a colored top tab
  (blue / violet alternating).
- a body meta row: the sector tag on the reading-start side, and a **"Quick look" story
  circle** on the far side (gradient ring + blinking live dot) that opens a **video-story
  popup** (`/assets/videos/work/<id>.mp4`, 9:16, 10s progress bar, close, auto-close;
  story JS in nx.js).
- chips (incl. the animated `.api` chip) + a centered **"Learn more / اعرف أكثر"** link → the
  project's detail page.
- grid: `repeat(auto-fit, minmax(250px, 1fr))` — narrow cards, 3–4 per laptop row.
The homepage also has a centered **"View all work"** button below the cards → `/work/`.

### Animation / interaction layer (`nx.js` + CSS)
- **Count-up** stat numbers (`.band .m b`, `.phero-stats .s b`, `.project-stats .ps b`)
  animate from 0 on scroll-in (IntersectionObserver; rAF — only runs while visible).
- **Scroll-reveal** `.rv` (+ `.rv-stagger` groups: children stagger via `--i`).
- **Smooth scroll** (`html{scroll-behavior:smooth}`), button sheen, nav underline,
  card/cell hover lifts. All gated by `prefers-reduced-motion`.
- A **buying-FAQ** accordion section on the homepage (`.faq`, toggled in nx.js).

---

## 7. Caching & cache-busting

- `nginx.conf`: **CSS/JS = `no-cache, must-revalidate`** (always fresh, cheap
  304s); fonts + images = 30-day cache; HTML = `no-cache`.
- Every `nx.css` / `nx.js` / `nx-form.js` / `nx-zoho.js` reference carries a
  `?v=N` query. **Bump `N` on every CSS/JS change** so already-cached browsers
  fetch the new file immediately. Currently at **`v=29`**.
  ```bash
  # bump the version across all pages (replace 29→30 etc.):
  grep -rl '?v=29' en/ ar/ index.html | xargs sed -i '' 's/?v=29/?v=30/g'
  ```
  > Images keep their path when re-optimised, so they ride the 30-day cache; only
  > CSS/JS use the `?v=` query.

---

## 8. Local preview

No build. Serve the folder statically:

```bash
cd ~/nx-website
python3 -m http.server 8765
# open http://localhost:8765/en/  or  /ar/
```

---

## 9. Conventions for future edits

- **One CSS file.** Add styles to `nx.css`; reuse tokens/components.
- **Mirror every change in both languages** (EN + AR) and keep `sitemap.xml`
  in sync if you add/remove pages.
- **SVG icons only**, no emoji in UI.
- **No "—" dashes** in copy.
- After any CSS/JS change: **bump `?v=N`** (see §7).
- Regenerate icons from the logo with the CoreGraphics script used in
  `git log` (content-aware crop of the NX block); see DEPLOY.md.
