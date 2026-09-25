/* ============================================================
   NX Commerce Infrastructure — the animation engine.

   The point of the motion on these pages is explanation, not polish:
   a deal moves through five stations in order, and the money that
   arrives at the end visibly splits between the people owed it. So
   each block plays once, when it is actually on screen, in the order
   the story happens — and every number it shows counts up to a value
   written in the markup, never invented here.

   Nothing runs for a visitor who asked for reduced motion: they get
   the finished state immediately, which is the same information.
   ============================================================ */
(function () {
  'use strict';
  var blocks = document.querySelectorAll('.cx-anim');
  if (!blocks.length) return;

  // Only now does the CSS get permission to hide anything. Without this class —
  // JS blocked, script failed to load, an old browser — every section renders at
  // its finished state instead of an empty page, because the copy is the point
  // and the motion is only how it arrives.
  document.documentElement.classList.add('cx-ready');

  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Western digits on both languages on purpose. The figures transcribed into
  // the markup beside these counters — 12,300 ر.س, 1,000 ر.س — are written that
  // way, and an animated ٨٬٤٥٠ sitting next to a static 12,300 in the same card
  // reads as a rendering fault rather than a style.
  // Some splits are not whole riyals (a 5% cut of 250 is 12.5), and rounding
  // those to 13 would contradict the figure printed beside them.
  var fmt = function (n, dec) {
    return n.toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  };

  // Count a number up to its target. Short, eased, and it always lands
  // exactly on the written value — a counter that ends on 999 when the
  // markup says 1,000 makes the whole page look approximate.
  function countUp(el, to, ms) {
    var t0 = null, done = false, dec = to % 1 === 0 ? 0 : 1;

    // The counter must land on the written value even if the frames never come.
    // requestAnimationFrame is throttled or suspended in a tab that is not in
    // front, and a half-run count would leave "0 SAR" under a heading that
    // promises 900 — strictly worse than not animating at all. So the last
    // value is also written on a deadline, whichever happens first.
    function finish() { if (!done) { done = true; el.textContent = fmt(to, dec); } }
    setTimeout(finish, ms + 400);

    function frame(t) {
      if (done) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / ms);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased, dec);
      if (p < 1) requestAnimationFrame(frame);
      else finish();
    }
    requestAnimationFrame(frame);
  }

  function play(root) {
    root.classList.add('on');

    // 1 · the five stations, one after another, so the eye reads the
    //     order of events rather than a wall of finished boxes.
    var stops = root.querySelectorAll('.cx-stop');
    stops.forEach(function (s, i) {
      setTimeout(function () { s.classList.add('lit'); }, still ? 0 : 260 + i * 420);
    });

    // 2 · the split bars, after the stations have finished telling the
    //     story — the money is the consequence, so it lands last.
    var shares = root.querySelectorAll('.cx-share');
    var afterStory = still ? 0 : 260 + stops.length * 420;
    shares.forEach(function (sh, i) {
      var pct = sh.getAttribute('data-pct');
      var bar = sh.querySelector('.cx-bar i');
      setTimeout(function () { if (bar && pct) bar.style.width = pct + '%'; }, still ? 0 : afterStory + i * 180);
    });

    // 3 · every [data-count] on the block, whether it sits in the phone,
    //     a station or a split row.
    root.querySelectorAll('[data-count]').forEach(function (el, i) {
      var to = parseFloat(el.getAttribute('data-count'));
      if (isNaN(to)) return;
      if (still) { el.textContent = fmt(to, to % 1 === 0 ? 0 : 1); return; }
      setTimeout(function () { countUp(el, to, 1100); }, 300 + i * 120);
    });
  }


  /* ── the money board, made answerable ──────────────────────
     The split was a single illustrative transaction. The same percentages at
     100 or 1,000 transactions answer the question the page actually raises —
     what does this earn at volume — and it is arithmetic on figures already
     on the page, not a new claim. Switching replays the fill, so the bars
     stay the thing that carries the meaning. */
  document.querySelectorAll('.cx-board').forEach(function (board) {
    var buttons = board.querySelectorAll('.cx-scale');
    if (!buttons.length) return;
    var total = board.querySelector('.cx-board-top [data-count]');
    var baseTotal = parseFloat(board.getAttribute('data-total'));
    var rows = board.querySelectorAll('.cx-share');
    // The board's caption names one transaction ("an order in the marketplace").
    // Left alone at ×1,000 it would sit beside 1,000,000 and read as if a single
    // order were worth a million, so it takes the scale's own wording instead.
    var caption = board.querySelector('.cx-board-top .cx-t');
    var baseCaption = caption ? caption.textContent : '';

    function apply(mult, label) {
      if (caption) caption.textContent = mult === 1 ? baseCaption : label;
      if (total) {
        total.setAttribute('data-count', baseTotal * mult);
        if (still) total.textContent = fmt(baseTotal * mult, 0);
        else countUp(total, baseTotal * mult, 900);
      }
      rows.forEach(function (row) {
        var el = row.querySelector('[data-count]');
        var to = parseFloat(row.getAttribute('data-base')) * mult;
        el.setAttribute('data-count', to);
        if (still) el.textContent = fmt(to, to % 1 === 0 ? 0 : 1);
        else countUp(el, to, 900);
        // re-run the fill from zero so the eye follows the money again
        var bar = row.querySelector('.cx-bar i');
        if (bar) {
          bar.style.transition = 'none';
          bar.style.width = '0';
          bar.getBoundingClientRect();          // force the reset to take
          bar.style.transition = '';
          requestAnimationFrame(function () { bar.style.width = row.getAttribute('data-pct') + '%'; });
        }
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        apply(parseFloat(b.getAttribute('data-mult')) || 1, b.textContent.trim());
      });
    });
  });

  if (still || !('IntersectionObserver' in window)) {
    blocks.forEach(play);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      play(e.target);
      io.unobserve(e.target);   // explanation is worth watching once
    });
  }, { threshold: .28, rootMargin: '0px 0px -8% 0px' });

  blocks.forEach(function (b) { io.observe(b); });

  // Safety net. An observer that never fires — a tab that was never brought to
  // the front, a layout that keeps a block below threshold — would otherwise
  // leave those sections blank for good, because the copy is what the CSS hid.
  // So after a few seconds anything already on screen is played regardless, and
  // if blocks are still waiting we keep watching on scroll until none are left.
  function sweep() {
    var waiting = 0;
    blocks.forEach(function (b) {
      if (b.classList.contains('on')) return;
      var r = b.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { play(b); io.unobserve(b); }
      else waiting++;
    });
    if (!waiting) {
      removeEventListener('scroll', sweep);
      removeEventListener('resize', sweep);
    }
  }

  setTimeout(function () {
    sweep();
    if (document.querySelector('.cx-anim:not(.on)')) {
      addEventListener('scroll', sweep, { passive: true });
      addEventListener('resize', sweep, { passive: true });
    }
  }, 3000);
})();
