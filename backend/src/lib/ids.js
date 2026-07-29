'use strict';
const crypto = require('crypto');

// Unambiguous alphabet (no O/0/I/1) for human-typed referral codes.
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function rand(n) {
  const b = crypto.randomBytes(n);
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHA[b[i] % ALPHA.length];
  return s;
}

const base = (name) => (name || 'NX').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'NX';

// e.g. "KHALID-7Q2"
const refCode = (name) => base(name) + '-' + rand(3);
// e.g. "KHALID10" (a short unique suffix appended on collision)
const couponCode = (name, pct = 10) => base(name) + String(pct);

const token = (n = 32) => crypto.randomBytes(n).toString('base64url');

const hashIp = (ip, salt) =>
  crypto.createHash('sha256').update(String(ip || '') + '|' + salt).digest('hex').slice(0, 32);

module.exports = { rand, refCode, couponCode, token, hashIp };
