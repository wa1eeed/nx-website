'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

const hashPassword = (pw) => bcrypt.hash(pw, 12);
const verifyPassword = (pw, hash) => (hash ? bcrypt.compare(pw, hash) : Promise.resolve(false));

// HMAC-sign a short value (used for the first-party attribution cookie payload).
function sign(value) {
  const mac = crypto.createHmac('sha256', config.sessionSecret).update(value).digest('base64url');
  return value + '.' + mac;
}
function unsign(signed) {
  if (typeof signed !== 'string') return null;
  const i = signed.lastIndexOf('.');
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const mac = signed.slice(i + 1);
  const expected = crypto.createHmac('sha256', config.sessionSecret).update(value).digest('base64url');
  try {
    if (mac.length === expected.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return value;
  } catch (_) {}
  return null;
}

// Constant-time compare for shared secrets (webhook).
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

module.exports = { hashPassword, verifyPassword, sign, unsign, safeEqual };
