'use strict';
const { query } = require('../db/pool');
const { hashIp } = require('../lib/ids');
const config = require('../config');

// Record a click with basic fraud guards. Returns the active partner, or null.
async function recordClick({ refCode, linkId, ip, ua, referrer }) {
  if (!refCode) return null;
  const { rows } = await query(`SELECT id, status FROM partners WHERE ref_code = $1`, [refCode]);
  const p = rows[0];
  if (!p || p.status !== 'active') return null;

  const ipHash = hashIp(ip, config.ipSalt);
  // De-dupe: the same code+IP within 30s is counted once (bot / double-fire guard).
  const dup = await query(
    `SELECT 1 FROM clicks WHERE partner_id = $1 AND ip_hash = $2
       AND created_at > now() - interval '30 seconds' LIMIT 1`, [p.id, ipHash]);
  if (!dup.rows[0]) {
    await query(
      `INSERT INTO clicks(partner_id, link_id, ref_code, ip_hash, ua, referrer)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [p.id, linkId || null, refCode, ipHash, String(ua || '').slice(0, 300), String(referrer || '').slice(0, 300)]);
  }
  return p;
}

// Resolve which partner a conversion belongs to, from a ref code OR a coupon code.
// Enforces the attribution window and blocks self-referral.
async function attribute({ refCode, coupon, clientEmail }) {
  let row = null, via = 'link';
  if (coupon) {
    const r = await query(`SELECT id, status, email FROM partners WHERE coupon_code = $1`, [coupon]);
    row = r.rows[0]; via = coupon;
  } else if (refCode) {
    const r = await query(`SELECT id, status, email FROM partners WHERE ref_code = $1`, [refCode]);
    row = r.rows[0]; via = 'link';
  }
  if (!row || row.status !== 'active') return null;
  // self-referral block
  if (clientEmail && row.email && clientEmail.toLowerCase() === row.email.toLowerCase()) return null;
  if (via === 'link') {
    // require a click within the attribution window
    const c = await query(
      `SELECT 1 FROM clicks WHERE partner_id = $1
         AND created_at > now() - ($2 || ' days')::interval LIMIT 1`,
      [row.id, String(config.attributionWindowDays)]);
    if (!c.rows[0]) return null;
  }
  return { partnerId: row.id, via };
}

module.exports = { recordClick, attribute };
