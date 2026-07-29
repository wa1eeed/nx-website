'use strict';
/* Run the schema. `--drop` first wipes app tables (dev only). */
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function main() {
  const drop = process.argv.includes('--drop');
  if (drop) {
    console.log('[migrate] dropping tables…');
    await pool.query(`DROP TABLE IF EXISTS ledger, payouts, conversions, clicks, links, sessions, products, settings, partners CASCADE;`);
  }
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('[migrate] schema applied.');
  await pool.end();
}

main().catch(e => { console.error('[migrate] failed:', e.message); process.exit(1); });
