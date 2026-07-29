'use strict';
const app = require('./app');
const config = require('./config');
const { pool } = require('./db/pool');

const server = app.listen(config.port, () => {
  console.log(`[nx-partners] listening on :${config.port} (${config.env})`);
});

function shutdown(sig) {
  console.log(`[nx-partners] ${sig} — shutting down`);
  server.close(() => pool.end().finally(() => process.exit(0)));
  setTimeout(() => process.exit(1), 8000).unref();
}
['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));
