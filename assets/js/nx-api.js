/* ============================================================
   NX Partners — tiny API client (window.NXApi)
   Base URL resolution:
     • production: same-origin ("") → calls /api/... (nginx proxies to backend)
     • optional <meta name="nx-api" content="https://api.nx.sa">
     • local dev only (localhost/127.0.0.1): ?api=<url> or localStorage 'nx_api'
   All requests send cookies (credentials:'include') and JSON.
   ============================================================ */
(function () {
  'use strict';
  function resolveBase() {
    var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    if (isLocal) {
      try {
        var q = new URLSearchParams(location.search).get('api');
        if (q) { localStorage.setItem('nx_api', q); return q.replace(/\/$/, ''); }
        var s = localStorage.getItem('nx_api');
        if (s) return s.replace(/\/$/, '');
      } catch (e) {}
    }
    var m = document.querySelector('meta[name="nx-api"]');
    return (m && m.content ? m.content : '').replace(/\/$/, '');
  }
  var API = resolveBase();

  async function req(method, path, body) {
    var opts = { method: method, credentials: 'include', headers: {} };
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    var res = await fetch(API + path, opts);
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      var err = new Error((data && data.error) || ('HTTP ' + res.status));
      err.status = res.status; err.code = data && data.code;
      throw err;
    }
    return data;
  }

  window.NXApi = {
    base: API,
    get: (p) => req('GET', p),
    post: (p, b) => req('POST', p, b === undefined ? {} : b),
    patch: (p, b) => req('PATCH', p, b === undefined ? {} : b),
    put: (p, b) => req('PUT', p, b === undefined ? {} : b),
  };
})();
