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

// Shared guards for every attribution path: the partner must be active, and a
// client may never refer themselves.
function usable(row, clientEmail) {
  if (!row || row.status !== 'active') return false;
  if (clientEmail && row.email && clientEmail.toLowerCase() === row.email.toLowerCase()) return false;
  return true;
}

// Resolve which partner a conversion belongs to, from a ref code OR a coupon code.
// Enforces the attribution window and blocks self-referral.
//
// `requireClick` guards the *link* path only, and exists because a bare ref code
// proves nothing on its own — anyone could append `?ref=` to a URL. A recorded
// click inside the window is what makes it real. Callers that already hold
// stronger evidence (see attributeCode) turn it off.
async function attribute({ refCode, coupon, clientEmail, requireClick = true }) {
  let row = null, via = 'link';
  if (coupon) {
    const r = await query(`SELECT id, status, email FROM partners WHERE coupon_code = $1`, [coupon]);
    row = r.rows[0]; via = coupon;
  } else if (refCode) {
    const r = await query(`SELECT id, status, email FROM partners WHERE ref_code = $1`, [refCode]);
    row = r.rows[0]; via = 'link';
  }
  if (!usable(row, clientEmail)) return null;
  if (via === 'link' && requireClick) {
    // require a click within the attribution window
    const c = await query(
      `SELECT 1 FROM clicks WHERE partner_id = $1
         AND created_at > now() - ($2 || ' days')::interval LIMIT 1`,
      [row.id, String(config.attributionWindowDays)]);
    if (!c.rows[0]) return null;
  }
  return { partnerId: row.id, via };
}

// Attribute a code the visitor supplied *on a form* — either prefilled from their
// tracked visit or typed in because the partner gave it to them by hand. Two
// differences from attribute():
//   • the code is matched against BOTH the referral code and the coupon code, since
//     a client repeats whichever one they were given;
//   • no prior click is required. Deliberately entering a partner's code is itself
//     the evidence, and demanding a click would silently rob partners who sell
//     face to face. The active-partner and self-referral guards still apply.
async function attributeCode({ code, clientEmail }) {
  if (!code) return null;
  const { rows } = await query(
    `SELECT id, status, email, ref_code, coupon_code FROM partners
      WHERE ref_code = $1 OR coupon_code = $1 LIMIT 1`, [code]);
  const row = rows[0];
  if (!usable(row, clientEmail)) return null;
  return { partnerId: row.id, via: row.coupon_code === code ? row.coupon_code : 'link' };
}

module.exports = { recordClick, attribute, attributeCode };
