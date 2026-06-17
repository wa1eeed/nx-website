/* NX Solutions — shared client script
   Wired by every /en and /ar page. Page-specific scripts (3D parallax,
   meter fills, filter chips) stay inline in their owning page. */

(function () {
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

  // scroll-reveal
  const rvEls = document.querySelectorAll('.rv');
  if (rvEls.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    rvEls.forEach(el => io.observe(el));
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
