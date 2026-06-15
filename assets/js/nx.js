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
  }

  // scroll-reveal
  const rvEls = document.querySelectorAll('.rv');
  if (rvEls.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    rvEls.forEach(el => io.observe(el));
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
})();
