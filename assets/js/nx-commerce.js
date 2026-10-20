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


  /* ── the hero engine ───────────────────────────────────────
     Eight branches and a feed of operations notices. It runs on its own clock
     rather than on scroll, because it sits above the fold and is the first
     thing on the page: it should already be moving when the page arrives.

     Pointing at a branch takes over — the cycle stops, that branch lights, and
     its matching notice shows — so the diagram answers a question instead of
     only performing. It hands control back a moment after the pointer leaves. */
  (function () {
    var eg = document.querySelector('.cx-eg');
    if (!eg) return;

    var pills = [].slice.call(eg.querySelectorAll('.cx-eg-pill'));
    var spokes = eg.querySelectorAll('.cx-eg-spoke');
    var dots = eg.querySelectorAll('.cx-eg-dot');
    var notes = [].slice.call(eg.querySelectorAll('.cx-eg-note'));
    if (!pills.length) return;

    var at = 0, held = null, timer = null;

    function light(i) {
      pills.forEach(function (p, k) { p.classList.toggle('lit', k === i); });
      [].forEach.call(spokes, function (sp, k) { sp.classList.toggle('lit', k === i); });
      [].forEach.call(dots, function (dt, k) { dt.classList.toggle('lit', k === i); });
      // the feed is shorter than the ring, so it wraps independently
      if (notes.length) {
        var n = i % notes.length;
        notes.forEach(function (el, k) { el.classList.toggle('on', k === n); });
      }
    }

    function step() {
      if (held === null) { light(at); at = (at + 1) % pills.length; }
      timer = setTimeout(step, still ? 4200 : 2100);
    }

    pills.forEach(function (p, i) {
      function take() { held = i; light(i); }
      function give() { held = null; }
      p.addEventListener('pointerenter', take);
      p.addEventListener('pointerleave', give);
      p.addEventListener('focus', take);
      p.addEventListener('blur', give);
      p.addEventListener('click', function () { held = held === i ? null : i; light(i); });
    });

    light(0);
    step();

    // nothing moves while the tab is away: an unwatched animation is only
    // wasted battery, and it would otherwise race ahead unseen
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearTimeout(timer); }
      else if (!timer || true) { clearTimeout(timer); step(); }
    });
  })();


  /* ── the explainer ─────────────────────────────────────────
     The poster is a button. Pressing it picks the cut that fits the viewport
     and swaps the player in, so nothing downloads for the visitors — most of
     them — who never press it. */
  document.querySelectorAll('.cx-vid-play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tall = matchMedia('(max-width: 700px)').matches;
      var src = btn.getAttribute(tall ? 'data-tall' : 'data-wide');
      var v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('aria-label', btn.getAttribute('aria-label') || '');
      btn.replaceWith(v);
      // autoplay with sound is refused by every browser; start muted and let
      // the visitor unmute rather than silently failing to play at all
      v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
    });
  });


  /* ── the operations console ────────────────────────────────
     Four views of the same admin panel. The point of the motion here is
     different from the rest of the page: the other blocks explain an idea,
     this one has to behave like software, so a visitor can tell within a
     second that they are looking at an interface and not an illustration.

     So: the tabs are a real tablist with arrow keys and a roving tabindex,
     orders arrive while you watch and move the tiles above them, a seller
     finishes verification, the batch divides, and choosing a commission rule
     recomputes the order beside it. Everything is sample data, said plainly
     under the window, and every figure is derived from the ones already on
     the page rather than invented in script. */
  (function () {
    var win = document.querySelector('.cx-cs-win');
    if (!win) return;
    var tabs = [].slice.call(win.querySelectorAll('.cx-cs-tab'));
    var panels = [].slice.call(win.querySelectorAll('.cx-cs-panel'));
    if (!tabs.length || tabs.length !== panels.length) return;

    var money2 = function (n) {
      return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    var num = function (el) { return parseFloat(el.getAttribute('data-count')) || 0; };
    function put(el, to, dec) {
      if (!el) return;
      el.setAttribute('data-count', to);
      if (still) el.textContent = fmt(to, dec);
      else countUp(el, to, 650);
    }

    /* every number in a panel, counted up once when that panel opens */
    function runCounts(panel) {
      [].forEach.call(panel.querySelectorAll('[data-count]'), function (el, i) {
        var to = parseFloat(el.getAttribute('data-count'));
        if (isNaN(to)) return;
        if (still) { el.textContent = fmt(to, to % 1 === 0 ? 0 : 1); return; }
        setTimeout(function () { countUp(el, to, 780); }, i * 85);
      });
    }

    /* ·· orders arriving ···································· */
    var orders = win.querySelector('.cx-cs-panel[data-k="orders"]');
    var pool = [], queue = [], otimer = null, streamed = false;
    if (orders) {
      var tpl = orders.querySelector('template.cx-cs-live');
      if (tpl && tpl.content) pool = [].slice.call(tpl.content.querySelectorAll('tr'));
    }
    function tile(k) { return orders.querySelector('[data-kpi="' + k + '"] b'); }

    function arrive() {
      otimer = null;
      var tr = queue.shift();
      if (!tr) return;
      var body = orders.querySelector('.cx-cs-tbl tbody');
      var tbl = orders.querySelector('.cx-cs-tbl');
      if (!body) return;
      var rate = parseFloat(tbl.getAttribute('data-rate')) || 0;
      var cell = tr.querySelector('.cx-cs-amt');
      var amt = cell ? parseFloat((cell.textContent || '').replace(/[^\d.]/g, '')) || 0 : 0;

      body.insertBefore(tr, body.firstElementChild);
      tr.classList.add('cx-cs-new');
      while (body.children.length > 5) body.removeChild(body.lastElementChild);

      // the tiles move with the table, and the commission tile is recomputed
      // from the new total rather than added to — so the third figure is always
      // the stated percentage of the second, which is the first thing anyone
      // sharp enough to read a dashboard will check
      var cnt = tile('count'), sales = tile('sales'), fee = tile('fee');
      if (cnt) put(cnt, num(cnt) + 1, 0);
      if (sales) {
        var total = Math.round(num(sales) + amt);
        put(sales, total, 0);
        if (fee) put(fee, Math.round(total * rate / 100), 0);
      }
      if (queue.length) otimer = setTimeout(arrive, 3400);
    }

    function stream() {
      if (still || !pool.length || otimer || streamed) return;
      streamed = true;
      queue = pool.map(function (n) { return n.cloneNode(true); });
      otimer = setTimeout(arrive, 1700);
    }
    function halt() { if (otimer) { clearTimeout(otimer); otimer = null; } }

    /* ·· a seller finishing verification ···················· */
    function advance(panel) {
      var tbl = panel.querySelector('.cx-cs-tbl[data-advance]');
      if (!tbl || tbl.dataset.ran) return;
      var i = tbl.getAttribute('data-advance');
      var row = tbl.querySelector('tr[data-row="' + i + '"]');
      if (!row) return;
      tbl.dataset.ran = '1';
      var pips = row.querySelector('.cx-cs-pips');
      var n = parseInt(pips && pips.getAttribute('data-n'), 10) || 0;
      var chip = row.querySelector('.cx-cs-st');
      var toast = panel.querySelector('.cx-cs-toast');
      setTimeout(function () {
        if (pips) {
          [].forEach.call(pips.querySelectorAll('i'), function (p) { p.classList.add('on'); });
          pips.setAttribute('data-done', n);
          var lab = row.querySelector('.cx-cs-pipn');
          if (lab) lab.textContent = n + '/' + n;
        }
        if (chip) {
          chip.className = 'cx-cs-st cx-cs-st-' + tbl.getAttribute('data-advance-state');
          chip.textContent = tbl.getAttribute('data-advance-label');
        }
        if (toast) toast.classList.add('on');
      }, still ? 0 : 1300);
    }

    /* ·· the batch dividing ································· */
    function fill(panel) {
      if (still) return;
      [].forEach.call(panel.querySelectorAll('.cx-cs-seg'), function (seg) {
        seg.style.width = '0';
        seg.getBoundingClientRect();
        requestAnimationFrame(function () { seg.style.width = ''; });
      });
    }

    /* ·· commission rules, applied to the order beside them ·· */
    var wrap = win.querySelector('.cx-cs-rulewrap');
    if (wrap) {
      var amount = parseFloat(wrap.getAttribute('data-amount')) || 0;
      var feeB = wrap.querySelector('[data-calc="fee"]');
      var netB = wrap.querySelector('[data-calc="net"]');

      // the currency sits in an <em> after the figure, so only the text node
      // in front of it is rewritten; replacing the whole cell would drop it
      function writeMoney(b, to) {
        if (!b) return;
        var node = b.firstChild;
        if (!node || node.nodeType !== 3) {
          node = document.createTextNode('');
          b.insertBefore(node, b.firstChild);
        }
        if (still) { node.nodeValue = money2(to); return; }
        var from = parseFloat((node.nodeValue || '0').replace(/,/g, '')) || 0;
        var t0 = null, ms = 420, done = false;
        function fin() { if (!done) { done = true; node.nodeValue = money2(to); } }
        setTimeout(fin, ms + 300);
        requestAnimationFrame(function step(t) {
          if (done) return;
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
          node.nodeValue = money2(from + (to - from) * e);
          if (p < 1) requestAnimationFrame(step); else fin();
        });
      }

      wrap.addEventListener('change', function (ev) {
        var r = ev.target;
        if (!r || r.type !== 'radio') return;
        var fee = amount * (parseFloat(r.getAttribute('data-pct')) || 0) / 100
                + (parseFloat(r.getAttribute('data-fee')) || 0);
        writeMoney(feeB, fee);
        writeMoney(netB, amount - fee);
        // the bar shows the share the rule actually takes, fixed fee included,
        // which is not the same as the percentage printed in the row
        var bar = wrap.querySelector('.cx-cs-calc-bar');
        if (bar && amount) {
          var share = Math.max(0, Math.min(100, fee / amount * 100));
          bar.children[0].style.width = share.toFixed(2) + '%';
          bar.children[1].style.width = (100 - share).toFixed(2) + '%';
        }
      });
    }

    /* ·· one height for every view ··························
       The views are not the same length, and letting the window grow and
       shrink as you move between tabs makes the whole thing feel like a web
       page again. So the panels are measured once — off-screen, in the same
       frame, so nothing flashes — and the shortest is given the tallest one's
       room. Re-measured on resize, because the answer changes with width. */
    function sizePanels() {
      var box = win.querySelector('.cx-cs-panels');
      if (!box) return;
      box.style.minHeight = '';
      var tall = 0;
      panels.forEach(function (p) {
        var hid = p.hidden;
        if (hid) {
          p.style.position = 'absolute';
          p.style.insetInlineStart = '0';
          p.style.insetInlineEnd = '0';
          p.style.visibility = 'hidden';
          p.hidden = false;
        }
        tall = Math.max(tall, p.offsetHeight);
        if (hid) {
          p.hidden = true;
          p.style.position = p.style.insetInlineStart = p.style.insetInlineEnd = p.style.visibility = '';
        }
      });
      // the box sizes border-box, so the floor has to carry its own padding
      var pad = parseFloat(getComputedStyle(box).paddingTop) * 2 || 0;
      if (tall) box.style.minHeight = (tall + pad) + 'px';
    }

    var sizing = null;
    addEventListener('resize', function () {
      clearTimeout(sizing);
      sizing = setTimeout(sizePanels, 180);
    }, { passive: true });
    // measured after the webfonts land, or the mono figures are the wrong width
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizePanels);
    else addEventListener('load', sizePanels);

    /* ·· opening a view ····································· */
    var at = 0, entered = [];
    function enter(i) {
      var panel = panels[i];
      if (!entered[i]) { entered[i] = true; runCounts(panel); }
      var k = panel.getAttribute('data-k');
      if (k === 'orders') stream(); else halt();
      if (k === 'sellers') advance(panel);
      if (k === 'payouts') fill(panel);
    }

    function open(i, focus) {
      at = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
      enter(i);
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { open(i, false); });
      t.addEventListener('keydown', function (ev) {
        var rtl = getComputedStyle(win).direction === 'rtl';
        var k = ev.key, go = null;
        if (k === 'ArrowRight') go = rtl ? at - 1 : at + 1;
        else if (k === 'ArrowLeft') go = rtl ? at + 1 : at - 1;
        else if (k === 'Home') go = 0;
        else if (k === 'End') go = tabs.length - 1;
        if (go === null) return;
        ev.preventDefault();
        open((go + tabs.length) % tabs.length, true);
      });
    });

    // nothing runs until the window is actually on screen, and nothing keeps
    // running once it leaves or the tab goes to the background
    if (!('IntersectionObserver' in window)) { enter(0); return; }
    var started = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!started) { started = true; enter(at); } else if (panels[at].getAttribute('data-k') === 'orders') stream(); }
        else halt();
      });
    }, { threshold: .18 }).observe(win);

    document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); });
  })();

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
