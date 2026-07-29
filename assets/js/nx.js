/* NX Solutions — shared client script
   Wired by every /en and /ar page. Page-specific scripts (3D parallax,
   meter fills, filter chips) stay inline in their owning page. */

(function () {
  // hello, fellow engineer 👋
  try {
    console.log('%cNX Solutions', 'font:700 22px/1.4 sans-serif;color:#205295', '\n  Built clean, compliant and fast — by hand.\n  Like what you see under the hood? hello@nx.sa');
  } catch (e) {}

  // nav scroll shadow
  const bar = document.getElementById('bar');
  if (bar) addEventListener('scroll', () => bar.classList.toggle('scrolled', scrollY > 12));

  // mobile drawer
  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.nav-drawer');
  if (burger && drawer) {
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
    const close = () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('drawer-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      burger.classList.add('open');
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('drawer-open');
      burger.setAttribute('aria-expanded', 'true');
    };
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => {
      drawer.classList.contains('open') ? close() : open();
    });
    backdrop.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // sliding white active-indicator behind the drawer links
    const navLinks = drawer.querySelector('.nav-links');
    const links = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];
    if (navLinks && links.length) {
      const ind = document.createElement('span');
      ind.className = 'nav-ind';
      navLinks.prepend(ind);
      const place = (a, animate) => {
        if (!a) return;
        ind.classList.toggle('no-anim', !animate);
        ind.style.transform = 'translateY(' + a.offsetTop + 'px)';
        ind.style.height = a.offsetHeight + 'px';
        links.forEach(l => l.classList.toggle('on', l === a));
        if (!animate) requestAnimationFrame(() => ind.classList.remove('no-anim'));
      };
      const current = () => links.find(l => l.classList.contains('active')) || links[0];
      // rest on the current page's item (no slide on first paint)
      place(current(), false);
      // re-measure when the drawer opens (layout/fonts settled)
      burger.addEventListener('click', () => {
        if (drawer.classList.contains('open')) requestAnimationFrame(() => place(current(), false));
      });
      // slide to the tapped item before navigating
      links.forEach(a => {
        a.addEventListener('pointerdown', () => place(a, true));
        a.addEventListener('focus', () => place(a, true));
      });
    }
  }

  // scroll-reveal (+ optional staggered children for .rv-stagger groups)
  const rvEls = document.querySelectorAll('.rv, .rv-stagger');
  if (rvEls.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    rvEls.forEach(el => {
      if (el.classList.contains('rv-stagger')) {
        Array.from(el.children).forEach((c, i) => c.style.setProperty('--i', i));
      }
      io.observe(el);
    });
  }

  // auto-rotating carousels ([data-carousel] with .slide children)
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    const interval = parseInt(carousel.dataset.interval, 10) || 3000;
    let idx = slides.findIndex(s => s.classList.contains('active'));
    if (idx < 0) { idx = 0; slides[0].classList.add('active'); }
    let timer;
    const tick = () => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    };
    const start = () => { stop(); timer = setInterval(tick, interval); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    start();
    // Pause on hover for desktop, resume on leave
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    // Pause when tab is hidden (saves CPU)
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
  });

  // image loading shimmer — a placeholder that covers each image while it loads,
  // then fades out. Non-destructive: the image is never hidden, so if this never
  // runs the images still show normally.
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    var c = img.parentElement;
    if (!c || (img.complete && img.naturalWidth > 0)) return; // already loaded → no shimmer
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    c.classList.add('nx-loading');
    // on larger image areas, add the NX signal badge (mark in a circle broadcasting rings)
    var badge = null, r = c.getBoundingClientRect();
    if (r.width >= 200 && r.height >= 140) {
      badge = document.createElement('span');
      badge.className = 'nx-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = '<span class="nx-badge-ring"></span><span class="nx-badge-ring r2"></span><span class="nx-badge-core"><img src="/assets/images/favicon.png" alt=""></span>';
      c.appendChild(badge);
    }
    var done = function () {
      c.classList.add('nx-ready');
      setTimeout(function () {
        c.classList.remove('nx-loading', 'nx-ready');
        if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
        if (c.style.position === 'relative') c.style.position = '';
      }, 580);
    };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  // homepage work carousel — auto-advance every 3s + scroll-progress indicator
  const workCar = document.querySelector('#work .work');
  if (workCar && workCar.children.length > 1) {
    const wt = document.querySelector('#work .work-track i');
    const wcards = Array.from(workCar.children);
    let wPaused = false, wIdx = 0;
    const wPause = () => { wPaused = true; };
    const wResume = () => { wPaused = false; };
    workCar.addEventListener('pointerenter', wPause);
    workCar.addEventListener('pointerleave', wResume);
    workCar.addEventListener('pointerdown', wPause);
    workCar.addEventListener('touchstart', wPause, { passive: true });
    const wTrack = () => {
      if (!wt) return;
      const max = workCar.scrollWidth - workCar.clientWidth;
      const p = max > 0 ? Math.min(1, Math.abs(workCar.scrollLeft) / max) : 0;
      wt.style.width = (22 + p * 78) + '%';
    };
    workCar.addEventListener('scroll', wTrack, { passive: true });
    wTrack();
    const rtl = getComputedStyle(workCar).direction === 'rtl';
    setInterval(() => {
      if (wPaused || document.hidden) return;
      wIdx = (wIdx + 1) % wcards.length;
      const cR = workCar.getBoundingClientRect(), tR = wcards[wIdx].getBoundingClientRect();
      // align the card to the container's inline-start edge (RTL uses the right edge);
      // scrollBy on the element scrolls the carousel only, never the page
      const d = rtl ? (tR.right - cR.right) : (tR.left - cR.left);
      workCar.scrollBy({ left: d, behavior: 'smooth' });
    }, 3000);
  }

  // FAQ accordion
  document.querySelectorAll('.faq .q').forEach(q => {
    const a = q.querySelector('.a');
    if (!a) return;
    q.addEventListener('click', () => {
      const isOpen = q.classList.contains('open');
      document.querySelectorAll('.faq .q').forEach(o => {
        o.classList.remove('open');
        const ans = o.querySelector('.a');
        if (ans) ans.style.maxHeight = null;
      });
      if (!isOpen) {
        q.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // animated count-up for stat numbers (band + page-hero stats + project stats)
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const numEls = document.querySelectorAll('.band .m b, .phero-stats .s b, .project-stats .ps b, .hero-trust .t b, .dash-kpi b, .dvc-gauge .gtx b, .dvc-port b, .stak-stamp b, .erpw-kpi b, .wk-result b');
  if (numEls.length && !reduceMotion) {
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const runCount = (el) => {
      // find the text node that carries the digits (keeps any unit <span>)
      let node = null;
      el.childNodes.forEach(n => { if (n.nodeType === 3 && /\d/.test(n.nodeValue)) node = n; });
      if (!node) return;
      const m = node.nodeValue.match(/^(\D*)([\d,]+(?:\.\d+)?)(\D*)$/);
      if (!m) return;
      const pre = m[1], raw = m[2].replace(/,/g, ''), suf = m[3];
      const target = parseFloat(raw);
      const decimals = (raw.split('.')[1] || '').length;
      const dur = 1400, t0 = performance.now();
      const fmt = v => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US'));
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        node.nodeValue = pre + fmt(target * easeOut(p)) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); }
    }), { threshold: 0.5 });
    numEls.forEach(el => io.observe(el));
  }

  // work-card "quick look" video stories
  const storyBtns = document.querySelectorAll('.story');
  if (storyBtns.length) {
    const ov = document.createElement('div');
    ov.className = 'story-overlay';
    ov.innerHTML =
      '<div class="story-player">' +
        '<div class="story-bar"><i></i></div>' +
        '<button class="story-x" type="button" aria-label="Close">&times;</button>' +
        '<video class="story-vid" playsinline preload="metadata"></video>' +
        '<div class="story-title"></div>' +
      '</div>';
    document.body.appendChild(ov);
    const player = ov.querySelector('.story-player');
    const bar = ov.querySelector('.story-bar');
    const vid = ov.querySelector('.story-vid');
    const titleEl = ov.querySelector('.story-title');
    const rich = document.createElement('div'); rich.className = 'story-rich';
    player.appendChild(rich);
    let autoT, richT;
    const DUR = 10000;
    const isAR = (document.documentElement.lang || '').indexOf('ar') === 0;
    const lang = isAR ? 'ar' : 'en';
    const close = () => {
      ov.classList.remove('open');
      document.body.classList.remove('story-open');
      clearTimeout(autoT); clearInterval(richT);
      try { vid.pause(); } catch (e) {}
      bar.classList.remove('run');
      player.classList.remove('rich'); rich.innerHTML = '';
    };
    // rich in-page "story": a project's animated screen + a 2-column spec sheet
    const PROJECTS = {
      ibp: {
        prefix: 'ibp', shots: ['dashboard','clients','requests','claims'], url: 'ibp.payone.one',
        visitUrl: 'https://ibp.payone.one/', isLive: true,
        ar: { title: 'IBP · منصة وساطة التأمين', live: 'مباشر', head: 'كل مواصفات المنصة',
          groups: [
            ['الوحدات', ['العملاء','الإنتاج','الاكتتاب','الوثائق','المطالبات','العمولات','المالية','الامتثال','خدمة العملاء','التقارير']],
            ['تكامل حكومي', ['نفاذ','واثق','يقين','زاتكا','العنوان الوطني']],
            ['الأمان والامتثال', ['PDPL','NCA','AML/CFT','عزل تام','داخل المملكة']],
            ['النموذج', ['سحابي متعدد الاشتراكات','تملّك كأصل رقمي']]
          ], visit: 'زيارة ومشاهدة المشروع', full: 'دراسة الحالة الكاملة', start: 'ابدأ مشروعاً مماثلاً', casePath: '/ar/work/ibp/' },
        en: { title: 'IBP · Insurance Broker Platform', live: 'Live', head: 'Everything the platform does',
          groups: [
            ['Modules', ['Clients','Production','Underwriting','Policies','Claims','Commissions','Finance','Compliance','Service','Reports']],
            ['Government', ['Nafath','Wathiq','Yaqeen','ZATCA','National Address']],
            ['Security', ['PDPL','NCA','AML/CFT','Tenant isolation','In-Kingdom']],
            ['Model', ['Cloud, multi-subscription','Own it as an asset']]
          ], visit: 'Visit & explore the project', full: 'Full case study', start: 'Start a similar project', casePath: '/en/work/ibp/' }
      },
      nqlah: {
        prefix: 'nqlah', shots: ['fleet','tracking','escrow','wallet'], url: 'nqlah.nx.sa',
        visitUrl: null, isLive: false,
        ar: { title: 'نقلة · منصة اللوجستيات', live: 'نقلة', head: 'كل ما تقدّمه المنصة',
          groups: [
            ['الوحدات', ['الأسطول','السائقون','الطلبات','التتبّع','Escrow','المحافظ','العمولات','النزاعات','الترويج','التقارير']],
            ['الأدوار', ['ناقل','عميل','سائق','إدارة']],
            ['الدفع والامتثال', ['Escrow','فواتير زاتكا','هيئة النقل','سجل تدقيق','داخل المملكة']],
            ['النموذج', ['منصة سوق','عمولة على كل معاملة']]
          ], visit: '', full: 'دراسة الحالة الكاملة', start: 'ابدأ مشروعاً مماثلاً', casePath: '/ar/work/nqlah/' },
        en: { title: 'Nqlah · Logistics platform', live: 'Nqlah', head: 'Everything the platform does',
          groups: [
            ['Modules', ['Fleet','Drivers','Orders','Tracking','Escrow','Wallets','Commissions','Disputes','Promotions','Reports']],
            ['Roles', ['Carrier','Client','Driver','Admin']],
            ['Payment & compliance', ['Escrow','ZATCA invoices','TGA','Audit trail','In-Kingdom']],
            ['Model', ['Marketplace','Commission per transaction']]
          ], visit: '', full: 'Full case study', start: 'Start a similar project', casePath: '/en/work/nqlah/' }
      },
      nxhealth: {
        prefix: 'health', shots: ['command','dashboard','patient','telemed'], url: 'NX Health',
        visitUrl: null, isLive: false,
        ar: { title: 'NX Health · نظام العيادات', live: 'NX Health', head: 'كل ما يقدّمه النظام',
          groups: [
            ['الوحدات', ['المواعيد','الملف الطبي','الطب الاتصالي','الصيدلية','المختبر','الأشعة','الفواتير','الفروع']],
            ['المنصّات', ['ويب','تطبيق مريض','مركز قيادة']],
            ['الامتثال', ['نفيس NPHIES','وزارة الصحة','CBAHI','PDPL/NCA','داخل المملكة']],
            ['النموذج', ['متعدد الفروع','متعدد التخصصات']]
          ], visit: '', full: 'دراسة الحالة الكاملة', start: 'ابدأ مشروعاً مماثلاً', casePath: '/ar/work/nx-health/' },
        en: { title: 'NX Health · Clinic system', live: 'NX Health', head: 'Everything the system does',
          groups: [
            ['Modules', ['Appointments','Records','Telemedicine','Pharmacy','Lab','Radiology','Billing','Branches']],
            ['Platforms', ['Web','Patient app','Command center']],
            ['Compliance', ['NPHIES','Ministry of Health','CBAHI','PDPL/NCA','In-Kingdom']],
            ['Model', ['Multi-branch','Multi-specialty']]
          ], visit: '', full: 'Full case study', start: 'Start a similar project', casePath: '/en/work/nx-health/' }
      },
      nxlogistic: {
        prefix: 'lam', shots: ['dashboard','tracking','orgchart','billing'], url: 'lam.nx.sa',
        visitUrl: null, isLive: false,
        ar: { title: 'NX Logistic · إدارة الأساطيل', live: 'lam.nx.sa', head: 'كل ما تقدّمه المنصة',
          groups: [
            ['الأصول', ['السجل','الاقتناء','العُهدة','الاستبعاد']],
            ['العمليات', ['الصيانة','العقود والتأجير','السائقون','الامتثال']],
            ['التتبّع', ['خريطة مباشرة','سياجات','أجهزة','تنبيهات']],
            ['المنصّة', ['اشتراك سحابي','متعدد المستأجرين','TGA','PDPL']]
          ], visit: '', full: 'دراسة الحالة الكاملة', start: 'ابدأ مشروعاً مماثلاً', casePath: '/ar/work/nx-logistic/' },
        en: { title: 'NX Logistic · Fleet ops', live: 'lam.nx.sa', head: 'Everything the platform does',
          groups: [
            ['Assets', ['Registry','Acquisition','Custody','Disposal']],
            ['Operations', ['Maintenance','Contracts & rental','Drivers','Compliance']],
            ['Tracking', ['Live map','Geofences','Devices','Alerts']],
            ['Platform', ['Seat-based SaaS','Multi-tenant','TGA','PDPL']]
          ], visit: '', full: 'Full case study', start: 'Start a similar project', casePath: '/en/work/nx-logistic/' }
      },
      iwork: {
        prefix: 'iwork', shots: ['overview','agent','landing','platform'], url: 'bznss.one',
        visitUrl: null, isLive: false,
        ar: { title: 'iWork · موظفو ذكاء', live: 'bznss.one', head: 'كل ما تقدّمه المنصة',
          groups: [
            ['الفريق', ['وكلاء ذكاء','أقسام','مهارات','معرفة']],
            ['التشغيل', ['CRM','حجوزات','طلبات','متجر']],
            ['القنوات', ['واتساب','تيليجرام','موقعك']],
            ['الحوكمة', ['موافقات','صلاحيات','سقف توكنز','PDPL']]
          ], visit: '', full: 'دراسة الحالة الكاملة', start: 'ابدأ مشروعاً مماثلاً', casePath: '/ar/work/iwork/' },
        en: { title: 'iWork · AI workforce', live: 'bznss.one', head: 'Everything the platform does',
          groups: [
            ['Team', ['AI agents','Departments','Skills','Knowledge']],
            ['Operations', ['CRM','Bookings','Orders','Store']],
            ['Channels', ['WhatsApp','Telegram','Your site']],
            ['Governance', ['Approvals','Permissions','Token caps','PDPL']]
          ], visit: '', full: 'Full case study', start: 'Start a similar project', casePath: '/en/work/iwork/' }
      }
    };
    const openRich = (proj) => {
      const T = proj[lang];
      const slides = proj.shots.map((s, i) => '<div class="slide' + (i === 0 ? ' active' : '') + '"><img src="/assets/images/projects/' + proj.prefix + '-' + s + '-' + lang + '.png?v=92" alt="' + s + '" loading="lazy"></div>').join('');
      const groups = T.groups.map(g => '<div class="stg"><b>' + g[0] + '</b><div class="stg-chips">' + g[1].map(x => '<span>' + x + '</span>').join('') + '</div></div>').join('');
      const cta = proj.visitUrl
        ? '<a class="btn btn-primary" href="' + proj.visitUrl + '" target="_blank" rel="noopener">' + T.visit + '</a><a class="btn btn-ghost" href="' + T.casePath + '">' + T.full + '</a>'
        : '<a class="btn btn-primary" href="' + T.casePath + '">' + T.full + '</a><a class="btn btn-ghost" href="/' + lang + '/#contact">' + T.start + '</a>';
      rich.innerHTML =
        '<div class="st-screen"><div class="st-bar"><i></i><i></i><i></i><span class="st-live">' + (proj.isLive ? '<b></b>' : '') + T.live + '</span><span class="st-url">' + proj.url + '</span></div>' +
          '<div class="st-shot"><div class="carousel">' + slides + '</div></div></div>' +
        '<div class="st-body"><div class="st-h">' + T.title + '</div><div class="st-sub">' + T.head + '</div>' +
          '<div class="st-grid">' + groups + '</div>' +
          '<div class="st-cta">' + cta + '</div></div>';
      player.classList.add('rich');
      ov.classList.add('open'); document.body.classList.add('story-open');
      const sl = rich.querySelectorAll('.carousel .slide'); let ci = 0;
      clearInterval(richT);
      richT = setInterval(() => { sl[ci].classList.remove('active'); ci = (ci + 1) % sl.length; sl[ci].classList.add('active'); }, 2400);
    };
    const open = (btn) => {
      if (PROJECTS[btn.dataset.story]) { player.scrollTop = 0; return openRich(PROJECTS[btn.dataset.story]); }
      const src = btn.dataset.video, poster = btn.dataset.poster || '';
      player.style.backgroundImage = poster ? "url('" + poster + "')" : 'none';
      titleEl.textContent = btn.dataset.title || '';
      vid.src = src || '';
      vid.currentTime = 0;
      ov.classList.add('open');
      document.body.classList.add('story-open');
      // reset + run the 10s progress bar (reflow-based, not rAF, so it
      // works even when the tab was backgrounded)
      bar.classList.remove('run');
      void bar.offsetWidth;
      bar.classList.add('run');
      if (src) { vid.play().catch(() => {}); }
      clearTimeout(autoT);
      autoT = setTimeout(close, DUR);          // auto-close at 10s
    };
    storyBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(b); }));
    ov.querySelector('.story-x').addEventListener('click', close);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    vid.addEventListener('ended', close);
    addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
  }

  // pointer-tilt parallax ([data-tilt] wrapper, e.g. fintech app showcase)
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const stage = el.closest('.fx-stage') || el.parentElement;
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg)';
      });
      stage.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // work project switcher ([data-wks]: selectable list + cross-fading stage + auto)
  document.querySelectorAll('[data-wks]').forEach(w => {
    const tabs   = Array.from(w.querySelectorAll('.wks-tab'));
    const shots  = Array.from(w.querySelectorAll('.wks-shot'));
    const panels = Array.from(w.querySelectorAll('.wks-panel'));
    const urlEl  = w.querySelector('.wks-topbar .u');
    const n = tabs.length;
    if (!n) return;
    let active = 0, timer = null;
    const DUR = 5000;
    const show = (k) => {
      active = k;
      tabs.forEach((t, i) => t.classList.toggle('on', i === k));
      shots.forEach((s, i) => s.classList.toggle('on', i === k));
      panels.forEach((p, i) => p.classList.toggle('on', i === k));
      if (urlEl && tabs[k].dataset.url) urlEl.textContent = tabs[k].dataset.url;
      const pb = w.querySelector('.wks-play'); if (pb) { pb.dataset.video = tabs[k].dataset.video; pb.dataset.poster = tabs[k].dataset.poster; pb.dataset.title = tabs[k].dataset.title; }
      w.classList.remove('play'); void w.offsetWidth; w.classList.add('play');
    };
    const run = () => { stop(); timer = setInterval(() => show((active + 1) % n), DUR); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { show(i); run(); });
      t.addEventListener('mouseenter', () => { stop(); show(i); });
    });
    w.addEventListener('mouseleave', run);
    // swipe the stage on touch
    const stage = w.querySelector('.wks-stage');
    let sx = 0, sw = false;
    stage.addEventListener('pointerdown', e => { sw = true; sx = e.clientX; });
    stage.addEventListener('pointerup', e => {
      if (!sw) return; sw = false;
      const dx = e.clientX - sx;
      if (dx < -45) { show((active + 1) % n); run(); }
      else if (dx > 45) { show((active - 1 + n) % n); run(); }
    });
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : run(); });
    show(0); run();
  });

  // work cards: sector filter + expand-story toggle
  const wkGrid = document.querySelector('.wk-grid');
  if (wkGrid) {
    const cards = Array.from(wkGrid.querySelectorAll('.wk-card'));
    document.querySelectorAll('.wk-fbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.wkfilter;
        document.querySelectorAll('.wk-fbtn').forEach(b => b.classList.toggle('on', b === btn));
        wkGrid.classList.toggle('flat', f !== 'all');
        cards.forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.filter !== f));
      });
    });
    wkGrid.querySelectorAll('.wk-flip').forEach(b => b.addEventListener('click', e => {
      e.preventDefault(); b.closest('.wk-card').classList.add('open');
    }));
    wkGrid.querySelectorAll('.wk-close').forEach(b => b.addEventListener('click', () => b.closest('.wk-card').classList.remove('open')));
  }

  // swipeable card deck ([data-deck]: stacked cards + drag/swipe + auto + dots)
  document.querySelectorAll('[data-deck]').forEach(deck => {
    const cards = Array.from(deck.querySelectorAll('.deck-card'));
    const dots  = Array.from(deck.querySelectorAll('.deck-dots i'));
    const prog  = deck.querySelector('.deck-prog i');
    const n = cards.length;
    if (n < 2) return;
    const DELAY = parseInt(deck.dataset.deck, 10) || 4000;
    let active = 0, dx = 0, drag = false, sx = 0, timer = null;
    const render = () => {
      cards.forEach((c, i) => {
        const off = (i - active + n) % n;
        let x = 0, y = 0, sc = 1, op = 1, z = n - off, rot = 0;
        if (off === 0) { x = dx; rot = dx * 0.025; }
        else if (off === 1) { y = 16; sc = .93; op = .55; }
        else if (off === 2) { y = 30; sc = .86; op = .28; }
        else { y = 40; sc = .82; op = 0; }
        c.style.zIndex = z;
        c.style.opacity = op;
        c.style.transform = `translate(${x}px,${y}px) scale(${sc}) rotate(${rot}deg)`;
      });
      dots.forEach((d, i) => d.classList.toggle('on', i === active));
    };
    const bar = (play) => { if (!prog) return; prog.style.animation = 'none'; void prog.offsetWidth;
      if (play) prog.style.animation = 'deckProg ' + DELAY + 'ms linear'; };
    const go = (k) => { active = (k + n) % n; dx = 0; render(); bar(true); };
    const run = () => { stop(); bar(true); timer = setInterval(() => go(active + 1), DELAY); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } if (prog) prog.style.animationPlayState = 'paused'; };
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); run(); }));
    const front = () => cards[active];
    deck.addEventListener('pointerdown', e => {
      drag = true; sx = e.clientX; dx = 0; stop();
      front().classList.add('dragging');
    });
    addEventListener('pointermove', e => { if (drag) { dx = e.clientX - sx; render(); } });
    addEventListener('pointerup', () => {
      if (!drag) return;
      drag = false; front().classList.remove('dragging');
      if (dx < -55) go(active + 1);
      else if (dx > 55) go(active - 1);
      else { dx = 0; render(); }
      run();
    });
    deck.addEventListener('mouseenter', stop);
    deck.addEventListener('mouseleave', run);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : run(); });
    render(); run();
  });

  // generic auto-cycler ([data-cycle]: cross-fade .cyc-frame + highlight .cyc-tab)
  document.querySelectorAll('[data-cycle]').forEach(c => {
    const frames = Array.from(c.querySelectorAll('.cyc-frame'));
    const tabs   = Array.from(c.querySelectorAll('.cyc-tab'));
    if (frames.length < 2) return;
    let i = 0, t = null;
    const D = parseInt(c.dataset.cycle, 10) || 3000;
    const show = (k) => {
      i = k;
      frames.forEach((f, x) => f.classList.toggle('on', x === k));
      tabs.forEach((f, x) => f.classList.toggle('on', x === k));
    };
    const run = () => { stop(); t = setInterval(() => show((i + 1) % frames.length), D); };
    const stop = () => { if (t) { clearInterval(t); t = null; } };
    tabs.forEach((tb, k) => tb.addEventListener('click', () => { show(k); run(); }));
    c.addEventListener('mouseenter', stop);
    c.addEventListener('mouseleave', run);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : run(); });
    show(0); run();
  });

  // stepped-story hero (auto-cycling visual + caption + dots)
  document.querySelectorAll('[data-story]').forEach(story => {
    const frames = Array.from(story.querySelectorAll('.hs-frame'));
    const steps  = Array.from(story.querySelectorAll('.hs-step'));
    const dots   = Array.from(story.querySelectorAll('.hs-dots i'));
    if (frames.length < 2) return;
    let idx = 0, timer = null;
    const DELAY = parseInt(story.dataset.story, 10) || 3200;
    const show = (i) => {
      idx = i;
      frames.forEach((f, k) => f.classList.toggle('active', k === i));
      steps.forEach((s, k) => s.classList.toggle('active', k === i));
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
    };
    const run = () => { stop(); timer = setInterval(() => show((idx + 1) % frames.length), DELAY); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); run(); }));
    story.addEventListener('mouseenter', stop);
    story.addEventListener('mouseleave', run);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : run(); });
    show(0); run();
  });

  // hero NX-cloud network: auto-cycle the active cell + tap/hover focus
  const viz = document.querySelector('.netviz');
  if (viz) {
    const cells  = Array.from(viz.querySelectorAll('.hexcell'));
    const links  = Array.from(viz.querySelectorAll('.nv-links > path'));
    const labels = Array.from(viz.querySelectorAll('.nv-lab'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (cells.length) {
      let idx = 0, timer = null, resumeT = null;
      const activate = (i) => {
        idx = i;
        cells.forEach((c, k) => c.classList.toggle('active', k === i));
        links.forEach((l, k) => l.classList.toggle('glow', k === i));
        labels.forEach((l, k) => l.classList.toggle('on', k === i));
        viz.classList.add('focusing');
      };
      const run = () => { if (timer) clearInterval(timer); timer = setInterval(() => activate((idx + 1) % cells.length), 2800); };
      const pause = () => {
        if (timer) { clearInterval(timer); timer = null; }
        clearTimeout(resumeT);
        if (!reduce) resumeT = setTimeout(() => { run(); activate((idx + 1) % cells.length); }, 6000);
      };
      cells.forEach((c, i) => {
        c.addEventListener('pointerenter', () => { pause(); activate(i); });
        c.addEventListener('click', () => {
          pause(); activate(i);
          if (c.dataset.cta === 'contact') {
            const t = document.querySelector('#contact');
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
      if (!reduce) { activate(0); run(); document.addEventListener('visibilitychange', () => { document.hidden ? (timer && clearInterval(timer), timer = null) : run(); }); }

      // live "operations now" counter
      const live = viz.querySelector('[data-count]');
      if (live) {
        let n = parseInt(live.textContent.replace(/\D/g, ''), 10) || 128540;
        setInterval(() => { n += 3 + Math.floor(Math.random() * 9); live.textContent = n.toLocaleString('en-US'); }, 1700);
      }
    }
  }

  // ---------- Affiliate / NX Partners landing (scoped to .p-affiliate) ----------
  if (document.body.classList.contains('p-affiliate')) {
    const ar = document.documentElement.lang === 'ar';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = n => Math.round(n).toLocaleString('en-US');

    // toast helper
    let toastEl;
    const toast = msg => {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'aff-toast';
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastEl._t);
      toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
    };

    // hero earnings count-up (illustrative preview, animates once on view)
    const earn = document.querySelector('[data-aff-earn]');
    if (earn) {
      const target = parseInt(earn.dataset.affEarn, 10) || 12480;
      let done = false;
      const runCount = () => {
        if (done) return;
        done = true;
        if (reduce) { earn.textContent = fmt(target); return; }
        const start = performance.now(), dur = 1400;
        const tick = now => {
          const p = Math.min(1, (now - start) / dur);
          earn.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      const maybe = () => {
        if (done) return;
        const r = earn.getBoundingClientRect();
        if (r.top < innerHeight * 0.92 && r.bottom > 0) { runCount(); window.removeEventListener('scroll', maybe); }
      };
      maybe();
      window.addEventListener('scroll', maybe, { passive: true });
    }

    // ---------- creative motion ----------
    const onView = (el, cb) => {
      if (!el) return; let done = false;
      const chk = () => { if (done) return; const r = el.getBoundingClientRect(); if (r.top < innerHeight * 0.9 && r.bottom > 0) { done = true; cb(); window.removeEventListener('scroll', chk); } };
      chk(); window.addEventListener('scroll', chk, { passive: true });
    };
    const tweenNum = (el, to, dur, dp, suffix) => {
      suffix = suffix || '';
      if (reduce) { el.textContent = (dp ? to.toFixed(dp) : fmt(to)) + suffix; return; }
      const s = performance.now();
      const step = now => {
        const p = Math.min(1, (now - s) / dur), v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = (dp ? v.toFixed(dp) : fmt(v)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // sparkline bars grow from zero when the hero scrolls in
    const spark = document.querySelector('.aff-spark');
    if (spark && !reduce) {
      const bars = [].slice.call(spark.querySelectorAll('i')), hs = bars.map(b => b.style.height);
      bars.forEach(b => b.style.height = '0%');
      onView(spark, () => bars.forEach((b, i) => setTimeout(() => { b.style.height = hs[i] || '0%'; }, 80 * i)));
    }

    // hero mini-stats count up on view
    document.querySelectorAll('.aff-mini .c b').forEach(el => {
      const raw = el.textContent.trim(), pct = raw.indexOf('%') >= 0, num = parseFloat(raw.replace(/[^\d.]/g, ''));
      if (isNaN(num)) return;
      onView(el, () => tweenNum(el, num, 1300, pct ? 1 : 0, pct ? '%' : ''));
    });

    // live "activity" feed inside the (clearly-labelled) preview dashboard
    const dash = document.querySelector('.aff-dash'), spk = dash && dash.querySelector('.aff-spark');
    if (dash && spk && !reduce) {
      const feed = document.createElement('div');
      feed.className = 'aff-feed';
      feed.innerHTML = '<span class="pi"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span><span class="ev"></span><span class="amt"></span>';
      spk.insertAdjacentElement('afterend', feed);
      const ev = feed.querySelector('.ev'), am = feed.querySelector('.amt');
      const events = ar ? [
        ['تحويل جديد • NX Grow', '+﷼3,600'],
        ['عميل عبر كود KHALID10 • NX Launch', '+﷼1,800'],
        ['تحويل جديد • التقنية المالية', '+﷼5,200'],
        ['نقرة جديدة على رابطك', '•']
      ] : [
        ['New conversion • NX Grow', '+SAR 3,600'],
        ['Client via KHALID10 • NX Launch', '+SAR 1,800'],
        ['New conversion • FinTech', '+SAR 5,200'],
        ['New click on your link', '•']
      ];
      let i = 0;
      const swap = () => {
        feed.classList.remove('show');
        setTimeout(() => { ev.textContent = events[i][0]; am.textContent = events[i][1]; feed.classList.add('show'); i = (i + 1) % events.length; }, 320);
      };
      setTimeout(swap, 900); setInterval(swap, 3900);
    }

    // subtle 3D tilt on the hero dashboard (desktop, motion-safe)
    if (dash && !reduce && matchMedia('(pointer:fine)').matches) {
      const host = dash.parentElement;
      host.addEventListener('mousemove', e => {
        const r = dash.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        dash.style.transform = 'perspective(1000px) rotateY(' + (x * 5).toFixed(2) + 'deg) rotateX(' + (-y * 5).toFixed(2) + 'deg)';
      });
      host.addEventListener('mouseleave', () => { dash.style.transform = ''; });
    }

    // mouse-follow spotlight on value cards
    document.querySelectorAll('.aff-card').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // sequential step-number pop
    const flow = document.querySelector('.aff-flow');
    if (flow) onView(flow, () => flow.classList.add('run'));

    // copy referral link
    document.querySelectorAll('[data-aff-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const txt = btn.dataset.affCopy || '';
        const ok = () => toast(ar ? 'تم نسخ الرابط' : 'Link copied');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(ok).catch(ok);
        } else ok();
      });
    });

    // earnings calculator
    const calc = document.querySelector('[data-aff-calc]');
    if (calc) {
      const refs = calc.querySelector('[data-refs]');
      const deal = calc.querySelector('[data-deal]');
      const rate = calc.querySelector('[data-rate]');
      const refsV = calc.querySelector('[data-refs-v]');
      const dealV = calc.querySelector('[data-deal-v]');
      const rateV = calc.querySelector('[data-rate-v]');
      const outM = calc.querySelector('[data-out-m]');
      const outY = calc.querySelector('[data-out-y]');
      const rvEl = outM.closest('.rv');
      const upd = () => {
        const r = +refs.value, d = +deal.value, p = +rate.value;
        refsV.textContent = ar ? (r === 1 ? 'عميل واحد' : r + ' عملاء') : r + (r === 1 ? ' client' : ' clients');
        dealV.textContent = fmt(d) + (ar ? ' ﷼' : ' SAR');
        rateV.textContent = p + '%';
        const monthly = r * d * (p / 100);
        outM.textContent = fmt(monthly);
        outY.textContent = fmt(monthly * 12);
        if (rvEl) { rvEl.classList.remove('bump'); void rvEl.offsetWidth; rvEl.classList.add('bump'); }
      };
      [refs, deal, rate].forEach(el => el && el.addEventListener('input', upd));
      upd();
      // count the result up from zero the first time it scrolls into view
      if (!reduce) onView(calc, () => {
        const r = +refs.value, d = +deal.value, p = +rate.value, monthly = r * d * (p / 100);
        tweenNum(outM, monthly, 1100); tweenNum(outY, monthly * 12, 1100);
      });
    }

    // portal tabs
    const tabs = document.querySelectorAll('[data-aff-tab]');
    const panels = document.querySelectorAll('[data-aff-panel]');
    const showTab = key => {
      tabs.forEach(t => t.classList.toggle('on', t.dataset.affTab === key));
      panels.forEach(p => p.classList.toggle('on', p.dataset.affPanel === key));
    };
    tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.affTab)));
    document.querySelectorAll('[data-aff-goto]').forEach(el => {
      el.addEventListener('click', e => {
        const key = el.dataset.affGoto;
        if (key) { showTab(key); }
        const portal = document.querySelector('#portal');
        if (portal && !el.getAttribute('href')) { e.preventDefault(); portal.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });

    // ----- registration → Zoho Web-to-Lead (real capture, iframe POST) -----
    const ZOHO_ENDPOINT = 'https://crm.zoho.sa/crm/WebToLeadForm';
    const ZOHO_HIDDEN = {
      xnQsjsdp: '36f4791acdeae3763cabf4060054bc5d64a461f3c2070ca9b0e586363277411f',
      xmIwtLD: '57f9abfce5eb0339c8cb29cab7256fd07c9617d7bb7efc2911992a699b5ea084eae79b8c12ee8b80f7f5a7bce75ec1c4',
      actionType: 'TGVhZHM=', returnURL: 'null', zc_gad: '', 'aG9uZXlwb3Q': ''
    };
    const zohoPost = data => new Promise(resolve => {
      const frameName = 'aff-frame-' + Math.random().toString(36).slice(2);
      const iframe = document.createElement('iframe');
      iframe.name = frameName;
      iframe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;border:0';
      document.body.appendChild(iframe);
      const form = document.createElement('form');
      form.action = ZOHO_ENDPOINT; form.method = 'POST'; form.target = frameName;
      form.acceptCharset = 'UTF-8'; form.style.display = 'none';
      const add = (n, v) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v == null ? '' : String(v); form.appendChild(i); };
      Object.entries(ZOHO_HIDDEN).forEach(([k, v]) => add(k, v));
      Object.entries(data).forEach(([k, v]) => { if (v != null && v !== '') add(k, v); });
      document.body.appendChild(form);
      let resolved = false;
      const fin = () => { if (resolved) return; resolved = true; setTimeout(() => { form.remove(); iframe.remove(); }, 1500); resolve(true); };
      iframe.addEventListener('load', fin, { once: true });
      setTimeout(fin, 5000);
      form.submit();
    });

    const regForm = document.querySelector('[data-aff-register]');
    if (regForm) {
      regForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = regForm.querySelector('button[type=submit]');
        const msg = regForm.querySelector('[data-aff-msg]');
        const g = n => (regForm.querySelector('[name=' + n + ']') || {}).value || '';
        if (btn) { btn.disabled = true; btn.dataset.orig = btn.textContent; btn.textContent = ar ? 'جارٍ الإرسال…' : 'Sending…'; }
        const note = '[NX Partners / برنامج التسويق بالعمولة]'
          + ' | Channel: ' + g('channel')
          + ' | Audience: ' + g('audience')
          + ' | Note: ' + g('note');
        await zohoPost({
          'Last Name': g('name') || 'Affiliate applicant',
          'Email': g('email'),
          'Phone': g('phone'),
          'Company': g('company'),
          'LEADCF11': note,
          'LEADCF1': location.pathname,
          'LEADCF6': ar ? 'ar' : 'en'
        });
        regForm.reset();
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.orig; }
        if (msg) {
          msg.className = 'aff-msg ok';
          msg.textContent = ar
            ? 'تم استلام طلبك بنجاح. سيتواصل معك فريق الشراكات، وسنُفعّل حسابك ونُشعرك فور جاهزية بوابة الشركاء.'
            : 'Your application was received. Our partnerships team will reach out, and we’ll activate your account and notify you once the partner portal is ready.';
          msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // login (portal not live yet — honest placeholder)
    const loginForm = document.querySelector('[data-aff-login]');
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const msg = loginForm.querySelector('[data-aff-msg]');
        if (msg) {
          msg.className = 'aff-msg info';
          msg.textContent = ar
            ? 'بوابة الشركاء قيد الإطلاق. أنشئ حساباً الآن وسنُشعرك فور تفعيله.'
            : 'The partner portal is launching soon. Create an account now and we’ll notify you the moment it goes live.';
        }
      });
    }
  }
})();
