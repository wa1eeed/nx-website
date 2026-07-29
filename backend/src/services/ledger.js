'use strict';
const { query } = require('../db/pool');

// Balances derived purely from the append-only ledger (+ pending from conversions).
async function balances(partnerId) {
  const { rows } = await query(
    `SELECT
       COALESCE(SUM(amount), 0)                                        AS available,
       COALESCE(SUM(amount) FILTER (WHERE type = 'commission'), 0)     AS lifetime,
       COALESCE(-SUM(amount) FILTER (WHERE type = 'payout'), 0)        AS paid
     FROM ledger WHERE partner_id = $1`, [partnerId]);
  const pend = await query(
    `SELECT COALESCE(SUM(commission), 0) AS pending
     FROM conversions WHERE partner_id = $1 AND status = 'pending'`, [partnerId]);
  return {
    available: Number(rows[0].available),
    lifetime: Number(rows[0].lifetime),
    paid: Number(rows[0].paid),
    pending: Number(pend.rows[0].pending),
  };
}

// Insert a ledger entry. Pass a tx client to run inside a transaction.
async function post(db, { partnerId, type, amount, refType, refId, memo }) {
  await db.query(
    `INSERT INTO ledger(partner_id, type, amount, ref_type, ref_id, memo)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [partnerId, type, amount, refType || null, refId || null, memo || null]);
}

module.exports = { balances, post };
