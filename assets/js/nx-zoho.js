/* ============================================================
   NX Solutions — third-party integrations (Zoho)
   ------------------------------------------------------------
   All external marketing / analytics / chat scripts live HERE,
   in ONE file, so they are easy to find, update, or remove.

   Loaded with `defer` and injected after the page is interactive
   so they never block first paint or hurt the LCP / page speed.

   To update a widget later: change only the URL/token in the
   matching block below. To disable one: comment its block out.
   ============================================================ */
(function () {
  'use strict';

  function injectIntegrations() {
    var head = document.head || document.getElementsByTagName('head')[0];

    /* ---- 1) Zoho SalesIQ — live chat + visitor tracking ---- */
    if (!document.getElementById('zsiqscript')) {
      window.$zoho = window.$zoho || {};
      window.$zoho.salesiq = window.$zoho.salesiq || { ready: function () {} };
      var siq = document.createElement('script');
      siq.id = 'zsiqscript';
      siq.defer = true;
      siq.src = 'https://salesiq.zohopublic.sa/widget?wc=e073f31dc6994f34eac784ed65daf562b648f32b25e2af9a48a32c21235cd067';
      head.appendChild(siq);
    }

    /* ---- 2) Zoho PageSense — heatmaps, recordings, funnels ----
       Loaded async (non-blocking) for speed. The official snippet
       hides the page until it loads (anti-flicker for visual A/B
       tests); we skip that here to protect page-speed since no
       visual A/B test is running. If you start one and need the
       anti-flicker behavior, tell us and we'll move its head
       snippet into <head>. */
    if (!document.getElementById('pagesenseAsync')) {
      var ps = document.createElement('script');
      ps.id = 'pagesenseAsync';
      ps.async = true;
      ps.src = 'https://cdn-sa.pagesense.io/js/nxsoutions/8c376a87a44a401c9d524854bd685981.js';
      head.appendChild(ps);
    }

    /* ---- 3) Zoho Marketing Automation ----
       NOTE: the ZMA snippet provided pointed to the SAME PageSense
       URL above (a copy/paste duplicate), so it is intentionally
       NOT loaded a second time. When the real ZMA / Zoho Campaigns
       tracking code is available, add its block here. */
  }

  if (document.readyState === 'complete') {
    injectIntegrations();
  } else {
    window.addEventListener('load', injectIntegrations);
  }
})();
