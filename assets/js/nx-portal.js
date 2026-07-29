/* ============================================================
   NX Partners — portal & admin behaviour (nx-portal.js)
   DEMO front-end: renders from in-file sample data so the product
   can be seen and approved before the Node + PostgreSQL backend is
   wired. Every render function reads from `DATA` — swap those for
   fetch() calls to the API and the UI is unchanged.
   ============================================================ */
(function () {
  'use strict';
  var body = document.body;
  var isAdmin = body.classList.contains('p-admin');
  var isPortal = body.classList.contains('p-portal');
  if (!isAdmin && !isPortal) return;

  var ar = document.documentElement.lang === 'ar';
  var CUR = ar ? '﷼' : 'SAR';
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var pick = function (o, k) { return o[k + (ar ? '_ar' : '_en')]; };

  var T = ar ? {
    clicks: 'نقرة', convs: 'تحويل', copied: 'تم النسخ', copyLink: 'نسخ الرابط',
    copy: 'نسخ', download: 'تنزيل', paid: 'مدفوعة', pending: 'قيد المراجعة',
    approved: 'معتمدة', rejected: 'مرفوضة', hold: 'محتجزة', active: 'نشط',
    suspended: 'موقوف', commission: 'عمولة', payout: 'صرف', reversed: 'مُسترجعة',
    all: 'الكل', banners: 'لافتات', social: 'سوشال ميديا', email: 'بريد', logos: 'شعارات', copytxt: 'نصوص',
    approve: 'اعتماد', reject: 'رفض', view: 'عرض', markpaid: 'تحديد كمدفوعة'
  } : {
    clicks: 'clicks', convs: 'conv.', copied: 'Copied', copyLink: 'Copy link',
    copy: 'Copy', download: 'Download', paid: 'Paid', pending: 'Pending',
    approved: 'Approved', rejected: 'Rejected', hold: 'On hold', active: 'Active',
    suspended: 'Suspended', commission: 'Commission', payout: 'Payout', reversed: 'Reversed',
    all: 'All', banners: 'Banners', social: 'Social', email: 'Email', logos: 'Logos', copytxt: 'Copy',
    approve: 'Approve', reject: 'Reject', view: 'View', markpaid: 'Mark paid'
  };

  var badge = function (kind, txt) { return '<span class="ap-b ' + kind + '">' + txt + '</span>'; };
  var money = function (n, neg) { return (neg ? '−' : '') + fmt(n) + ' ' + CUR; };

  // ---------- toast ----------
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

  // ---------- routing ----------
  function route() {
    var hash = (location.hash || '').replace('#', '') || (isAdmin ? 'overview' : 'overview');
    var views = document.querySelectorAll('.ap-view');
    var found = false;
    views.forEach(function (v) { var on = v.dataset.view === hash; v.classList.toggle('on', on); if (on) found = true; });
    if (!found) { views[0] && views[0].classList.add('on'); hash = views[0] ? views[0].dataset.view : ''; }
    document.querySelectorAll('.ap-nav a[data-go]').forEach(function (a) { a.classList.toggle('on', a.dataset.go === hash); });
    var side = document.querySelector('.ap-side'); if (side) side.classList.remove('open');
    var scrim = document.querySelector('.ap-scrim'); if (scrim) scrim.classList.remove('on');
    // reveal chart bars when overview shows
    animateChart();
    window.scrollTo(0, 0);
  }

  function animateChart() {
    document.querySelectorAll('.ap-chart .bar i[data-h]').forEach(function (i) {
      requestAnimationFrame(function () { i.style.height = i.dataset.h + '%'; });
    });
  }

  // ============================================================
  //  PARTNER PORTAL
  // ============================================================
  if (isPortal) {
    var CODE = 'KHALID-7Q2';
    var BASE = 'https://nx.sa/?ref=' + CODE;

    var TX = [
      { d: '2026-07-28', t: 'commission', k: ar ? 'عمولة — NX Grow' : 'Commission — NX Grow', a: 3600, s: 'approved' },
      { d: '2026-07-24', t: 'commission', k: ar ? 'عمولة — IBP Insure' : 'Commission — IBP Insure', a: 2400, s: 'approved' },
      { d: '2026-07-20', t: 'payout', k: ar ? 'صرف إلى الحساب البنكي' : 'Payout to bank account', a: 6000, s: 'paid' },
      { d: '2026-07-18', t: 'commission', k: ar ? 'عمولة — NX 360' : 'Commission — NX 360', a: 3160, s: 'pending' },
      { d: '2026-07-11', t: 'commission', k: ar ? 'عمولة — التقنية المالية' : 'Commission — FinTech', a: 5200, s: 'approved' },
      { d: '2026-07-03', t: 'reversed', k: ar ? 'استرجاع — إلغاء اشتراك' : 'Reversal — cancelled signup', a: 1200, s: 'reversed' }
    ];
    var REFS = [
      { d: '2026-07-28', p: 'NX Grow', c: 'Rawnaq Co.', v: 24000, com: 3600, s: 'approved' },
      { d: '2026-07-24', p: 'IBP Insure', c: 'Wathiq Brokers', v: 16000, com: 2400, s: 'approved' },
      { d: '2026-07-18', p: 'NX 360', c: 'Madar Logistics', v: 31600, com: 3160, s: 'pending' },
      { d: '2026-07-11', p: 'FinTech', c: 'Sadad Wallet', v: 52000, com: 5200, s: 'approved' },
      { d: '2026-07-02', p: 'NX Launch', c: 'Nujoom Studio', v: 12000, com: 1800, s: 'pending' }
    ];
    var LINKS = [
      { n: ar ? 'الرابط الافتراضي' : 'Default link', q: '', cl: 1240, cv: 38 },
      { n: ar ? 'حملة لينكدإن' : 'LinkedIn campaign', q: '&c=linkedin', cl: 486, cv: 17 },
      { n: ar ? 'قائمتي البريدية' : 'My newsletter', q: '&c=news', cl: 322, cv: 11 },
      { n: ar ? 'التقنية المالية' : 'FinTech push', q: '&s=fintech', cl: 198, cv: 9 }
    ];
    var MATS = [
      { type: 'banner', tone: 'dark', dim: '1200×628', name_ar: 'لافتة رئيسية — لينكدإن/فيسبوك', name_en: 'Hero banner — LinkedIn/Facebook', desc_ar: 'لافتة أفقية جاهزة للمشاركات الاجتماعية.', desc_en: 'Landscape banner ready for social posts.', big_ar: 'ابنِ نظامك الرقمي مع NX', big_en: 'Build your digital system with NX', sm_ar: 'شريك تقني موثوق' , sm_en: 'A trusted technology partner' },
      { type: 'banner', tone: 'light', dim: '1080×1080', name_ar: 'مربّع — إنستغرام', name_en: 'Square — Instagram', desc_ar: 'تصميم مربّع لمنشورات إنستغرام.', desc_en: 'Square design for Instagram posts.', big_ar: 'حلول تعمل فعلاً', big_en: 'Solutions that actually work', sm_ar: 'خدمات · حلول · منصّات', sm_en: 'Services · Solutions · Platforms' },
      { type: 'banner', tone: 'dark', dim: '300×600', name_ar: 'لافتة عمودية — مدوّنات', name_en: 'Skyscraper — blogs', desc_ar: 'لافتة عمودية لمواقع المحتوى.', desc_en: 'Vertical banner for content sites.', big_ar: 'حوّل عملك رقمياً', big_en: 'Go digital', sm_ar: 'مع NX Solutions', sm_en: 'with NX Solutions' },
      { type: 'social', tone: 'light', dim: ar ? 'نص جاهز' : 'Ready copy', name_ar: 'منشور تعريفي — عربي', name_en: 'Intro post — Arabic', desc_ar: 'نص منشور جاهز مع رابط إحالتك.', desc_en: 'Ready post copy with your referral link.', snip_ar: 'تبحث عن شريك تقني يبني لك نظاماً رقمياً يصمد أمام النمو والتدقيق؟ اكتشف NX Solutions 👇', snip_en: 'Looking for a tech partner to build a digital system that scales? Discover NX Solutions 👇' },
      { type: 'email', tone: 'light', dim: 'HTML', name_ar: 'قالب بريد — عرض الخدمات', name_en: 'Email template — services', desc_ar: 'قالب بريد إلكتروني قابل للتخصيص.', desc_en: 'Customizable email template.', snip_ar: 'مرحباً، أردت أن أشاركك NX Solutions — شريك تقني يبني ويطوّر المنصّات الرقمية للمنشآت السعودية…', snip_en: 'Hi, I wanted to share NX Solutions — a tech partner that builds digital platforms for Saudi enterprises…' },
      { type: 'logo', tone: 'light', dim: 'SVG · PNG', name_ar: 'حزمة الشعار', name_en: 'Logo pack', desc_ar: 'شعار NX بصيغ ونسخ متعددة (فاتح/داكن).', desc_en: 'NX logo in multiple formats (light/dark).', logo: true }
    ];

    function linkUrl(q) { return BASE + q; }

    // KPIs
    var kpis = [
      { cls: 'gold', k: ar ? 'الرصيد المتاح' : 'Available balance', v: 8420, cur: true, d: '', ic: '<path d="M20 12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7M2 7h20v5H2zM12 22V7"/>' },
      { cls: '', k: ar ? 'أرباح هذا الشهر' : 'Earnings this month', v: 12480, cur: true, d: 'up:18%', ic: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>' },
      { cls: '', k: ar ? 'النقرات (30 يوماً)' : 'Clicks (30d)', v: 1240, cur: false, d: 'up:9%', ic: '<path d="M9 3v4M15 3v4M4 9h16M6 21h12a1 1 0 001-1V8H5v12a1 1 0 001 1z"/>' },
      { cls: '', k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: 38, cur: false, d: 'up:12%', ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
    ];
    var host = document.querySelector('[data-kpis]');
    if (host) host.innerHTML = kpis.map(function (x) {
      var d = x.d ? '<div class="d up">▲ ' + x.d.split(':')[1] + '</div>' : '';
      return '<div class="ap-kpi ' + x.cls + '"><div class="ic"><svg viewBox="0 0 24 24">' + x.ic + '</svg></div>' +
        '<div class="k">' + x.k + '</div><div class="v">' + (x.cur ? '<span class="cur">' + CUR + '</span>' : '') +
        fmt(x.v) + '</div>' + d + '</div>';
    }).join('');

    // chart (8 months)
    var series = [5100, 6200, 5800, 7400, 9100, 8600, 10800, 12480];
    var mlabels = ['12', '01', '02', '03', '04', '05', '06', '07'];
    var mx = Math.max.apply(null, series);
    var chart = document.querySelector('[data-chart]');
    if (chart) chart.innerHTML = series.map(function (v, i) {
      var h = Math.round(v / mx * 100);
      return '<div class="bar"><i data-h="' + h + '" style="height:0"><b>' + fmt(v) + '</b></i><span>' + mlabels[i] + '</span></div>';
    }).join('');

    // transactions
    var txb = document.querySelector('[data-tx]');
    if (txb) txb.innerHTML = TX.map(function (x) {
      var sb = x.s === 'paid' ? badge('ok', T.paid) : x.s === 'approved' ? badge('info', T.approved) : x.s === 'pending' ? badge('warn', T.pending) : badge('bad', T.reversed);
      var neg = (x.t === 'payout' || x.t === 'reversed');
      return '<tr><td class="mono">' + x.d + '</td><td><b>' + x.k + '</b></td><td class="amt ' + (neg ? 'neg' : 'pos') + '">' + money(x.a, neg) + '</td><td>' + sb + '</td></tr>';
    }).join('');

    // referrals
    var rb = document.querySelector('[data-refs]');
    if (rb) rb.innerHTML = REFS.map(function (x) {
      var sb = x.s === 'approved' ? badge('ok', T.approved) : x.s === 'pending' ? badge('warn', T.pending) : badge('bad', T.rejected);
      return '<tr><td class="mono">' + x.d + '</td><td><b>' + x.p + '</b></td><td>' + x.c + '</td><td class="mono">' + fmt(x.v) + ' ' + CUR + '</td><td class="amt pos">' + fmt(x.com) + ' ' + CUR + '</td><td>' + sb + '</td></tr>';
    }).join('');

    // links
    var lb = document.querySelector('[data-links]');
    if (lb) lb.innerHTML = LINKS.map(function (x) {
      var url = linkUrl(x.q);
      return '<div class="ap-linkcard"><div class="top"><span class="nm">' + x.n + '</span>' +
        '<div class="url"><code>' + url + '</code></div>' +
        '<button class="ap-mini-btn" data-copy="' + url + '"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>' + T.copy + '</button></div>' +
        '<div class="stats"><div class="s"><div class="n">' + fmt(x.cl) + '</div><div class="t">' + T.clicks + '</div></div>' +
        '<div class="s"><div class="n">' + fmt(x.cv) + '</div><div class="t">' + T.convs + '</div></div>' +
        '<div class="s"><div class="n">' + (x.cl ? (x.cv / x.cl * 100).toFixed(1) : '0') + '%</div><div class="t">' + (ar ? 'معدّل' : 'rate') + '</div></div></div></div>';
    }).join('');

    // materials
    var typeLabel = { banner: T.banners, social: T.social, email: T.email, logo: T.logos, copy: T.copytxt };
    var matHost = document.querySelector('[data-mats]');
    function renderMats(filter) {
      if (!matHost) return;
      matHost.innerHTML = MATS.filter(function (m) { return !filter || filter === 'all' || m.type === filter; }).map(function (m) {
        var pv;
        if (m.logo) pv = '<div class="pv light"><img class="logo" src="/assets/images/favicon.png" alt="NX"></div>';
        else if (m.type === 'social' || m.type === 'email') pv = '<div class="pv ' + (m.tone === 'light' ? 'light' : '') + '"><div class="bnr"><b style="color:' + (m.tone === 'light' ? 'var(--ink)' : '#fff') + '">' + (m.type === 'email' ? '✉' : '◈') + '</b></div><span class="type">' + typeLabel[m.type] + '</span></div>';
        else pv = '<div class="pv ' + (m.tone === 'light' ? 'light' : '') + '"><div class="bnr"><b style="color:' + (m.tone === 'light' ? 'var(--ink)' : '#fff') + '">' + pick(m, 'big') + '</b><span style="color:' + (m.tone === 'light' ? 'var(--muted)' : '#cfe0f2') + '">' + pick(m, 'sm') + '</span></div><span class="type">' + typeLabel[m.type] + '</span></div>';
        var snip = (m.snip_ar || m.snip_en) ? '<div class="ap-snip">' + pick(m, 'snip') + '<button class="ap-mini-btn cp" data-copy="' + pick(m, 'snip') + '">' + T.copy + '</button></div>' : '';
        var act = m.logo || m.type === 'banner'
          ? '<button class="ap-mini-btn" data-toast="' + (ar ? 'سيبدأ التنزيل عند تفعيل البوابة' : 'Download begins when the portal goes live') + '"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>' + T.download + '</button>'
          : '<button class="ap-mini-btn" data-copy="' + (pick(m, 'snip') || '') + '"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>' + T.copy + '</button>';
        return '<div class="ap-mat">' + pv + '<div class="mt"><div class="nm">' + pick(m, 'name') + '</div><div class="ds">' + pick(m, 'desc') + '</div>' + snip + '<div class="dim">' + m.dim + '</div><div class="acts">' + act + '</div></div></div>';
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
      if (wf) wf.addEventListener('submit', function (e) {
        e.preventDefault(); modal.classList.remove('on');
        toast(ar ? 'تم تسجيل طلب السحب (معاينة)' : 'Withdrawal request recorded (demo)');
      });
    }
  }

  // ============================================================
  //  ADMIN CONSOLE
  // ============================================================
  if (isAdmin) {
    var A_KPIS = [
      { cls: '', k: ar ? 'إجمالي الشركاء' : 'Total partners', v: 214, cur: false, ic: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' },
      { cls: 'gold', k: ar ? 'عمولات مستحقّة' : 'Commissions due', v: 86400, cur: true, ic: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
      { cls: '', k: ar ? 'طلبات قيد المراجعة' : 'Pending approvals', v: 12, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { cls: '', k: ar ? 'التحويلات (30 يوماً)' : 'Conversions (30d)', v: 486, cur: false, ic: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>' }
    ];
    var ah = document.querySelector('[data-kpis]');
    if (ah) ah.innerHTML = A_KPIS.map(function (x) {
      return '<div class="ap-kpi ' + x.cls + '"><div class="ic"><svg viewBox="0 0 24 24">' + x.ic + '</svg></div><div class="k">' + x.k + '</div><div class="v">' + (x.cur ? '<span class="cur">' + CUR + '</span>' : '') + fmt(x.v) + '</div></div>';
    }).join('');

    var A_SERIES = [210, 260, 240, 320, 380, 360, 430, 486];
    var aml = ['12', '01', '02', '03', '04', '05', '06', '07'];
    var amx = Math.max.apply(null, A_SERIES);
    var achart = document.querySelector('[data-chart]');
    if (achart) achart.innerHTML = A_SERIES.map(function (v, i) {
      var h = Math.round(v / amx * 100);
      return '<div class="bar"><i data-h="' + h + '" style="height:0"><b>' + fmt(v) + '</b></i><span>' + aml[i] + '</span></div>';
    }).join('');

    var PARTNERS = [
      { n: 'Khalid Al-Otaibi', e: 'khalid@rawnaq.sa', ch: ar ? 'لينكدإن' : 'LinkedIn', cv: 38, earned: 41280, s: 'active' },
      { n: 'Sara Al-Ghamdi', e: 'sara@mostashar.co', ch: ar ? 'قائمة بريدية' : 'Newsletter', cv: 21, earned: 22400, s: 'active' },
      { n: 'Faisal Media', e: 'hi@faisal.media', ch: ar ? 'يوتيوب' : 'YouTube', cv: 12, earned: 9600, s: 'active' },
      { n: 'Noura Consulting', e: 'noura@nc.sa', ch: ar ? 'إحالات' : 'Referrals', cv: 0, earned: 0, s: 'pending' },
      { n: 'Tariq Dev', e: 'tariq@devs.io', ch: ar ? 'مدوّنة' : 'Blog', cv: 3, earned: 2400, s: 'pending' },
      { n: 'Old Agency', e: 'x@old.co', ch: ar ? 'وكالة' : 'Agency', cv: 1, earned: 800, s: 'suspended' }
    ];
    var pb = document.querySelector('[data-partners]');
    if (pb) pb.innerHTML = PARTNERS.map(function (x) {
      var sb = x.s === 'active' ? badge('ok', T.active) : x.s === 'pending' ? badge('warn', T.pending) : badge('bad', T.suspended);
      var act = x.s === 'pending'
        ? '<button class="ap-mini-btn" data-act="' + (ar ? 'تم اعتماد الشريك (معاينة)' : 'Partner approved (demo)') + '">' + T.approve + '</button>'
        : '<button class="ap-mini-btn" data-act="' + (ar ? 'فتح ملف الشريك (معاينة)' : 'Open partner (demo)') + '">' + T.view + '</button>';
      return '<tr><td><div style="display:flex;align-items:center;gap:.6rem"><span class="ap-ava" style="width:30px;height:30px;font-size:.72rem">' + x.n.charAt(0) + '</span><div><b>' + x.n + '</b><div style="font-size:.72rem;color:var(--muted)">' + x.e + '</div></div></div></td><td>' + x.ch + '</td><td class="mono">' + x.cv + '</td><td class="amt">' + fmt(x.earned) + ' ' + CUR + '</td><td>' + sb + '</td><td>' + act + '</td></tr>';
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
      var act = x.s === 'pending' ? '<button class="ap-mini-btn" data-act="' + (ar ? 'تم التحديد كمدفوعة (معاينة) — التحويل الفعلي يتم عبر البنك' : 'Marked paid (demo) — actual transfer done via your bank') + '">' + T.markpaid + '</button>' : '—';
      return '<tr><td class="mono">' + x.d + '</td><td><b>' + x.n + '</b></td><td>' + x.m + '</td><td class="amt">' + fmt(x.a) + ' ' + CUR + '</td><td>' + sb + '</td><td>' + act + '</td></tr>';
    }).join('');

    document.querySelectorAll('[data-act]').forEach(function (b) { b.addEventListener('click', function () { toast(b.dataset.act); }); });
  }

  // ---------- shared interactions ----------
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy); return; }
    var t = e.target.closest('[data-toast]'); if (t) { toast(t.dataset.toast); return; }
    var a = e.target.closest('[data-act]'); if (a && a.dataset.act) { toast(a.dataset.act); return; }
  });

  // sidebar drawer (mobile)
  var burger = document.querySelector('.ap-burger');
  var side = document.querySelector('.ap-side');
  var scrim = document.querySelector('.ap-scrim');
  if (burger && side) {
    burger.addEventListener('click', function () { side.classList.toggle('open'); if (scrim) scrim.classList.toggle('on', side.classList.contains('open')); });
    if (scrim) scrim.addEventListener('click', function () { side.classList.remove('open'); scrim.classList.remove('on'); });
  }

  // nav links (hash)
  document.querySelectorAll('.ap-nav a[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); location.hash = a.dataset.go; });
  });
  window.addEventListener('hashchange', route);
  route();
})();
