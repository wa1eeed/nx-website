/* ============================================================
   NX Solutions — behaviour / analytics integrations  (MANAGED)
   ------------------------------------------------------------
   ⚠️  DO NOT DELETE. These are the site-wide visitor-behaviour
       and analytics trackers. This ONE file is the single source
       of truth, loaded via `defer` on every page as:
         <script src="/assets/js/nx-zoho.js?v=59" defer></script>
       Removing that <script> tag disables tracking site-wide.

   Each tracker below is clearly labelled and given a DOM id so it
   is easy to find, swap, or disable:
       • Google Analytics 4 ....... id="ga4script"      (GA4_ID)
       • Zoho PageSense ........... id="pagesenseCode"  (PAGESENSE_SRC)
       • Zoho SalesIQ ............. id="zsiqscript"      (SALESIQ_SRC)

   To SWAP a code later: change only the matching constant below.
   To DISABLE one: comment out its block. Nothing else needs editing.

   Performance: every external script is injected `async` so it
   never blocks first paint, LCP, or interactivity. We inject as
   soon as the DOM is parsed (this file is `defer`red) rather than
   on window.load, so page-views are captured promptly with no
   speed cost (async scripts are non-blocking regardless of timing).
   ============================================================ */
(function () {
  'use strict';

  /* -- Editable identifiers (swap these to rotate codes later) -- */
  var GA4_ID        = 'G-PH5BPW7MM2';
  var PAGESENSE_SRC = 'https://cdn-sa.pagesense.io/js/nxsoutions/8246671c3dcf44ae909e4551a3c5ebce.js';
  var SALESIQ_SRC   = 'https://salesiq.zohopublic.sa/widget?wc=e073f31dc6994f34eac784ed65daf562b648f32b25e2af9a48a32c21235cd067';

  function injectIntegrations() {
    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head) { return; }

    /* ---- 1) Google Analytics 4 (gtag.js) — property G-PH5BPW7MM2 ----
       This is Google ANALYTICS (measurement). Google Tag Manager
       (GTM-W6KJDFJJ) is added separately, high in each page's <head>,
       and must load early to manage other tags. dataLayer + gtag are
       defined before the library so the first config/page_view is
       queued and flushed the moment gtag.js arrives. */
    if (!document.getElementById('ga4script')) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA4_ID);
      var ga = document.createElement('script');
      ga.id = 'ga4script';
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      head.appendChild(ga);
    }

    /* ---- 2) Zoho PageSense — heatmaps, session recordings, funnels ----
       Loaded async (non-blocking) to protect page-speed. Zoho's official
       snippet also hides the page until the script loads (anti-flicker
       for VISUAL A/B split tests); we intentionally skip that page-hide
       because this site records behaviour, it does not run visual A/B
       redirect tests, and the hide would delay first paint. If you later
       run a visual A/B test and need the anti-flicker, tell us and we'll
       move Zoho's official inline snippet into <head>. */
    if (!document.getElementById('pagesenseCode')) {
      var ps = document.createElement('script');
      ps.id = 'pagesenseCode';
      ps.async = true;
      ps.src = PAGESENSE_SRC;
      head.appendChild(ps);
    }

    /* ---- 3) Zoho SalesIQ — live chat + visitor tracking ---- */
    if (!document.getElementById('zsiqscript')) {
      window.$zoho = window.$zoho || {};
      window.$zoho.salesiq = window.$zoho.salesiq || { ready: function () {} };
      var siq = document.createElement('script');
      siq.id = 'zsiqscript';
      siq.defer = true;
      siq.src = SALESIQ_SRC;
      head.appendChild(siq);
    }
  }

  /* This file is loaded with `defer`, so at execution the DOM is
     already parsed. Inject immediately; fall back to DOMContentLoaded
     only if somehow called while the document is still loading. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectIntegrations);
  } else {
    injectIntegrations();
  }
})();
