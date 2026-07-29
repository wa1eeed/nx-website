'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { query } = require('../db/pool');
const { asyncH, HttpError, str, email: emailV, num } = require('../lib/http');
const { hashPassword, verifyPassword } = require('../lib/auth');
const { refCode, couponCode, token, hashIp } = require('../lib/ids');
const { requireAuth } = require('../middleware');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

function setSessionCookie(res, tok) {
  res.cookie(config.cookieName, tok, {
    httpOnly: true, sameSite: 'lax', secure: config.secureCookies,
    domain: config.cookieDomain, path: '/', maxAge: config.sessionDays * 864e5,
  });
}
const publicPartner = (p) => ({
  id: p.id, name: p.name, email: p.email, role: p.role, status: p.status,
  refCode: p.ref_code, couponCode: p.coupon_code, lang: p.lang,
});

// Create a partner application WITH a password. Account is pending until an admin approves.
router.post('/register', authLimiter, asyncH(async (req, res) => {
  const b = req.body || {};
  const data = {
    name: str(b.name, { required: true, name: 'name', max: 120 }),
    email: emailV(b.email, { required: true }),
    phone: str(b.phone, { name: 'phone', max: 40 }),
    company: str(b.company, { name: 'company', max: 160 }),
    channel: str(b.channel, { name: 'channel', max: 80 }),
    audience: str(b.audience, { name: 'audience', max: 80 }),
    note: str(b.note, { name: 'note', max: 1000 }),
    lang: b.lang === 'en' ? 'en' : 'ar',
  };
  const password = str(b.password, { required: true, name: 'password', min: 8, max: 200 });

  const exists = await query('SELECT 1 FROM partners WHERE email = $1', [data.email]);
  if (exists.rows[0]) throw new HttpError(409, 'An account with this email already exists', 'email_taken');

  const pw = await hashPassword(password);
  const couponPct = (await query(`SELECT (value->>'coupon_pct')::int AS p FROM settings WHERE key='program'`)).rows[0]?.p || 10;

  // Insert with generated codes; retry on the rare unique-code collision.
  let row;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const rc = refCode(data.name);
      const cc = couponCode(data.name, couponPct) + (attempt ? String(attempt) : '');
      const r = await query(
        `INSERT INTO partners(name,email,phone,company,channel,audience,note,lang,password_hash,ref_code,coupon_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [data.name, data.email, data.phone, data.company, data.channel, data.audience, data.note, data.lang, pw, rc, cc]);
      row = r.rows[0];
      break;
    } catch (e) {
      if (e.code === '23505' && attempt < 5) continue;   // unique_violation on a code → retry
      throw e;
    }
  }
  res.status(201).json({ ok: true, status: 'pending', partner: publicPartner(row),
    message: 'Application received. An admin will review and activate your account.' });
}));

router.post('/login', authLimiter, asyncH(async (req, res) => {
  const email = emailV((req.body || {}).email, { required: true });
  const password = str((req.body || {}).password, { required: true, name: 'password', max: 200 });
  const { rows } = await query('SELECT * FROM partners WHERE email = $1', [email]);
  const p = rows[0];
  const ok = p && await verifyPassword(password, p.password_hash);
  if (!ok) throw new HttpError(401, 'Invalid email or password', 'invalid_credentials');
  if (p.status === 'pending') throw new HttpError(403, 'Your account is pending approval', 'pending');
  if (p.status === 'suspended') throw new HttpError(403, 'Your account is suspended', 'suspended');

  const tok = token(32);
  await query(
    `INSERT INTO sessions(token, partner_id, expires_at, ip_hash, ua)
     VALUES ($1,$2, now() + ($3 || ' days')::interval, $4, $5)`,
    [tok, p.id, String(config.sessionDays), hashIp(req.ip, config.ipSalt), String(req.get('user-agent') || '').slice(0, 300)]);
  setSessionCookie(res, tok);
  res.json({ ok: true, partner: publicPartner(p) });
}));

router.post('/logout', asyncH(async (req, res) => {
  const tok = req.cookies && req.cookies[config.cookieName];
  if (tok) await query('DELETE FROM sessions WHERE token = $1', [tok]);
  res.clearCookie(config.cookieName, { domain: config.cookieDomain, path: '/' });
  res.json({ ok: true });
}));

router.get('/me', requireAuth, (req, res) => res.json({ ok: true, partner: publicPartner(req.user) }));

module.exports = router;
