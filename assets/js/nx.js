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
    let autoT;
    const DUR = 10000;
    const close = () => {
      ov.classList.remove('open');
      document.body.classList.remove('story-open');
      clearTimeout(autoT);
      try { vid.pause(); } catch (e) {}
      bar.classList.remove('run');
    };
    const open = (btn) => {
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
    const go = (k) => { active = (k + n) % n; dx = 0; render(); };
    const run = () => { stop(); timer = setInterval(() => go(active + 1), DELAY); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
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
})();
