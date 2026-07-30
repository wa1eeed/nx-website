'use strict';
const app = require('./app');
const config = require('./config');
const { pool } = require('./db/pool');
const { ensureAdminFromEnv } = require('./db/ensure-admin');

let server;
function shutdown(sig) {
  console.log(`[nx-partners] ${sig} — shutting down`);
  if (server) server.close(() => pool.end().finally(() => process.exit(0)));
  setTimeout(() => process.exit(1), 8000).unref();
}
['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));

(async () => {
  // optional admin bootstrap from env (ADMIN_EMAIL + ADMIN_PASSWORD) — never blocks boot
  try { await ensureAdminFromEnv(); } catch (e) { console.error('[admin] bootstrap failed:', e.message); }
  server = app.listen(config.port, () => {
    console.log(`[nx-partners] listening on :${config.port} (${config.env})`);
  });
})();
