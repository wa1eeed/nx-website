/* ============================================================
   NX Partners — portal & admin behaviour (nx-portal.js)
   DEMO front-end: renders from in-file sample data so the product
   can be seen and approved before the Node + PostgreSQL backend is
   wired. Every render reads from local DATA — swap for fetch() to
   the API and the UI is unchanged.
   ============================================================ */
(function () {
  'use strict';
  var body = document.body;
  var isAdmin = body.classList.contains('p-admin');
  var isPortal = body.classList.contains('p-portal');
  if (!isAdmin && !isPortal) return;

  var ar = document.documentElement.lang === 'ar';
  var LANGSEG = ar ? 'ar' : 'en';
  var CUR = ar ? '﷼' : 'SAR';
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var pick = function (o, k) { return o[k + (ar ? '_ar' : '_en')]; };

  // ---- shared identity (demo) ----
  var CODE = 'KHALID-7Q2';
  var COUPON = 'KHALID10';
  var COUPON_PCT = 10;
  var BASE = 'https://nx.sa/?ref=' + CODE;
  var ORIGIN = 'https://nx.sa';
  var deep = function (path) { return ORIGIN + '/' + LANGSEG + path + '?ref=' + CODE; };

  var T = ar ? {
    clicks: 'نقرة', convs: 'تحويل', rate: 'معدّل', copied: 'تم النسخ', copy: 'نسخ', download: 'تنزيل',
    paid: 'مدفوعة', pending: 'قيد المراجعة', approved: 'معتمدة', rejected: 'مرفوضة', reversed: 'مُسترجعة',
    active: 'نشط', suspended: 'موقوف', all: 'الكل', banners: 'لافتات', social: 'سوشال ميديا',
    email: 'بريد', logos: 'شعارات', copytxt: 'نصوص', qr: 'رمز QR',
    approve: 'اعتماد', view: 'عرض', markpaid: 'تحديد كمدفوعة', promote: 'تسويق', share: 'مشاركة',
    service: 'خدمة', solution: 'حل', platform: 'منصّة',
    shareMsg: 'اكتشف NX Solutions — شريك تقني يبني ويطوّر المنصّات الرقمية للمنشآت السعودية.',
    shareSubj: 'قد يهمّك: NX Solutions', dl_soon: 'سيبدأ التنزيل عند تفعيل البوابة'
  } : {
    clicks: 'clicks', convs: 'conv.', rate: 'rate', copied: 'Copied', copy: 'Copy', download: 'Download',
    paid: 'Paid', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', reversed: 'Reversed',
    active: 'Active', suspended: 'Suspended', all: 'All', banners: 'Banners', social: 'Social',
    email: 'Email', logos: 'Logos', copytxt: 'Copy', qr: 'QR code',
    approve: 'Approve', view: 'View', markpaid: 'Mark paid', promote: 'Promote', share: 'Share',
    service: 'Service', solution: 'Solution', platform: 'Platform',
    shareMsg: 'Discover NX Solutions — a tech partner building digital platforms for Saudi enterprises.',
    shareSubj: 'You might like: NX Solutions', dl_soon: 'Download begins when the portal goes live'
  };

  var badge = function (kind, txt) { return '<span class="ap-b ' + kind + '">' + txt + '</span>'; };
  var money = function (n, neg) { return (neg ? '−' : '') + fmt(n) + ' ' + CUR; };

  // ---------- toast + copy + share ----------
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ap-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(T.copied); }, function () { toast(T.copied); });
    else toast(T.copied);
  }
  function shareHref(net, url) {
    var u = encodeURIComponent(url), m = encodeURIComponent(T.shareMsg);
    if (net === 'wa') return 'https://wa.me/?text=' + encodeURIComponent(T.shareMsg + ' ' + url);
    if (net === 'x') return 'https://twitter.com/intent/tweet?text=' + m + '&url=' + u;
    if (net === 'li') return 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
    if (net === 'em') return 'mailto:?subject=' + encodeURIComponent(T.shareSubj) + '&body=' + encodeURIComponent(T.shareMsg + '\n\n' + url);
    return url;
  }
  var SVG = {
    wa: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 01-12.4 7.4L3 21l2.2-5.4A8.4 8.4 0 1121 11.5z"/><path d="M8.5 8.8c.2 3 2.7 5.5 5.7 5.7"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20"/></svg>',
    li: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4"/></svg>',
    em: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>'
  };
  function shareBar(url) {
    return '<div class="ap-share">' +
      '<a class="ap-shbtn wa" target="_blank" rel="noopener" href="' + shareHref('wa', url) + '">' + SVG.wa + (ar ? 'واتساب' : 'WhatsApp') + '</a>' +
      '<a class="ap-shbtn x" target="_blank" rel="noopener" href="' + shareHref('x', url) + '">' + SVG.x + 'X</a>' +
      '<a class="ap-shbtn li" target="_blank" rel="noopener" href="' + shareHref('li', url) + '">' + SVG.li + (ar ? 'لينكدإن' : 'LinkedIn') + '</a>' +
      '<a class="ap-shbtn em" href="' + shareHref('em', url) + '">' + SVG.em + (ar ? 'بريد' : 'Email') + '</a>' +
      '<button class="ap-shbtn" data-copy="' + url + '">' + SVG.copy + (ar ? 'نسخ الرابط' : 'Copy link') + '</button>' +
      '</div>';
  }

  // ---------- shared products catalog ----------
  var IC = {
    launch: '<path d="M12 2c4 2 6 6 6 10l-3 3-3-1-1 3-2 2-2-4 3-1-1-3 3-3c0-4 2-8 0-6z"/><circle cx="12" cy="9" r="1.5"/>',
    grow: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 01-12 0zM12 17v5"/>',
    layers: '<path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h3.5a1.5 1.5 0 010 3h-2a1.5 1.5 0 000 3H15"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    truck: '<rect x="1" y="6" width="14" height="10" rx="1"/><path d="M15 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    box: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 14h.01M15 14h.01"/>'
  };
  var PRODUCTS = [
    { k: 'service', path: '/services/launch/', ic: IC.launch, name_ar: 'NX Launch', name_en: 'NX Launch', d_ar: 'إطلاق أول نظام رقمي لعملك بسرعة وثبات.', d_en: 'Launch your first digital system — fast and solid.' },
    { k: 'service', path: '/services/grow/', ic: IC.grow, name_ar: 'NX Grow', name_en: 'NX Grow', d_ar: 'طوّر منصّتك ووسّع قدراتها مع نمو عملك.', d_en: 'Grow and extend your platform as you scale.' },
    { k: 'service', path: '/services/automation360/', ic: IC.gear, name_ar: 'NX 360', name_en: 'NX 360', d_ar: 'أتمتة العمليات وربطها من طرف إلى طرف.', d_en: 'Automate and connect operations end to end.' },
    { k: 'service', path: '/services/connect/', ic: IC.plug, name_ar: 'NX Connect', name_en: 'NX Connect', d_ar: 'اربط أنظمتك بالجهات الحكومية والخدمات.', d_en: 'Integrate with government & third-party services.' },
    { k: 'service', path: '/services/scale/', ic: IC.layers, name_ar: 'NX Scale', name_en: 'NX Scale', d_ar: 'بنية جاهزة للتوسّع وأحمال الإنتاج.', d_en: 'Architecture ready for scale and production load.' },
    { k: 'solution', path: '/solutions/fintech-open-banking/', ic: IC.coin, name_ar: 'التقنية المالية', name_en: 'FinTech & Open Banking', d_ar: 'طبقة مالية ومصرفية مفتوحة داخل منتجك.', d_en: 'An embedded open-banking & payments layer.' },
    { k: 'platform', path: '/work/ibp/', ic: IC.shield, name_ar: 'IBP Insure', name_en: 'IBP Insure', d_ar: 'منصّة متكاملة لوسطاء التأمين.', d_en: 'An end-to-end insurance-broker platform.' },
    { k: 'platform', path: '/work/nqlah/', ic: IC.truck, name_ar: 'Nqlah', name_en: 'Nqlah', d_ar: 'منصّة النقل والخدمات اللوجستية.', d_en: 'A transport & logistics platform.' },
    { k: 'platform', path: '/work/nx-logistic/', ic: IC.box, name_ar: 'NX Logistic', name_en: 'NX Logistic', d_ar: 'إدارة أصول وعمليات شركات النقليات.', d_en: 'Fleet asset & operations management.' },
    { k: 'platform', path: '/work/iwork/', ic: IC.bot, name_ar: 'iWork', name_en: 'iWork', d_ar: 'قوى عاملة ذكية بوكلاء ذكاء اصطناعي.', d_en: 'An AI-powered digital workforce.' }
  ];
  var kindLabel = { service: T.service, solution: T.solution, platform: T.platform };

  function kpiHTML(x) {
    var d = x.d ? '<div class="d up">▲ ' + x.d + '</div>' : '';
    return '<div class="ap-kpi ' + (x.cls || '') + '"><div class="ic"><svg viewBox="0 0 24 24">' + x.ic + '</svg></div>' +
      '<div class="k">' + x.k + '</div><div class="v">' + (x.cur ? '<span class="cur">' + CUR + '</span>' : '') + fmt(x.v) + '</div>' + d + '</div>';
  }
  function chartHTML(series, labels) {
    var mx = Math.max.apply(null, series);
    return series.map(function (v, i) {
      var h = Math.round(v / mx * 100);
      return '<div class="bar"><i data-h="' + h + '" style="height:0"><b>' + fmt(v) + '</b></i><span>' + labels[i] + '</span></div>';
    }).join('');
  }
  var MLABELS = ['12', '01', '02', '03', '04', '05', '06', '07'];

  // ============================================================
  //  PARTNER PORTAL
  // ============================================================
  if (isPortal) {
    var TX = [
      { d: '2026-07-28', k: ar ? 'عمولة — NX Grow' : 'Commission — NX Grow', a: 3600, s: 'approved', neg: false },
      { d: '2026-07-26', k: ar ? 'عمولة عبر كود KHALID10 — NX Launch' : 'Commission via KHALID10 — NX Launch', a: 1800, s: 'approved', neg: false },
      { d: '2026-07-20', k: ar ? 'صرف إلى الحساب البنكي' : 'Payout to bank account', a: 6000, s: 'paid', neg: true },
      { d: '2026-07-18', k: ar ? 'عمولة — NX 360' : 'Commission — NX 360', a: 3160, s: 'pending', neg: false },
      { d: '2026-07-11', k: ar ? 'عمولة — التقنية المالية' : 'Commission — FinTech', a: 5200, s: 'approved', neg: false },
      { d: '2026-07-03', k: ar ? 'استرجاع — إلغاء اشتراك' : 'Reversal — cancelled signup', a: 1200, s: 'reversed', neg: true }
    ];
    var REFS = [
      { d: '2026-07-28', p: 'NX Grow', c: 'Rawnaq Co.', v: 24000, com: 3600, s: 'approved', via: ar ? 'رابط' : 'Link' },
      { d: '2026-07-26', p: 'NX Launch', c: 'Nujoom Studio', v: 12000, com: 1800, s: 'approved', via: 'KHALID10' },
      { d: '2026-07-18', p: 'NX 360', c: 'Madar Logistics', v: 31600, com: 3160, s: 'pending', via: ar ? 'رابط' : 'Link' },
      { d: '2026-07-11', p: 'FinTech', c: 'Sadad Wallet', v: 52000, com: 5200, s: 'approved', via: ar ? 'رابط' : 'Link' },
      { d: '2026-07-02', p: 'IBP Insure', c: 'Wathiq Brokers', v: 16000, com: 2400, s: 'pending', via: 'KHALID10' }
    ];
    var LINKS = [
      { n: ar ? 'الرابط الافتراضي' : 'Default link', q: '', cl: 1240, cv: 38 },
      { n: ar ? 'حملة لينكدإن' : 'LinkedIn campaign', q: '&c=linkedin', cl: 486, cv: 17 },
      { n: ar ? 'قائمتي البريدية' : 'My newsletter', q: '&c=news', cl: 322, cv: 11 },
      { n: ar ? 'التقنية المالية' : 'FinTech push', q: '&s=fintech', cl: 198, cv: 9 }
    ];
    var MATS = [
      { type: 'banner', tone: 'dark', dim: '1200×628', tag: 'NX Grow', name_ar: 'لافتة — NX Grow', name_en: 'Banner — NX Grow', desc_ar: 'لافتة أفقية للمشاركات الاجتماعية.', desc_en: 'Landscape banner for social posts.', big_ar: 'طوّر منصّتك مع NX', big_en: 'Grow your platform with NX', sm_ar: 'NX Grow', sm_en: 'NX Grow' },
      { type: 'banner', tone: 'light', dim: '1080×1080', tag: 'FinTech', name_ar: 'مربّع — التقنية المالية', name_en: 'Square — FinTech', desc_ar: 'تصميم مربّع لإنستغرام.', desc_en: 'Square design for Instagram.', big_ar: 'طبقة مالية داخل منتجك', big_en: 'A finance layer in your product', sm_ar: 'FinTech & Open Banking', sm_en: 'FinTech & Open Banking' },
      { type: 'banner', tone: 'dark', dim: '300×600', tag: 'IBP', name_ar: 'لافتة عمودية — IBP', name_en: 'Skyscraper — IBP', desc_ar: 'لافتة عمودية لمواقع المحتوى.', desc_en: 'Vertical banner for content sites.', big_ar: 'منصّة وسطاء التأمين', big_en: 'Insurance-broker platform', sm_ar: 'IBP Insure', sm_en: 'IBP Insure' },
      { type: 'social', tone: 'light', dim: ar ? 'نص جاهز' : 'Ready copy', tag: ar ? 'عام' : 'General', name_ar: 'منشور تعريفي', name_en: 'Intro post', desc_ar: 'نص منشور جاهز مع رابطك.', desc_en: 'Ready post copy with your link.', snip_ar: 'تبحث عن شريك تقني يبني لك نظاماً رقمياً يصمد أمام النمو والتدقيق؟ اكتشف NX Solutions 👇', snip_en: 'Looking for a tech partner to build a digital system that scales? Discover NX Solutions 👇' },
      { type: 'social', tone: 'dark', dim: ar ? 'منشور X' : 'X post', tag: ar ? 'عام' : 'General', name_ar: 'منشور X (تويتر)', name_en: 'X (Twitter) post', desc_ar: 'تغريدة قصيرة جاهزة للنشر.', desc_en: 'A short ready-to-post tweet.', snip_ar: 'من الموقع إلى نظام التشغيل والربط الحكومي — @NXSolutions تبني تقنية تعمل فعلاً. 👇', snip_en: 'From your website to your operating system to gov integrations — NX Solutions builds tech that works. 👇' },
      { type: 'email', tone: 'light', dim: 'HTML', tag: ar ? 'عام' : 'General', name_ar: 'قالب بريد — عرض الخدمات', name_en: 'Email — services', desc_ar: 'قالب بريد قابل للتخصيص.', desc_en: 'Customizable email template.', snip_ar: 'مرحباً، أردت أن أشاركك NX Solutions — شريك تقني يبني ويطوّر المنصّات الرقمية للمنشآت السعودية…', snip_en: 'Hi, I wanted to share NX Solutions — a tech partner that builds digital platforms for Saudi enterprises…' },
      { type: 'email', tone: 'light', dim: ar ? 'توقيع' : 'Signature', tag: ar ? 'عام' : 'General', name_ar: 'توقيع بريد', name_en: 'Email signature', desc_ar: 'توقيع بريد أنيق مع رابط إحالتك.', desc_en: 'A tidy email signature with your link.', snip_ar: 'شريك NX Solutions المعتمد — احجز استشارة عبر رابطي', snip_en: 'Certified NX Solutions partner — book a consult via my link' },
      { type: 'copy', tone: 'light', dim: ar ? 'عبارات' : 'One-liners', tag: ar ? 'عام' : 'General', name_ar: 'عبارات تسويقية', name_en: 'Marketing one-liners', desc_ar: 'جُمل قصيرة لكل منتج تنسخها بسرعة.', desc_en: 'Short lines per product to copy fast.', snip_ar: 'NX Launch: أطلق نظامك الرقمي بثقة. · NX 360: أتمتة عملياتك بالكامل. · FinTech: مدفوعات وبيانات بنكية داخل منتجك.', snip_en: 'NX Launch: launch your system with confidence. · NX 360: fully automate your ops. · FinTech: payments & bank data inside your product.' },
      { type: 'logo', tone: 'light', dim: 'SVG · PNG', tag: ar ? 'علامة' : 'Brand', name_ar: 'حزمة الشعار', name_en: 'Logo pack', desc_ar: 'شعار NX بصيغ ونسخ متعددة (فاتح/داكن).', desc_en: 'NX logo in multiple formats (light/dark).', logo: true }
    ];

    // KPIs
    var host = document.querySelector('[data-kpis]');
    if (host) host.innerHTML = [
      { cls: 'gold', k: ar ? 'الرصيد المتاح' : 'Available balance', v: 8420, cur: true, ic: '<path d="M20 12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7M2 7h20v5H2zM12 22V7"/>' },
      { k: ar ? 'أرباح هذا الشهر' : 'Earnings this month', v: 12480, cur: true, d: '18%', ic: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>' },
      { k: ar ? 'النقرات (30 يوماً)' : 'Clicks (30d)', v: 1240, cur: false, d: '9%', ic: '<path d="M9 3v4M15 3v4M4 9h16M6 21h12a1 1 0 001-1V8H5v12a1 1 0 001 1z"/>' },
      { k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: 38, cur: false, d: '12%', ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
    ].map(kpiHTML).join('');

    var chart = document.querySelector('[data-chart]');
    if (chart) chart.innerHTML = chartHTML([5100, 6200, 5800, 7400, 9100, 8600, 10800, 12480], MLABELS);

    var txb = document.querySelector('[data-tx]');
    if (txb) txb.innerHTML = TX.map(function (x) {
      var sb = x.s === 'paid' ? badge('ok', T.paid) : x.s === 'approved' ? badge('info', T.approved) : x.s === 'pending' ? badge('warn', T.pending) : badge('bad', T.reversed);
      return '<tr><td class="mono">' + x.d + '</td><td><b>' + x.k + '</b></td><td class="amt ' + (x.neg ? 'neg' : 'pos') + '">' + money(x.a, x.neg) + '</td><td>' + sb + '</td></tr>';
    }).join('');

    var rb = document.querySelector('[data-refs]');
    if (rb) rb.innerHTML = REFS.map(function (x) {
      var sb = x.s === 'approved' ? badge('ok', T.approved) : x.s === 'pending' ? badge('warn', T.pending) : badge('bad', T.rejected);
      var via = x.via === 'KHALID10' ? '<span class="ap-tag" style="color:var(--ap-warn);background:rgba(183,144,46,.1);border-color:rgba(183,144,46,.3)">' + x.via + '</span>' : x.via;
      return '<tr><td class="mono">' + x.d + '</td><td><b>' + x.p + '</b></td><td>' + x.c + '</td><td>' + via + '</td><td class="mono">' + fmt(x.v) + ' ' + CUR + '</td><td class="amt pos">' + fmt(x.com) + ' ' + CUR + '</td><td>' + sb + '</td></tr>';
    }).join('');

    var lb = document.querySelector('[data-links]');
    if (lb) lb.innerHTML = LINKS.map(function (x) {
      var url = BASE + x.q;
      return '<div class="ap-linkcard"><div class="top"><span class="nm">' + x.n + '</span>' +
        '<div class="url"><code>' + url + '</code></div>' +
        '<button class="ap-mini-btn" data-copy="' + url + '">' + SVG.copy + T.copy + '</button></div>' +
        '<div class="stats"><div class="s"><div class="n">' + fmt(x.cl) + '</div><div class="t">' + T.clicks + '</div></div>' +
        '<div class="s"><div class="n">' + fmt(x.cv) + '</div><div class="t">' + T.convs + '</div></div>' +
        '<div class="s"><div class="n">' + (x.cl ? (x.cv / x.cl * 100).toFixed(1) : '0') + '%</div><div class="t">' + T.rate + '</div></div></div></div>';
    }).join('');

    // referral link + coupon hero + share
    var lc = document.querySelector('[data-linkcoupon]');
    if (lc) lc.innerHTML =
      '<div class="ap-lccard"><div class="lbl"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg>' + (ar ? 'رابط الإحالة' : 'Referral link') + '</div>' +
      '<div class="ap-bigcode"><code>' + BASE + '</code><button class="ap-mini-btn" data-copy="' + BASE + '">' + SVG.copy + T.copy + '</button></div>' +
      '<p class="sub">' + (ar ? 'يُنسب كل من يفتح هذا الرابط إليك خلال نافذة التتبّع.' : 'Anyone opening this link is attributed to you within the tracking window.') + '</p></div>' +
      '<div class="ap-lccard coupon"><div class="lbl"><svg viewBox="0 0 24 24"><path d="M4 9V6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 000 6v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 000-6z"/><path d="M12 7v10" stroke-dasharray="1 3"/></svg>' + (ar ? 'كود الخصم' : 'Coupon code') + '<span class="ap-off">' + (ar ? 'خصم ' : '') + COUPON_PCT + '%' + (ar ? '' : ' off') + '</span></div>' +
      '<div class="ap-bigcode"><code>' + COUPON + '</code><button class="ap-mini-btn" data-copy="' + COUPON + '">' + SVG.copy + T.copy + '</button></div>' +
      '<p class="sub">' + (ar ? 'لمن يفضّل كوداً بدل رابط: يمنح العميل خصم ' + COUPON_PCT + '٪ ويُسجّل عمولتك تلقائياً عند الشراء.' : 'For those who prefer a code over a link: gives the client ' + COUPON_PCT + '% off and records your commission automatically at checkout.') + '</p></div>';

    document.querySelectorAll('[data-sharebar]').forEach(function (el) { el.innerHTML = shareBar(BASE); });

    // catalog
    var cat = document.querySelector('[data-catalog]');
    if (cat) cat.innerHTML = PRODUCTS.map(function (p) {
      var url = deep(p.path);
      return '<div class="ap-catcard"><div class="top"><span class="ci"><svg viewBox="0 0 24 24">' + p.ic + '</svg></span>' +
        '<div><div class="nm">' + pick(p, 'name') + '</div><div class="kind">' + kindLabel[p.k] + '</div></div></div>' +
        '<div class="ds">' + pick(p, 'd') + '</div>' +
        '<div class="lk"><code>' + url + '</code><button class="ap-mini-btn" data-copy="' + url + '">' + SVG.copy + T.copy + '</button></div>' +
        shareBar(url) + '</div>';
    }).join('');

    // materials
    var typeLabel = { banner: T.banners, social: T.social, email: T.email, logo: T.logos, copy: T.copytxt };
    var matHost = document.querySelector('[data-mats]');
    function renderMats(filter) {
      if (!matHost) return;
      matHost.innerHTML = MATS.filter(function (m) { return !filter || filter === 'all' || m.type === filter; }).map(function (m) {
        var pv;
        if (m.logo) pv = '<div class="pv light"><img class="logo" src="/assets/images/favicon.png" alt="NX"></div>';
        else if (m.type === 'social' || m.type === 'email' || m.type === 'copy') pv = '<div class="pv ' + (m.tone === 'light' ? 'light' : '') + '"><div class="bnr"><b style="color:' + (m.tone === 'light' ? 'var(--ink)' : '#fff') + '">' + (m.type === 'email' ? '✉' : m.type === 'copy' ? '“ ”' : '◈') + '</b></div><span class="type">' + typeLabel[m.type] + '</span></div>';
        else pv = '<div class="pv ' + (m.tone === 'light' ? 'light' : '') + '"><div class="bnr"><b style="color:' + (m.tone === 'light' ? 'var(--ink)' : '#fff') + '">' + pick(m, 'big') + '</b><span style="color:' + (m.tone === 'light' ? 'var(--muted)' : '#cfe0f2') + '">' + pick(m, 'sm') + '</span></div><span class="type">' + typeLabel[m.type] + '</span></div>';
        var snip = (m.snip_ar || m.snip_en) ? '<div class="ap-snip">' + pick(m, 'snip') + '<button class="ap-mini-btn cp" data-copy="' + pick(m, 'snip') + '">' + T.copy + '</button></div>' : '';
        var act = (m.logo || m.type === 'banner')
          ? '<button class="ap-mini-btn" data-toast="' + T.dl_soon + '"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>' + T.download + '</button>'
          : '<button class="ap-mini-btn" data-copy="' + (pick(m, 'snip') || '') + '">' + SVG.copy + T.copy + '</button>';
        return '<div class="ap-mat">' + pv + '<div class="mt"><div class="top-row"><div class="nm">' + pick(m, 'name') + '</div><span class="ap-tag">' + m.tag + '</span></div>' +
          '<div class="ds">' + pick(m, 'desc') + '</div>' + snip + '<div class="dim">' + m.dim + '</div><div class="acts">' + act + '</div></div></div>';
      }).join('');
    }
    renderMats('all');
    document.querySelectorAll('[data-filter]').forEach(function (c) {
      c.addEventListener('click', function () {
        document.querySelectorAll('[data-filter]').forEach(function (o) { o.classList.remove('on'); });
        c.classList.add('on'); renderMats(c.dataset.filter);
      });
    });

    // withdraw modal
    var modal = document.querySelector('[data-modal]');
    document.querySelectorAll('[data-open-withdraw]').forEach(function (b) { b.addEventListener('click', function () { modal && modal.classList.add('on'); }); });
    if (modal) {
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.hasAttribute('data-close')) modal.classList.remove('on'); });
      var wf = modal.querySelector('form');
      if (wf) wf.addEventListener('submit', function (e) { e.preventDefault(); modal.classList.remove('on'); toast(ar ? 'تم تسجيل طلب السحب (معاينة)' : 'Withdrawal request recorded (demo)'); });
    }
  }

  // ============================================================
  //  ADMIN CONSOLE
  // ============================================================
  if (isAdmin) {
    var ah = document.querySelector('[data-kpis]');
    if (ah) ah.innerHTML = [
      { k: ar ? 'إجمالي الشركاء' : 'Total partners', v: 214, cur: false, ic: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/>' },
      { cls: 'gold', k: ar ? 'عمولات مستحقّة' : 'Commissions due', v: 86400, cur: true, ic: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
      { k: ar ? 'طلبات قيد المراجعة' : 'Pending approvals', v: 12, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: 486, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
    ].map(kpiHTML).join('');

    var achart = document.querySelector('[data-chart]');
    if (achart) achart.innerHTML = chartHTML([210, 260, 240, 320, 380, 360, 430, 486], MLABELS);

    var PARTNERS = [
      { n: 'Khalid Al-Otaibi', e: 'khalid@rawnaq.sa', ch: ar ? 'لينكدإن' : 'LinkedIn', cp: 'KHALID10', cv: 38, earned: 41280, s: 'active' },
      { n: 'Sara Al-Ghamdi', e: 'sara@mostashar.co', ch: ar ? 'قائمة بريدية' : 'Newsletter', cp: 'SARA10', cv: 21, earned: 22400, s: 'active' },
      { n: 'Faisal Media', e: 'hi@faisal.media', ch: ar ? 'يوتيوب' : 'YouTube', cp: 'FAISAL10', cv: 12, earned: 9600, s: 'active' },
      { n: 'Noura Consulting', e: 'noura@nc.sa', ch: ar ? 'إحالات' : 'Referrals', cp: '—', cv: 0, earned: 0, s: 'pending' },
      { n: 'Tariq Dev', e: 'tariq@devs.io', ch: ar ? 'مدوّنة' : 'Blog', cp: '—', cv: 3, earned: 2400, s: 'pending' },
      { n: 'Old Agency', e: 'x@old.co', ch: ar ? 'وكالة' : 'Agency', cp: 'OLD10', cv: 1, earned: 800, s: 'suspended' }
    ];
    var pb = document.querySelector('[data-partners]');
    if (pb) pb.innerHTML = PARTNERS.map(function (x) {
      var sb = x.s === 'active' ? badge('ok', T.active) : x.s === 'pending' ? badge('warn', T.pending) : badge('bad', T.suspended);
      var act = x.s === 'pending'
        ? '<button class="ap-mini-btn" data-act="' + (ar ? 'تم اعتماد الشريك (معاينة)' : 'Partner approved (demo)') + '">' + T.approve + '</button>'
        : '<button class="ap-mini-btn" data-act="' + (ar ? 'فتح ملف الشريك (معاينة)' : 'Open partner (demo)') + '">' + T.view + '</button>';
      return '<tr><td><div style="display:flex;align-items:center;gap:.6rem"><span class="ap-ava" style="width:30px;height:30px;font-size:.72rem">' + x.n.charAt(0) + '</span><div><b>' + x.n + '</b><div style="font-size:.72rem;color:var(--muted)">' + x.e + '</div></div></div></td><td>' + x.ch + '</td><td class="mono">' + x.cp + '</td><td class="mono">' + x.cv + '</td><td class="amt">' + fmt(x.earned) + ' ' + CUR + '</td><td>' + sb + '</td><td>' + act + '</td></tr>';
    }).join('');

    var PAYOUTS = [
      { d: '2026-07-28', n: 'Khalid Al-Otaibi', m: ar ? 'حساب بنكي' : 'Bank', a: 6000, s: 'pending' },
      { d: '2026-07-28', n: 'Sara Al-Ghamdi', m: ar ? 'حساب بنكي' : 'Bank', a: 4200, s: 'pending' },
      { d: '2026-07-20', n: 'Faisal Media', m: ar ? 'حساب بنكي' : 'Bank', a: 3000, s: 'paid' },
      { d: '2026-07-12', n: 'Khalid Al-Otaibi', m: ar ? 'حساب بنكي' : 'Bank', a: 6000, s: 'paid' }
    ];
    var payb = document.querySelector('[data-payouts]');
    if (payb) payb.innerHTML = PAYOUTS.map(function (x) {
      var sb = x.s === 'paid' ? badge('ok', T.paid) : badge('warn', T.pending);
      var act = x.s === 'pending' ? '<button class="ap-mini-btn" data-act="' + (ar ? 'تم التحديد كمدفوعة (معاينة) — التحويل الفعلي عبر البنك' : 'Marked paid (demo) — actual transfer via your bank') + '">' + T.markpaid + '</button>' : '—';
      return '<tr><td class="mono">' + x.d + '</td><td><b>' + x.n + '</b></td><td>' + x.m + '</td><td class="amt">' + fmt(x.a) + ' ' + CUR + '</td><td>' + sb + '</td><td>' + act + '</td></tr>';
    }).join('');

    // offers / products management
    var RATES = { '/services/launch/': 15, '/services/grow/': 15, '/services/automation360/': 18, '/services/connect/': 12, '/services/scale/': 12, '/solutions/fintech-open-banking/': 20, '/work/ibp/': 18, '/work/nqlah/': 15, '/work/nx-logistic/': 15, '/work/iwork/': 18 };
    var ob = document.querySelector('[data-offers]');
    if (ob) ob.innerHTML = PRODUCTS.map(function (p) {
      return '<tr><td><div style="display:flex;align-items:center;gap:.6rem"><span class="ap-ava" style="width:30px;height:30px;background:linear-gradient(135deg,rgba(20,66,114,.14),rgba(44,116,179,.2))"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--brand-2);fill:none;stroke-width:1.8">' + p.ic + '</svg></span><b>' + pick(p, 'name') + '</b></div></td><td>' + kindLabel[p.k] + '</td><td class="mono">' + (RATES[p.path] || 15) + '%</td><td>' + badge('ok', ar ? 'قابل للتسويق' : 'Promotable') + '</td><td><button class="ap-mini-btn" data-act="' + (ar ? 'تعديل العرض (معاينة)' : 'Edit offer (demo)') + '">' + (ar ? 'تعديل' : 'Edit') + '</button></td></tr>';
    }).join('');
  }

  // ============================================================
  //  SHARED: interactions, language switch, drawer, routing
  // ============================================================
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy); return; }
    var t = e.target.closest('[data-toast]'); if (t) { toast(t.dataset.toast); return; }
    var a = e.target.closest('[data-act]'); if (a && a.dataset.act) { toast(a.dataset.act); return; }
  });

  // language switch (topbar pill + settings) — swap /ar/ <-> /en/, keep the view
  function mirrorPath() {
    var p = location.pathname;
    return p.indexOf('/ar/') >= 0 ? p.replace('/ar/', '/en/') : p.replace('/en/', '/ar/');
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { location.href = mirrorPath() + location.hash; });
  });

  // sidebar drawer (mobile)
  var burger = document.querySelector('.ap-burger');
  var side = document.querySelector('.ap-side');
  var scrim = document.querySelector('.ap-scrim');
  if (burger && side) {
    burger.addEventListener('click', function () { side.classList.toggle('open'); if (scrim) scrim.classList.toggle('on', side.classList.contains('open')); });
    if (scrim) scrim.addEventListener('click', function () { side.classList.remove('open'); scrim.classList.remove('on'); });
  }

  function animateChart() {
    document.querySelectorAll('.ap-chart .bar i[data-h]').forEach(function (i) {
      requestAnimationFrame(function () { i.style.height = i.dataset.h + '%'; });
    });
  }
  function route() {
    var hash = (location.hash || '').replace('#', '');
    var views = document.querySelectorAll('.ap-view');
    var found = false;
    views.forEach(function (v) { var on = v.dataset.view === hash; v.classList.toggle('on', on); if (on) found = true; });
    if (!found && views[0]) { views[0].classList.add('on'); hash = views[0].dataset.view; }
    document.querySelectorAll('.ap-nav a[data-go]').forEach(function (a) { a.classList.toggle('on', a.dataset.go === hash); });
    if (side) side.classList.remove('open'); if (scrim) scrim.classList.remove('on');
    animateChart();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.ap-nav a[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); location.hash = a.dataset.go; });
  });
  window.addEventListener('hashchange', route);
  route();
})();
