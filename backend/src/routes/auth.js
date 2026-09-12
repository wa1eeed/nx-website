'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { query } = require('../db/pool');
const { asyncH, HttpError, str, email: emailV, num } = require('../lib/http');
const { hashPassword, verifyPassword } = require('../lib/auth');
const { refCode, couponCode, token, hashIp } = require('../lib/ids');
const { send, passwordResetMail } = require('../services/mailer');
const crypto = require('crypto');
const { requireAuth } = require('../middleware');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

// An admin signs in to the admin cookie, a partner to the partner cookie, so the
// two can be held at once without either overwriting the other.
const cookieFor = (role) => (role === 'admin' ? config.adminCookieName : config.cookieName);

function setSessionCookie(res, tok, role) {
  res.cookie(cookieFor(role), tok, {
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
  setSessionCookie(res, tok, p.role);
  res.json({ ok: true, partner: publicPartner(p) });
}));

// Signing out of one console must not sign you out of the other, so only the
// cookie for the scope being left is cleared. ?scope=admin leaves the console;
// anything else leaves the partner portal.
router.post('/logout', asyncH(async (req, res) => {
  const name = req.query.scope === 'admin' ? config.adminCookieName : config.cookieName;
  const tok = req.cookies && req.cookies[name];
  if (tok) await query('DELETE FROM sessions WHERE token = $1', [tok]);
  res.clearCookie(name, { domain: config.cookieDomain, path: '/' });
  res.json({ ok: true });
}));

router.get('/me', requireAuth, (req, res) => res.json({ ok: true, partner: publicPartner(req.user) }));

// ── password reset ─────────────────────────────────────────────────────────────
// Tighter than the other auth routes: this one emails a real person, so it is the
// obvious lever for both spamming an inbox and probing which addresses exist.
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });
const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

// POST /api/auth/forgot  { email }
// ALWAYS answers the same. Whether the address is unknown, pending, suspended, or
// the mail failed to send, the caller sees one response — otherwise this form
// becomes a way to enumerate who has an account here.
router.post('/forgot', resetLimiter, asyncH(async (req, res) => {
  const answer = () => res.json({ ok: true });
  // Validated here rather than with emailV(), which throws a 400 on a malformed
  // address — this route promises one response to every input, including junk.
  const rawAddr = str((req.body || {}).email, { name: 'email', max: 200 });
  const addr = rawAddr && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rawAddr) ? rawAddr.toLowerCase() : null;
  if (!addr) return answer();

  const p = (await query(
    `SELECT id, name, email, lang, status FROM partners WHERE email = $1`, [addr])).rows[0];
  // Only an account that could actually log in gets a link. A pending or suspended
  // partner resetting their password would just hit the same wall afterwards.
  if (!p || p.status !== 'active') return answer();

  const raw = token(32);
  const expires = new Date(Date.now() + config.resetTokenMinutes * 60000);
  await query(
    `INSERT INTO password_resets(partner_id, token_hash, expires_at, ip_hash) VALUES ($1,$2,$3,$4)`,
    [p.id, sha256(raw), expires, hashIp(req.ip, config.ipSalt)]);

  const lang = p.lang === 'en' ? 'en' : 'ar';
  const url = `${config.publicOrigin}/${lang}/affiliate/reset/?token=${encodeURIComponent(raw)}`;
  const mail = passwordResetMail({ lang, name: p.name, url, minutes: config.resetTokenMinutes });
  await send({ to: p.email, ...mail });   // never throws; logs on failure
  answer();
}));

// POST /api/auth/reset  { token, password }
// Burns every outstanding token for the partner and every open session: if the
// reset was prompted by someone else having the account, they are logged out too.
router.post('/reset', resetLimiter, asyncH(async (req, res) => {
  const b = req.body || {};
  const raw = str(b.token, { required: true, name: 'token', max: 200 });
  const password = str(b.password, { required: true, name: 'password', min: 8, max: 200 });

  const row = (await query(
    `SELECT pr.id, pr.partner_id FROM password_resets pr
      JOIN partners p ON p.id = pr.partner_id
     WHERE pr.token_hash = $1 AND pr.used_at IS NULL AND pr.expires_at > now()
       AND p.status = 'active'`, [sha256(raw)])).rows[0];
  if (!row) throw new HttpError(400, 'This reset link is invalid or has expired', 'bad_token');

  const hash = await hashPassword(password);
  await query(`UPDATE partners SET password_hash = $1 WHERE id = $2`, [hash, row.partner_id]);
  await query(`UPDATE password_resets SET used_at = now() WHERE partner_id = $1 AND used_at IS NULL`, [row.partner_id]);
  await query(`DELETE FROM sessions WHERE partner_id = $1`, [row.partner_id]);
  res.json({ ok: true });
}));

// GET /api/auth/reset?token=…  — lets the page say "this link is dead" before the
// visitor types a new password twice for nothing.
router.get('/reset', resetLimiter, asyncH(async (req, res) => {
  const raw = str(req.query.token, { name: 'token', max: 200 });
  if (!raw) return res.json({ ok: true, valid: false });
  const row = (await query(
    `SELECT 1 FROM password_resets pr JOIN partners p ON p.id = pr.partner_id
      WHERE pr.token_hash = $1 AND pr.used_at IS NULL AND pr.expires_at > now()
        AND p.status = 'active'`, [sha256(raw)])).rows[0];
  res.json({ ok: true, valid: !!row });
}));

module.exports = router;
