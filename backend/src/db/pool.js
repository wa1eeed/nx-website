'use strict';
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.databaseUrl, max: 10, idleTimeoutMillis: 30000 });

pool.on('error', err => console.error('[pg] idle client error', err.message));

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  // run a function inside a transaction with a dedicated client
  async tx(fn) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const out = await fn(client);
      await client.query('COMMIT');
      return out;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },
};
