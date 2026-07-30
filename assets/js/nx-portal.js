/* ============================================================
   NX Partners — portal & admin behaviour (nx-portal.js)
   Renders the demo dataset instantly, then — if the backend
   (window.NXApi) answers /api/auth/me — swaps in LIVE data and
   wires real actions. No backend / network error → stays in the
   labelled demo. 401 → redirect to the login on the landing page.
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
  var fmt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US');
  var pick = (o, k) => o[k + (ar ? '_ar' : '_en')];
  var day = (d) => String(d || '').slice(0, 10);
  // Escape untrusted values (lead names/emails come from the public contact form).
  var esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  var CODE = 'KHALID-7Q2', COUPON = 'KHALID10', COUPON_PCT = 10;
  var ORIGIN = 'https://nx.sa';
  var BASE = ORIGIN + '/?ref=' + CODE;

  var T = ar ? {
    clicks: 'نقرة', convs: 'تحويل', rate: 'معدّل', copied: 'تم النسخ', copy: 'نسخ', download: 'تنزيل',
    paid: 'مدفوعة', pending: 'قيد المراجعة', approved: 'معتمدة', rejected: 'مرفوضة', reversed: 'مُسترجعة',
    active: 'نشط', suspended: 'موقوف', all: 'الكل', banners: 'لافتات', social: 'سوشال ميديا',
    email: 'بريد', logos: 'شعارات', copytxt: 'نصوص',
    approve: 'اعتماد', view: 'عرض', markpaid: 'تحديد كمدفوعة', service: 'خدمة', solution: 'حل', platform: 'منصّة',
    shareMsg: 'اكتشف NX Solutions — شريك تقني يبني ويطوّر المنصّات الرقمية للمنشآت السعودية.',
    shareSubj: 'قد يهمّك: NX Solutions', dl_soon: 'سيبدأ التنزيل عند تفعيل البوابة',
    leadPending: 'قيد المتابعة', leadWon: 'مدفوع', leadLost: 'لم يكتمل',
    markWon: 'عميل مدفوع', markLost: 'لم يكتمل', reopen: 'إعادة فتح',
    noLeads: 'لا يوجد عملاء مُحالون بعد — شارك رابطك لتبدأ.', noReq: 'لا توجد طلبات بعد.'
  } : {
    clicks: 'clicks', convs: 'conv.', rate: 'rate', copied: 'Copied', copy: 'Copy', download: 'Download',
    paid: 'Paid', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', reversed: 'Reversed',
    active: 'Active', suspended: 'Suspended', all: 'All', banners: 'Banners', social: 'Social',
    email: 'Email', logos: 'Logos', copytxt: 'Copy',
    approve: 'Approve', view: 'View', markpaid: 'Mark paid', service: 'Service', solution: 'Solution', platform: 'Platform',
    shareMsg: 'Discover NX Solutions — a tech partner building digital platforms for Saudi enterprises.',
    shareSubj: 'You might like: NX Solutions', dl_soon: 'Download begins when the portal goes live',
    leadPending: 'Pending', leadWon: 'Won', leadLost: 'Lost',
    markWon: 'Mark won', markLost: 'Lost', reopen: 'Reopen',
    noLeads: 'No referred clients yet — share your link to start.', noReq: 'No requests yet.'
  };
  var kindLabel = { service: T.service, solution: T.solution, platform: T.platform };
  var SERVICE_LABELS = { launch: 'NX Launch', grow: 'NX Grow', auto: 'NX 360', connect: 'NX Connect', scale: 'NX Scale', unsure: ar ? 'غير محدّد' : 'Unsure' };
  var svcLabel = (s) => SERVICE_LABELS[s] || s || '—';

  var badge = (kind, txt) => '<span class="ap-b ' + kind + '">' + txt + '</span>';
  var money = (n, neg) => (neg ? '−' : '') + fmt(n) + ' ' + CUR;
  var statusBadge = (s) => s === 'paid' ? badge('ok', T.paid) : s === 'approved' ? badge('info', T.approved)
    : s === 'pending' ? badge('warn', T.pending) : s === 'reversed' ? badge('bad', T.reversed)
    : s === 'rejected' ? badge('bad', T.rejected) : s === 'active' ? badge('ok', T.active)
    : s === 'suspended' ? badge('bad', T.suspended) : badge('info', s);
  // lead lifecycle: pending (awaiting) → won (paid) / lost
  var leadStatusBadge = (s) => s === 'won' ? badge('ok', T.leadWon) : s === 'lost' ? badge('bad', T.leadLost) : badge('warn', T.leadPending);

  var SVG = {
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 01-12.4 7.4L3 21l2.2-5.4A8.4 8.4 0 1121 11.5z"/><path d="M8.5 8.8c.2 3 2.7 5.5 5.7 5.7"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20"/></svg>',
    li: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4"/></svg>',
    em: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  };
  function shareHref(net, url) {
    var u = encodeURIComponent(url), m = encodeURIComponent(T.shareMsg);
    if (net === 'wa') return 'https://wa.me/?text=' + encodeURIComponent(T.shareMsg + ' ' + url);
    if (net === 'x') return 'https://twitter.com/intent/tweet?text=' + m + '&url=' + u;
    if (net === 'li') return 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
    if (net === 'em') return 'mailto:?subject=' + encodeURIComponent(T.shareSubj) + '&body=' + encodeURIComponent(T.shareMsg + '\n\n' + url);
    return url;
  }
  function shareBar(url) {
    return '<div class="ap-share">' +
      '<a class="ap-shbtn wa" target="_blank" rel="noopener" href="' + shareHref('wa', url) + '">' + SVG.wa + (ar ? 'واتساب' : 'WhatsApp') + '</a>' +
      '<a class="ap-shbtn x" target="_blank" rel="noopener" href="' + shareHref('x', url) + '">' + SVG.x + 'X</a>' +
      '<a class="ap-shbtn li" target="_blank" rel="noopener" href="' + shareHref('li', url) + '">' + SVG.li + (ar ? 'لينكدإن' : 'LinkedIn') + '</a>' +
      '<a class="ap-shbtn em" href="' + shareHref('em', url) + '">' + SVG.em + (ar ? 'بريد' : 'Email') + '</a>' +
      '<button class="ap-shbtn" data-copy="' + url + '">' + SVG.copy + (ar ? 'نسخ الرابط' : 'Copy link') + '</button>' +
      '</div>';
  }

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
  var IC_BY_SLUG = {
    'services/launch': IC.launch, 'services/grow': IC.grow, 'services/automation360': IC.gear,
    'services/connect': IC.plug, 'services/scale': IC.layers, 'solutions/fintech-open-banking': IC.coin,
    'work/ibp': IC.shield, 'work/nqlah': IC.truck, 'work/nx-logistic': IC.box, 'work/iwork': IC.bot,
  };

  // ---------- toast + copy ----------
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ap-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(T.copied), () => toast(T.copied));
    else toast(T.copied);
  }

  // ---------- generic renderers ----------
  var $ = (sel) => document.querySelector(sel);
  var MLABELS = ['12', '01', '02', '03', '04', '05', '06', '07'];

  function renderKpis(list) {
    var host = $('[data-kpis]'); if (!host) return;
    host.innerHTML = list.map(x => {
      var d = x.d ? '<div class="d up">▲ ' + x.d + '</div>' : '';
      return '<div class="ap-kpi ' + (x.cls || '') + '"><div class="ic"><svg viewBox="0 0 24 24">' + x.ic + '</svg></div>' +
        '<div class="k">' + x.k + '</div><div class="v">' + (x.cur ? '<span class="cur">' + CUR + '</span>' : '') + fmt(x.v) + '</div>' + d + '</div>';
    }).join('');
  }
  function renderChart(series) {
    var host = $('[data-chart]'); if (!host) return;
    var vals = series.map(s => Number(s.value) || 0), mx = Math.max.apply(null, vals.concat([1]));
    host.innerHTML = series.map((s, i) => {
      var h = Math.round(vals[i] / mx * 100);
      return '<div class="bar"><i data-h="' + h + '" style="height:0"><b>' + fmt(vals[i]) + '</b></i><span>' + (s.label || MLABELS[i]) + '</span></div>';
    }).join('');
    requestAnimationFrame(() => host.querySelectorAll('i[data-h]').forEach(i => { i.style.height = i.dataset.h + '%'; }));
  }
  function renderRefs(rows) {
    var b = $('[data-refs]'); if (!b) return;
    b.innerHTML = rows.map(x => {
      var via = x.via === 'link' || !x.via ? (ar ? 'رابط' : 'Link')
        : '<span class="ap-tag" style="color:var(--ap-warn);background:rgba(183,144,46,.1);border-color:rgba(183,144,46,.3)">' + x.via + '</span>';
      return '<tr><td class="mono">' + day(x.date) + '</td><td><b>' + (x.product || '—') + '</b></td><td>' + (x.client_name || '—') +
        '</td><td>' + via + '</td><td class="mono">' + fmt(x.deal_value) + ' ' + CUR + '</td><td class="amt pos">' + fmt(x.commission) + ' ' + CUR + '</td><td>' + statusBadge(x.status) + '</td></tr>';
    }).join('');
  }
  function renderTx(rows) {
    var b = $('[data-tx]'); if (!b) return;
    b.innerHTML = rows.map(x => {
      var neg = (x.type === 'payout' || x.type === 'reversal') || Number(x.amount) < 0;
      var label = x.memo || ({ commission: ar ? 'عمولة' : 'Commission', payout: ar ? 'صرف' : 'Payout', reversal: ar ? 'استرجاع' : 'Reversal' }[x.type] || x.type);
      var s = x.type === 'payout' ? 'paid' : x.type === 'reversal' ? 'reversed' : 'approved';
      return '<tr><td class="mono">' + day(x.date) + '</td><td><b>' + label + '</b></td><td class="amt ' + (neg ? 'neg' : 'pos') + '">' + money(Math.abs(x.amount), neg) + '</td><td>' + statusBadge(s) + '</td></tr>';
    }).join('');
  }
  function renderLinkCoupon(refCode, coupon, couponPct) {
    var lc = $('[data-linkcoupon]'); if (!lc) return;
    var link = ORIGIN + '/?ref=' + refCode;
    lc.innerHTML =
      '<div class="ap-lccard"><div class="lbl"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg>' + (ar ? 'رابط الإحالة' : 'Referral link') + '</div>' +
      '<div class="ap-bigcode"><code>' + link + '</code><button class="ap-mini-btn" data-copy="' + link + '">' + SVG.copy + T.copy + '</button></div>' +
      '<p class="sub">' + (ar ? 'يُنسب كل من يفتح هذا الرابط إليك خلال نافذة التتبّع.' : 'Anyone opening this link is attributed to you within the tracking window.') + '</p></div>' +
      (coupon ? '<div class="ap-lccard coupon"><div class="lbl"><svg viewBox="0 0 24 24"><path d="M4 9V6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 000 6v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 000-6z"/></svg>' + (ar ? 'كود الخصم' : 'Coupon code') + '<span class="ap-off">' + (ar ? 'خصم ' : '') + couponPct + '%' + (ar ? '' : ' off') + '</span></div>' +
      '<div class="ap-bigcode"><code>' + coupon + '</code><button class="ap-mini-btn" data-copy="' + coupon + '">' + SVG.copy + T.copy + '</button></div>' +
      '<p class="sub">' + (ar ? 'يمنح العميل خصم ' + couponPct + '٪ ويُسجّل عمولتك تلقائياً عند الشراء.' : 'Gives the client ' + couponPct + '% off and records your commission automatically at checkout.') + '</p></div>' : '');
  }
  function renderShare(link) { document.querySelectorAll('[data-sharebar]').forEach(el => el.innerHTML = shareBar(link)); }
  function renderLinks(data) {
    var lb = $('[data-links]'); if (!lb) return;
    lb.innerHTML = (data.links || []).map(x => {
      var url = x.url || (ORIGIN + '/?ref=' + (data.refCode || CODE));
      return '<div class="ap-linkcard"><div class="top"><span class="nm">' + x.name + '</span>' +
        '<div class="url"><code>' + url + '</code></div>' +
        '<button class="ap-mini-btn" data-copy="' + url + '">' + SVG.copy + T.copy + '</button></div>' +
        '<div class="stats"><div class="s"><div class="n">' + fmt(x.clicks) + '</div><div class="t">' + T.clicks + '</div></div>' +
        '<div class="s"><div class="n">' + fmt(x.conversions || 0) + '</div><div class="t">' + T.convs + '</div></div>' +
        '<div class="s"><div class="n">' + (x.clicks ? ((x.conversions || 0) / x.clicks * 100).toFixed(1) : '0') + '%</div><div class="t">' + T.rate + '</div></div></div></div>';
    }).join('');
  }
  function renderCatalog(products, coupon) {
    var cat = $('[data-catalog]'); if (!cat) return;
    cat.innerHTML = products.map(p => {
      var url = p.url; var ic = IC_BY_SLUG[p.slug] || IC.grow;
      return '<div class="ap-catcard"><div class="top"><span class="ci"><svg viewBox="0 0 24 24">' + ic + '</svg></span>' +
        '<div><div class="nm">' + pick(p, 'name') + '</div><div class="kind">' + (kindLabel[p.kind] || p.kind) + '</div></div></div>' +
        '<div class="ds">' + (pick(p, 'd') || '') + '</div>' +
        '<div class="lk"><code>' + url + '</code><button class="ap-mini-btn" data-copy="' + url + '">' + SVG.copy + T.copy + '</button></div>' +
        shareBar(url) + '</div>';
    }).join('');
  }

  // materials are front-end assets (not in the backend)
  var MATS = [
    { type: 'banner', tone: 'dark', dim: '1200×628', tag: 'NX Grow', name_ar: 'لافتة — NX Grow', name_en: 'Banner — NX Grow', desc_ar: 'لافتة أفقية للمشاركات الاجتماعية.', desc_en: 'Landscape banner for social posts.', big_ar: 'طوّر منصّتك مع NX', big_en: 'Grow your platform with NX', sm_ar: 'NX Grow', sm_en: 'NX Grow' },
    { type: 'banner', tone: 'light', dim: '1080×1080', tag: 'FinTech', name_ar: 'مربّع — التقنية المالية', name_en: 'Square — FinTech', desc_ar: 'تصميم مربّع لإنستغرام.', desc_en: 'Square design for Instagram.', big_ar: 'طبقة مالية داخل منتجك', big_en: 'A finance layer in your product', sm_ar: 'FinTech & Open Banking', sm_en: 'FinTech & Open Banking' },
    { type: 'banner', tone: 'dark', dim: '300×600', tag: 'IBP', name_ar: 'لافتة عمودية — IBP', name_en: 'Skyscraper — IBP', desc_ar: 'لافتة عمودية لمواقع المحتوى.', desc_en: 'Vertical banner for content sites.', big_ar: 'منصّة وسطاء التأمين', big_en: 'Insurance-broker platform', sm_ar: 'IBP Insure', sm_en: 'IBP Insure' },
    { type: 'social', tone: 'light', dim: ar ? 'نص جاهز' : 'Ready copy', tag: ar ? 'عام' : 'General', name_ar: 'منشور تعريفي', name_en: 'Intro post', desc_ar: 'نص منشور جاهز مع رابطك.', desc_en: 'Ready post copy with your link.', snip_ar: 'تبحث عن شريك تقني يبني لك نظاماً رقمياً يصمد أمام النمو والتدقيق؟ اكتشف NX Solutions 👇', snip_en: 'Looking for a tech partner to build a digital system that scales? Discover NX Solutions 👇' },
    { type: 'social', tone: 'dark', dim: ar ? 'منشور X' : 'X post', tag: ar ? 'عام' : 'General', name_ar: 'منشور X (تويتر)', name_en: 'X (Twitter) post', desc_ar: 'تغريدة قصيرة جاهزة للنشر.', desc_en: 'A short ready-to-post tweet.', snip_ar: 'من الموقع إلى نظام التشغيل والربط الحكومي — NX Solutions تبني تقنية تعمل فعلاً. 👇', snip_en: 'From your website to your operating system to gov integrations — NX Solutions builds tech that works. 👇' },
    { type: 'email', tone: 'light', dim: 'HTML', tag: ar ? 'عام' : 'General', name_ar: 'قالب بريد — عرض الخدمات', name_en: 'Email — services', desc_ar: 'قالب بريد قابل للتخصيص.', desc_en: 'Customizable email template.', snip_ar: 'مرحباً، أردت أن أشاركك NX Solutions — شريك تقني يبني ويطوّر المنصّات الرقمية للمنشآت السعودية…', snip_en: 'Hi, I wanted to share NX Solutions — a tech partner that builds digital platforms for Saudi enterprises…' },
    { type: 'email', tone: 'light', dim: ar ? 'توقيع' : 'Signature', tag: ar ? 'عام' : 'General', name_ar: 'توقيع بريد', name_en: 'Email signature', desc_ar: 'توقيع بريد أنيق مع رابط إحالتك.', desc_en: 'A tidy email signature with your link.', snip_ar: 'شريك NX Solutions المعتمد — احجز استشارة عبر رابطي', snip_en: 'Certified NX Solutions partner — book a consult via my link' },
    { type: 'copy', tone: 'light', dim: ar ? 'عبارات' : 'One-liners', tag: ar ? 'عام' : 'General', name_ar: 'عبارات تسويقية', name_en: 'Marketing one-liners', desc_ar: 'جُمل قصيرة لكل منتج تنسخها بسرعة.', desc_en: 'Short lines per product to copy fast.', snip_ar: 'NX Launch: أطلق نظامك الرقمي بثقة. · NX 360: أتمتة عملياتك بالكامل. · FinTech: مدفوعات وبيانات بنكية داخل منتجك.', snip_en: 'NX Launch: launch your system with confidence. · NX 360: fully automate your ops. · FinTech: payments & bank data inside your product.' },
    { type: 'logo', tone: 'light', dim: 'SVG · PNG', tag: ar ? 'علامة' : 'Brand', name_ar: 'حزمة الشعار', name_en: 'Logo pack', desc_ar: 'شعار NX بصيغ ونسخ متعددة (فاتح/داكن).', desc_en: 'NX logo in multiple formats (light/dark).', logo: true }
  ];
  function renderMats(filter) {
    var host = $('[data-mats]'); if (!host) return;
    var typeLabel = { banner: T.banners, social: T.social, email: T.email, logo: T.logos, copy: T.copytxt };
    host.innerHTML = MATS.filter(m => !filter || filter === 'all' || m.type === filter).map(m => {
      var pv;
      if (m.logo) pv = '<div class="pv light"><img class="logo" src="/assets/images/favicon.png" alt="NX"></div>';
      else if (m.type === 'social' || m.type === 'email' || m.type === 'copy') pv = '<div class="pv ' + (m.tone === 'light' ? 'light' : '') + '"><div class="bnr"><b style="color:' + (m.tone === 'light' ? 'var(--ink)' : '#fff') + '">' + (m.type === 'email' ? '✉' : m.type === 'copy' ? '“ ”' : '◈') + '</b></div><span class="type">' + typeLabel[m.type] + '</span></div>';
      else pv = '<div class="pv ' + (m.tone === 'light' ? 'light' : '') + '"><div class="bnr"><b style="color:' + (m.tone === 'light' ? 'var(--ink)' : '#fff') + '">' + pick(m, 'big') + '</b><span style="color:' + (m.tone === 'light' ? 'var(--muted)' : '#cfe0f2') + '">' + pick(m, 'sm') + '</span></div><span class="type">' + typeLabel[m.type] + '</span></div>';
      var snip = (m.snip_ar || m.snip_en) ? '<div class="ap-snip">' + pick(m, 'snip') + '<button class="ap-mini-btn cp" data-copy="' + pick(m, 'snip') + '">' + T.copy + '</button></div>' : '';
      var act = (m.logo || m.type === 'banner')
        ? '<button class="ap-mini-btn" data-toast="' + T.dl_soon + '"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>' + T.download + '</button>'
        : '<button class="ap-mini-btn" data-copy="' + (pick(m, 'snip') || '') + '">' + SVG.copy + T.copy + '</button>';
      return '<div class="ap-mat">' + pv + '<div class="mt"><div class="top-row"><div class="nm">' + pick(m, 'name') + '</div><span class="ap-tag">' + m.tag + '</span></div><div class="ds">' + pick(m, 'desc') + '</div>' + snip + '<div class="dim">' + m.dim + '</div><div class="acts">' + act + '</div></div></div>';
    }).join('');
  }

  // admin renderers
  function renderPartners(rows, live) {
    var b = $('[data-partners]'); if (!b) return;
    b.innerHTML = rows.map(x => {
      var act = x.status === 'pending'
        ? '<button class="ap-mini-btn" ' + (live ? 'data-approve-partner="' + x.id + '"' : 'data-act="' + (ar ? 'تم اعتماد الشريك (معاينة)' : 'Partner approved (demo)') + '"') + '>' + T.approve + '</button>'
        : '<button class="ap-mini-btn" data-act="' + (ar ? 'فتح ملف الشريك (معاينة)' : 'Open partner (demo)') + '">' + T.view + '</button>';
      return '<tr><td><div style="display:flex;align-items:center;gap:.6rem"><span class="ap-ava" style="width:30px;height:30px;font-size:.72rem">' + (x.name || '?').charAt(0) + '</span><div><b>' + x.name + '</b><div style="font-size:.72rem;color:var(--muted)">' + (x.email || '') + '</div></div></div></td><td>' + (x.channel || '—') + '</td><td class="mono">' + (x.coupon_code || '—') + '</td><td class="mono">' + fmt(x.conversions) + '</td><td class="amt">' + fmt(x.earned) + ' ' + CUR + '</td><td>' + statusBadge(x.status) + '</td><td>' + act + '</td></tr>';
    }).join('');
  }
  function renderOffers(rows, live) {
    var b = $('[data-offers]'); if (!b) return;
    b.innerHTML = rows.map(p => {
      var ic = IC_BY_SLUG[p.slug] || IC.grow;
      return '<tr><td><div style="display:flex;align-items:center;gap:.6rem"><span class="ap-ava" style="width:30px;height:30px;background:linear-gradient(135deg,rgba(20,66,114,.14),rgba(44,116,179,.2))"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--brand-2);fill:none;stroke-width:1.8">' + ic + '</svg></span><b>' + pick(p, 'name') + '</b></div></td><td>' + (kindLabel[p.kind] || p.kind) + '</td><td class="mono">' + (Number(p.commission_pct)) + '%</td><td>' + (p.promotable === false ? badge('bad', ar ? 'موقوف' : 'Off') : badge('ok', ar ? 'قابل للتسويق' : 'Promotable')) + '</td><td><button class="ap-mini-btn" data-act="' + (ar ? 'تعديل العرض (معاينة)' : 'Edit offer (demo)') + '">' + (ar ? 'تعديل' : 'Edit') + '</button></td></tr>';
    }).join('');
  }
  function renderPayouts(rows, live) {
    var b = $('[data-payouts]'); if (!b) return;
    b.innerHTML = rows.map(x => {
      var act = x.status === 'pending'
        ? '<button class="ap-mini-btn" ' + (live ? 'data-pay-paid="' + x.id + '"' : 'data-act="' + (ar ? 'تم التحديد كمدفوعة (معاينة) — التحويل الفعلي عبر البنك' : 'Marked paid (demo) — actual transfer via your bank') + '"') + '>' + T.markpaid + '</button>' : '—';
      return '<tr><td class="mono">' + day(x.date) + '</td><td><b>' + x.partner + '</b></td><td>' + (x.method || 'bank') + '</td><td class="amt">' + fmt(x.amount) + ' ' + CUR + '</td><td>' + statusBadge(x.status) + '</td><td>' + act + '</td></tr>';
    }).join('');
  }
  function renderNeedsAction(n) {
    document.querySelectorAll('[data-need]').forEach(el => { var k = el.dataset.need; if (n[k] != null) el.textContent = n[k]; });
  }

  // partner: "my referred clients" — name + status + commission once won
  function renderMyLeads(rows) {
    var b = $('[data-my-leads]'); if (!b) return;
    if (!rows || !rows.length) { b.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:22px">' + T.noLeads + '</td></tr>'; return; }
    b.innerHTML = rows.map(function (x) {
      var comm = x.status === 'won' ? '<span class="amt pos">' + fmt(x.commission) + ' ' + CUR + '</span>' : '<span style="color:var(--muted)">—</span>';
      return '<tr><td class="mono">' + day(x.date) + '</td><td><b>' + esc(x.client_name) + '</b></td><td>' + esc(svcLabel(x.service)) + '</td><td>' + leadStatusBadge(x.status) + '</td><td>' + comm + '</td></tr>';
    }).join('');
  }
  // admin: the "Requests" queue — verify payment → won (deal + commission) / lost / reopen
  function renderAdminLeads(rows, live) {
    var b = $('[data-admin-leads]'); if (!b) return;
    if (!rows || !rows.length) { b.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:22px">' + T.noReq + '</td></tr>'; return; }
    b.innerHTML = rows.map(function (x) {
      var acts;
      if (x.status === 'won') acts = '<span class="amt pos">' + fmt(x.commission) + ' ' + CUR + '</span>';
      else if (x.status === 'lost') acts = live ? '<button class="ap-mini-btn" data-lead-reopen="' + x.id + '">' + T.reopen + '</button>' : '—';
      else acts = live
        ? '<button class="ap-mini-btn" data-lead-won="' + x.id + '" data-lead-client="' + esc(x.client_name) + '">' + T.markWon + '</button> <button class="ap-mini-btn" style="color:var(--ap-bad)" data-lead-lost="' + x.id + '">' + T.markLost + '</button>'
        : '<button class="ap-mini-btn" data-act="' + (ar ? 'تأكيد الدفع (معاينة)' : 'Confirm paid (demo)') + '">' + T.markWon + '</button>';
      var email = x.email ? '<div style="font-size:.72rem;color:var(--muted)">' + esc(x.email) + '</div>' : '';
      return '<tr><td class="mono">' + day(x.date) + '</td><td><b>' + esc(x.client_name) + '</b>' + email + '</td><td>' + esc(x.partner) + '</td><td>' + esc(svcLabel(x.service)) + '</td><td>' + leadStatusBadge(x.status) + '</td><td>' + acts + '</td></tr>';
    }).join('');
  }

  // ============================================================
  //  DEMO dataset (labelled preview) — used until live data loads
  // ============================================================
  var DEMO = {
    partner: {
      leads: [
        { date: '2026-07-29', client_name: ar ? 'شركة رونق' : 'Rawnaq Co.', service: 'grow', status: 'won', commission: 3600 },
        { date: '2026-07-27', client_name: ar ? 'استوديو نجوم' : 'Nujoom Studio', service: 'launch', status: 'pending', commission: 0 },
        { date: '2026-07-22', client_name: ar ? 'مدار لوجستيك' : 'Madar Logistics', service: 'auto', status: 'pending', commission: 0 },
        { date: '2026-07-15', client_name: ar ? 'متجر أصيل' : 'Aseel Store', service: 'connect', status: 'lost', commission: 0 }
      ],
      kpis: [
        { cls: 'gold', k: ar ? 'الرصيد المتاح' : 'Available balance', v: 8420, cur: true, ic: '<path d="M20 12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7M2 7h20v5H2zM12 22V7"/>' },
        { k: ar ? 'أرباح هذا الشهر' : 'Earnings this month', v: 12480, cur: true, d: '18%', ic: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>' },
        { k: ar ? 'النقرات (30 يوماً)' : 'Clicks (30d)', v: 1240, cur: false, d: '9%', ic: '<path d="M9 3v4M15 3v4M4 9h16M6 21h12a1 1 0 001-1V8H5v12a1 1 0 001 1z"/>' },
        { k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: 38, cur: false, d: '12%', ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
      ],
      chart: [5100, 6200, 5800, 7400, 9100, 8600, 10800, 12480].map((v, i) => ({ label: MLABELS[i], value: v })),
      refs: [
        { date: '2026-07-28', product: 'NX Grow', client_name: 'Rawnaq Co.', via: 'link', deal_value: 24000, commission: 3600, status: 'approved' },
        { date: '2026-07-26', product: 'NX Launch', client_name: 'Nujoom Studio', via: 'KHALID10', deal_value: 12000, commission: 1800, status: 'approved' },
        { date: '2026-07-18', product: 'NX 360', client_name: 'Madar Logistics', via: 'link', deal_value: 31600, commission: 3160, status: 'pending' },
        { date: '2026-07-11', product: 'FinTech', client_name: 'Sadad Wallet', via: 'link', deal_value: 52000, commission: 5200, status: 'approved' },
        { date: '2026-07-02', product: 'IBP Insure', client_name: 'Wathiq Brokers', via: 'KHALID10', deal_value: 16000, commission: 2400, status: 'pending' }
      ],
      tx: [
        { date: '2026-07-28', type: 'commission', amount: 3600, memo: ar ? 'عمولة — NX Grow' : 'Commission — NX Grow' },
        { date: '2026-07-26', type: 'commission', amount: 1800, memo: ar ? 'عمولة عبر KHALID10' : 'Commission via KHALID10' },
        { date: '2026-07-20', type: 'payout', amount: 6000, memo: ar ? 'صرف إلى الحساب البنكي' : 'Payout to bank' },
        { date: '2026-07-11', type: 'commission', amount: 5200, memo: ar ? 'عمولة — التقنية المالية' : 'Commission — FinTech' },
        { date: '2026-07-03', type: 'reversal', amount: 1200, memo: ar ? 'استرجاع — إلغاء اشتراك' : 'Reversal — cancelled' }
      ],
      links: [
        { name: ar ? 'حملة لينكدإن' : 'LinkedIn campaign', url: BASE + '&c=linkedin', clicks: 486, conversions: 17 },
        { name: ar ? 'قائمتي البريدية' : 'My newsletter', url: BASE + '&c=news', clicks: 322, conversions: 11 },
        { name: ar ? 'التقنية المالية' : 'FinTech push', url: BASE + '&s=fintech', clicks: 198, conversions: 9 }
      ],
      catalog: [
        ['services/launch', 'NX Launch', 'NX Launch', 'service', 'إطلاق أول نظام رقمي لعملك بسرعة وثبات.', 'Launch your first digital system — fast and solid.'],
        ['services/grow', 'NX Grow', 'NX Grow', 'service', 'طوّر منصّتك ووسّع قدراتها مع نمو عملك.', 'Grow and extend your platform as you scale.'],
        ['services/automation360', 'NX 360', 'NX 360', 'service', 'أتمتة العمليات وربطها من طرف إلى طرف.', 'Automate and connect operations end to end.'],
        ['services/connect', 'NX Connect', 'NX Connect', 'service', 'اربط أنظمتك بالجهات الحكومية والخدمات.', 'Integrate with government & third-party services.'],
        ['services/scale', 'NX Scale', 'NX Scale', 'service', 'بنية جاهزة للتوسّع وأحمال الإنتاج.', 'Architecture ready for scale and production load.'],
        ['solutions/fintech-open-banking', 'التقنية المالية', 'FinTech & Open Banking', 'solution', 'طبقة مالية ومصرفية مفتوحة داخل منتجك.', 'An embedded open-banking & payments layer.'],
        ['work/ibp', 'IBP Insure', 'IBP Insure', 'platform', 'منصّة متكاملة لوسطاء التأمين.', 'An end-to-end insurance-broker platform.'],
        ['work/nqlah', 'Nqlah', 'Nqlah', 'platform', 'منصّة النقل والخدمات اللوجستية.', 'A transport & logistics platform.'],
        ['work/nx-logistic', 'NX Logistic', 'NX Logistic', 'platform', 'إدارة أصول وعمليات شركات النقليات.', 'Fleet asset & operations management.'],
        ['work/iwork', 'iWork', 'iWork', 'platform', 'قوى عاملة ذكية بوكلاء ذكاء اصطناعي.', 'An AI-powered digital workforce.']
      ].map(p => ({ slug: p[0], name_ar: p[1], name_en: p[2], kind: p[3], d_ar: p[4], d_en: p[5], url: ORIGIN + '/' + LANGSEG + '/' + p[0] + '/?ref=' + CODE })),
    },
    admin: {
      leads: [
        { id: 1, date: '2026-07-29', client_name: 'Rawnaq Co.', email: 'ceo@rawnaq.sa', partner: 'Khalid Al-Otaibi', service: 'grow', status: 'won', commission: 3600 },
        { id: 2, date: '2026-07-28', client_name: 'Nujoom Studio', email: 'hi@nujoom.co', partner: 'Sara Al-Ghamdi', service: 'launch', status: 'pending', commission: 0 },
        { id: 3, date: '2026-07-27', client_name: 'Madar Logistics', email: 'ops@madar.sa', partner: 'Khalid Al-Otaibi', service: 'auto', status: 'pending', commission: 0 },
        { id: 4, date: '2026-07-20', client_name: 'Aseel Store', email: 'aseel@shop.sa', partner: 'Faisal Media', service: 'connect', status: 'lost', commission: 0 }
      ],
      kpis: [
        { k: ar ? 'إجمالي الشركاء' : 'Total partners', v: 214, cur: false, ic: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/>' },
        { cls: 'gold', k: ar ? 'عمولات مستحقّة' : 'Commissions due', v: 86400, cur: true, ic: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
        { k: ar ? 'طلبات قيد المراجعة' : 'Pending approvals', v: 12, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
        { k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: 486, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
      ],
      chart: [210, 260, 240, 320, 380, 360, 430, 486].map((v, i) => ({ label: MLABELS[i], value: v })),
      partners: [
        { id: 1, name: 'Khalid Al-Otaibi', email: 'khalid@rawnaq.sa', channel: ar ? 'لينكدإن' : 'LinkedIn', coupon_code: 'KHALID10', conversions: 38, earned: 41280, status: 'active' },
        { id: 2, name: 'Sara Al-Ghamdi', email: 'sara@mostashar.co', channel: ar ? 'قائمة بريدية' : 'Newsletter', coupon_code: 'SARA10', conversions: 21, earned: 22400, status: 'active' },
        { id: 3, name: 'Faisal Media', email: 'hi@faisal.media', channel: ar ? 'يوتيوب' : 'YouTube', coupon_code: 'FAISAL10', conversions: 12, earned: 9600, status: 'active' },
        { id: 4, name: 'Noura Consulting', email: 'noura@nc.sa', channel: ar ? 'إحالات' : 'Referrals', coupon_code: '—', conversions: 0, earned: 0, status: 'pending' },
        { id: 5, name: 'Tariq Dev', email: 'tariq@devs.io', channel: ar ? 'مدوّنة' : 'Blog', coupon_code: '—', conversions: 3, earned: 2400, status: 'pending' },
        { id: 6, name: 'Old Agency', email: 'x@old.co', channel: ar ? 'وكالة' : 'Agency', coupon_code: 'OLD10', conversions: 1, earned: 800, status: 'suspended' }
      ],
      offers: [
        ['services/launch', 'NX Launch', 'service', 15], ['services/grow', 'NX Grow', 'service', 15],
        ['services/automation360', 'NX 360', 'service', 18], ['services/connect', 'NX Connect', 'service', 12],
        ['services/scale', 'NX Scale', 'service', 12], ['solutions/fintech-open-banking', 'التقنية المالية', 'solution', 20],
        ['work/ibp', 'IBP Insure', 'platform', 18], ['work/nqlah', 'Nqlah', 'platform', 15],
        ['work/nx-logistic', 'NX Logistic', 'platform', 15], ['work/iwork', 'iWork', 'platform', 18]
      ].map((o, i) => ({ id: i + 1, slug: o[0], name_ar: o[1], name_en: o[1], kind: o[2], commission_pct: o[3], promotable: true })),
      payouts: [
        { id: 1, date: '2026-07-28', partner: 'Khalid Al-Otaibi', method: ar ? 'حساب بنكي' : 'Bank', amount: 6000, status: 'pending' },
        { id: 2, date: '2026-07-28', partner: 'Sara Al-Ghamdi', method: ar ? 'حساب بنكي' : 'Bank', amount: 4200, status: 'pending' },
        { id: 3, date: '2026-07-20', partner: 'Faisal Media', method: ar ? 'حساب بنكي' : 'Bank', amount: 3000, status: 'paid' },
        { id: 4, date: '2026-07-12', partner: 'Khalid Al-Otaibi', method: ar ? 'حساب بنكي' : 'Bank', amount: 6000, status: 'paid' }
      ],
      needs: { joinRequests: 12, pendingLeads: 8, pendingPayouts: 2, pendingConversions: 27 }
    }
  };

  function demoRenderPortal() {
    var d = DEMO.partner;
    renderKpis(d.kpis); renderChart(d.chart); renderRefs(d.refs); renderTx(d.tx);
    renderLinkCoupon(CODE, COUPON, COUPON_PCT); renderShare(BASE); renderLinks(d);
    renderCatalog(d.catalog, COUPON); renderMats('all'); renderMyLeads(d.leads);
  }
  function demoRenderAdmin() {
    var d = DEMO.admin;
    renderKpis(d.kpis); renderChart(d.chart); renderPartners(d.partners, false);
    renderOffers(d.offers, false); renderPayouts(d.payouts, false);
    renderAdminLeads(d.leads, false); renderNeedsAction(d.needs);
  }

  // ============================================================
  //  interactions (shared)
  // ============================================================
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy); return; }
    var t = e.target.closest('[data-toast]'); if (t) { toast(t.dataset.toast); return; }
    var a = e.target.closest('[data-act]'); if (a && a.dataset.act) { toast(a.dataset.act); return; }
  });
  document.querySelectorAll('[data-filter]').forEach(c => c.addEventListener('click', function () {
    document.querySelectorAll('[data-filter]').forEach(o => o.classList.remove('on'));
    c.classList.add('on'); renderMats(c.dataset.filter);
  }));
  // withdraw modal (portal)
  var modal = $('[data-modal]');
  document.querySelectorAll('[data-open-withdraw]').forEach(b => b.addEventListener('click', () => modal && modal.classList.add('on')));
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal || e.target.hasAttribute('data-close')) modal.classList.remove('on'); });
    var wf = modal.querySelector('form');
    if (wf) wf.addEventListener('submit', async e => {
      e.preventDefault(); modal.classList.remove('on');
      var amt = parseFloat((modal.querySelector('input[type=number]') || {}).value) || undefined;
      if (LIVE) {
        try { await window.NXApi.post('/api/partner/payouts', { amount: amt }); toast(ar ? 'تم تسجيل طلب السحب' : 'Withdrawal request recorded'); await loadWalletLive(); }
        catch (err) { toast(err.message); }
      } else toast(ar ? 'تم تسجيل طلب السحب (معاينة)' : 'Withdrawal request recorded (demo)');
    });
  }
  // language switch
  function mirrorPath() { var p = location.pathname; return p.indexOf('/ar/') >= 0 ? p.replace('/ar/', '/en/') : p.replace('/en/', '/ar/'); }
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { location.href = mirrorPath() + location.hash; }));
  // sidebar drawer
  var burger = $('.ap-burger'), side = $('.ap-side'), scrim = $('.ap-scrim');
  if (burger && side) {
    burger.addEventListener('click', () => { side.classList.toggle('open'); if (scrim) scrim.classList.toggle('on', side.classList.contains('open')); });
    if (scrim) scrim.addEventListener('click', () => { side.classList.remove('open'); scrim.classList.remove('on'); });
  }
  // routing
  function animateChart() { document.querySelectorAll('.ap-chart .bar i[data-h]').forEach(i => requestAnimationFrame(() => { i.style.height = i.dataset.h + '%'; })); }
  function route() {
    var hash = (location.hash || '').replace('#', '');
    var views = document.querySelectorAll('.ap-view'), found = false;
    views.forEach(v => { var on = v.dataset.view === hash; v.classList.toggle('on', on); if (on) found = true; });
    if (!found && views[0]) { views[0].classList.add('on'); hash = views[0].dataset.view; }
    document.querySelectorAll('.ap-nav a[data-go]').forEach(a => a.classList.toggle('on', a.dataset.go === hash));
    if (side) side.classList.remove('open'); if (scrim) scrim.classList.remove('on');
    animateChart(); window.scrollTo(0, 0);
  }
  document.querySelectorAll('.ap-nav a[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); location.hash = a.dataset.go; }));
  window.addEventListener('hashchange', route);

  // ============================================================
  //  LIVE (backend) bootstrap
  // ============================================================
  var LIVE = false;
  function gotoLogin() { location.href = '/' + LANGSEG + '/affiliate/#login'; }

  async function loadWalletLive() {
    try {
      var w = await window.NXApi.get('/api/partner/wallet');
      renderTx(w.transactions.map(t => ({ date: t.date, type: t.type, amount: t.amount, memo: t.memo })));
      // balance card
      var b = w.balances;
      setText('[data-bal-available]', fmt(b.available)); setText('[data-bal-pending]', fmt(b.pending) + ' ' + CUR); setText('[data-bal-lifetime]', fmt(b.lifetime) + ' ' + CUR);
      setText('[data-modal-available]', fmt(b.available) + ' ' + CUR);
      var wa = $('[data-withdraw-amount]'); if (wa) { wa.value = Math.floor(b.available); wa.max = Math.floor(b.available); }
    } catch (e) {}
  }
  function setText(sel, v) { var el = $(sel); if (el) el.textContent = v; }

  function renderDemoFallback() { if (isPortal) demoRenderPortal(); else demoRenderAdmin(); route(); }
  async function bootLive() {
    if (!window.NXApi) return renderDemoFallback();
    var me;
    try { me = await window.NXApi.get('/api/auth/me'); }
    catch (e) {
      if (e.status === 401) return gotoLogin();
      return renderDemoFallback(); // backend unreachable → show demo, not a blank page
    }
    var user = me && me.partner;
    if (!user) return renderDemoFallback();
    if (isAdmin && user.role !== 'admin') { location.href = '/' + LANGSEG + '/affiliate/portal/'; return; } // logged-in non-admin → their portal
    if (isPortal && user.role === 'admin') { location.href = '/' + LANGSEG + '/affiliate/admin/'; return; } // admin → the admin console
    LIVE = true;
    document.querySelectorAll('.ap-demo').forEach(el => el.remove());

    // identity
    setText('.ap-user .nm', user.name);
    setText('.ap-user .rl', (user.role === 'admin' ? (ar ? 'مسؤول' : 'Administrator') : (ar ? 'شريك · ' : 'Partner · ') + user.refCode));
    var ava = $('.ap-user .ava, .ap-user .ap-ava'); if (ava) ava.textContent = (user.name || '?').charAt(0);

    try {
      if (isPortal) await loadPortalLive(user);
      else await loadAdminLive();
    } catch (e) { /* keep demo where a view failed */ }
    route();
  }

  async function loadPortalLive(user) {
    var refCode = user.refCode || CODE, link = ORIGIN + '/?ref=' + refCode;
    // topbar reflink
    var rl = $('.ap-reflink code'); if (rl) rl.textContent = 'nx.sa/?ref=' + refCode;
    var rlBtn = $('.ap-reflink .cp'); if (rlBtn) rlBtn.setAttribute('data-copy', link);
    var first = (user.name || '').trim().split(/\s+/)[0] || '';
    setText('[data-hello]', (ar ? 'مرحباً' : 'Hi') + (first ? (ar ? '، ' : ', ') + first : '') + ' 👋');
    var ql = $('[data-quick-link]'); if (ql) ql.textContent = link;
    var qlb = $('[data-quick-linkbtn]'); if (qlb) qlb.setAttribute('data-copy', link);

    var ov = await window.NXApi.get('/api/partner/overview');
    renderKpis([
      { cls: 'gold', k: ar ? 'الرصيد المتاح' : 'Available balance', v: ov.kpis.available, cur: true, ic: '<path d="M20 12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7M2 7h20v5H2zM12 22V7"/>' },
      { k: ar ? 'أرباح هذا الشهر' : 'Earnings this month', v: ov.kpis.month, cur: true, ic: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>' },
      { k: ar ? 'النقرات (30 يوماً)' : 'Clicks (30d)', v: ov.kpis.clicks30, cur: false, ic: '<path d="M9 3v4M15 3v4M4 9h16M6 21h12a1 1 0 001-1V8H5v12a1 1 0 001 1z"/>' },
      { k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: ov.kpis.conversions30, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
    ]);
    renderChart(ov.chart); renderRefs(ov.recentConversions);

    var links = await window.NXApi.get('/api/partner/links');
    renderLinkCoupon(links.refCode || refCode, links.couponCode, COUPON_PCT); renderShare(link);
    var qc = $('[data-quick-coupon]'); if (qc) qc.textContent = links.couponCode || '—';
    var qcb = $('[data-quick-couponbtn]'); if (qcb) qcb.setAttribute('data-copy', links.couponCode || '');
    renderLinks({ refCode: links.refCode, links: links.links });

    var cat = await window.NXApi.get('/api/partner/catalog');
    renderCatalog(cat.products.map(p => ({ slug: p.slug, name_ar: p.name_ar, name_en: p.name_en, kind: p.kind, d_ar: '', d_en: '', url: p.url })), cat.couponCode);

    await loadWalletLive();

    try { var ml = await window.NXApi.get('/api/partner/leads'); renderMyLeads(ml.leads); } catch (e) {}

    try {
      var pr = (await window.NXApi.get('/api/partner/profile')).profile;
      setVal('[data-view="settings"] input[name=name], [data-view="settings"] input[type=text]', pr.name);
    } catch (e) {}
    wirePortalActions();
  }
  function setVal(sel, v) { var el = $(sel); if (el && v != null) el.value = v; }

  function wirePortalActions() {
    var createBtn = document.querySelector('[data-view="links"] .ap-wbtn');
    if (createBtn && !createBtn._wired) {
      createBtn._wired = 1;
      createBtn.addEventListener('click', async function () {
        var wrap = createBtn.closest('.ap-card');
        var name = (wrap.querySelector('input[type=text]') || {}).value;
        if (!name) return toast(ar ? 'أدخل اسم الحملة' : 'Enter a campaign name');
        try { await window.NXApi.post('/api/partner/links', { name: name }); toast(ar ? 'تم إنشاء الرابط' : 'Link created'); var l = await window.NXApi.get('/api/partner/links'); renderLinks({ refCode: l.refCode, links: l.links }); }
        catch (e) { toast(e.message); }
      });
    }
  }

  async function loadAdminLive() {
    var ov = await window.NXApi.get('/api/admin/overview');
    renderKpis([
      { k: ar ? 'إجمالي الشركاء' : 'Total partners', v: ov.kpis.totalPartners, cur: false, ic: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/>' },
      { cls: 'gold', k: ar ? 'عمولات مستحقّة' : 'Commissions due', v: ov.kpis.commissionsDue, cur: true, ic: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
      { k: ar ? 'طلبات قيد المراجعة' : 'Pending approvals', v: ov.kpis.pendingApprovals, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: ov.kpis.conversions30, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
    ]);
    renderChart(ov.chart); renderNeedsAction(ov.needsAction);
    var pt = await window.NXApi.get('/api/admin/partners'); renderPartners(pt.partners, true);
    var of = await window.NXApi.get('/api/admin/offers'); renderOffers(of.offers, true);
    var po = await window.NXApi.get('/api/admin/payouts'); renderPayouts(po.payouts, true);
    var ld = await window.NXApi.get('/api/admin/leads'); renderAdminLeads(ld.leads, true);
    setupWonModal();
    wireAdminActions();
  }
  async function refreshAdminLeads() {
    try { var ld = await window.NXApi.get('/api/admin/leads'); renderAdminLeads(ld.leads, true); } catch (e) {}
    try { var ov = await window.NXApi.get('/api/admin/overview'); renderNeedsAction(ov.needsAction); } catch (e) {}
  }
  // record-deal modal (admin): mark a lead won → enter deal value → commission
  var wonModal, currentWonId = null;
  function openWon(client) {
    wonModal = wonModal || $('[data-won-modal]'); if (!wonModal) return;
    var ci = wonModal.querySelector('[data-won-client]'); if (ci) ci.value = client;
    var di = wonModal.querySelector('[data-won-deal]'); if (di) di.value = '';
    wonModal.classList.add('on');
  }
  function setupWonModal() {
    wonModal = $('[data-won-modal]');
    if (!wonModal || wonModal._wired) return; wonModal._wired = 1;
    wonModal.addEventListener('click', function (e) { if (e.target === wonModal || e.target.hasAttribute('data-close')) wonModal.classList.remove('on'); });
    var f = wonModal.querySelector('form');
    if (f) f.addEventListener('submit', async function (e) {
      e.preventDefault();
      var deal = parseFloat((wonModal.querySelector('[data-won-deal]') || {}).value);
      if (!deal || deal <= 0) return toast(ar ? 'أدخل قيمة الصفقة' : 'Enter the deal value');
      if (!currentWonId) return;
      try {
        var r = await window.NXApi.post('/api/admin/leads/' + currentWonId + '/won', { deal_value: deal });
        wonModal.classList.remove('on');
        toast(ar ? ('تم — عمولة ' + fmt(r.commission) + ' ' + CUR) : ('Done — ' + fmt(r.commission) + ' ' + CUR + ' commission'));
        await refreshAdminLeads();
      } catch (er) { toast(er.message); }
    });
  }
  function wireAdminActions() {
    if (document._adminWired) return; document._adminWired = 1;
    document.addEventListener('click', async function (e) {
      var ap = e.target.closest('[data-approve-partner]');
      if (ap) { try { await window.NXApi.post('/api/admin/partners/' + ap.dataset.approvePartner + '/approve'); toast(ar ? 'تم اعتماد الشريك' : 'Partner approved'); renderPartners((await window.NXApi.get('/api/admin/partners')).partners, true); } catch (er) { toast(er.message); } return; }
      var pp = e.target.closest('[data-pay-paid]');
      if (pp) { try { await window.NXApi.post('/api/admin/payouts/' + pp.dataset.payPaid + '/paid'); toast(ar ? 'تم التحديد كمدفوعة' : 'Marked paid'); renderPayouts((await window.NXApi.get('/api/admin/payouts')).payouts, true); } catch (er) { toast(er.message); } return; }
      var lw = e.target.closest('[data-lead-won]');
      if (lw) { currentWonId = lw.dataset.leadWon; openWon(lw.dataset.leadClient || ''); return; }
      var ll = e.target.closest('[data-lead-lost]');
      if (ll) { try { await window.NXApi.post('/api/admin/leads/' + ll.dataset.leadLost + '/lost'); toast(ar ? 'تم الإغلاق' : 'Marked lost'); await refreshAdminLeads(); } catch (er) { toast(er.message); } return; }
      var lr = e.target.closest('[data-lead-reopen]');
      if (lr) { try { await window.NXApi.post('/api/admin/leads/' + lr.dataset.leadReopen + '/reopen'); toast(ar ? 'أُعيد فتحه' : 'Reopened'); await refreshAdminLeads(); } catch (er) { toast(er.message); } return; }
    });
  }

  // logout link
  var logout = $('.ap-user .out');
  if (logout) logout.addEventListener('click', async function (e) {
    if (!window.NXApi) return; // demo → just follow href
    e.preventDefault();
    try { await window.NXApi.post('/api/auth/logout'); } catch (er) {}
    location.href = logout.getAttribute('href') || ('/' + LANGSEG + '/affiliate/');
  });

  // ---- go ----
  if (window.NXApi && window.NXApi.base) {
    // backend configured → verify the session FIRST (no demo flash for logged-out
    // visitors): bootLive renders live, redirects to login on 401, or falls back
    // to demo only if the backend is unreachable.
    route();
    bootLive();
  } else {
    // no backend configured (pure static preview) → paint the demo instantly
    if (isPortal) demoRenderPortal(); else demoRenderAdmin();
    route();
  }
})();
