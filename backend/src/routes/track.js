'use strict';
const express = require('express');
const config = require('../config');
const { query } = require('../db/pool');
const { asyncH, HttpError, str, num } = require('../lib/http');
const { sign, unsign, safeEqual } = require('../lib/auth');
const { hashIp } = require('../lib/ids');
const { recordClick, attribute } = require('../services/attribution');

// Read the ref code from the signed first-party attribution cookie (set by /r
// and /track/click), if still inside the attribution window. Returns '' if none.
function refFromCookie(req) {
  const raw = req.cookies && req.cookies[config.refCookie];
  const val = raw ? unsign(raw) : null;
  if (!val) return '';
  try {
    const j = JSON.parse(val);
    if (j && j.c && (Date.now() - Number(j.t || 0)) < config.attributionWindowDays * 864e5) {
      return String(j.c).slice(0, 40);
    }
  } catch (_) {}
  return '';
}

const router = express.Router();

// Only allow same-site relative redirect targets.
function safePath(to) {
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//') || /[\r\n\t]/.test(to)) return '/';
  return to;
}

// GET /r?ref=CODE&c=<campaign>&to=/services/grow/
// Records the click, drops a first-party attribution cookie, and 302s to the site.
router.get('/r', asyncH(async (req, res) => {
  const ref = str(req.query.ref, { name: 'ref', max: 40 });
  const to = safePath(req.query.to);
  const target = config.publicOrigin + to;
  if (!ref) return res.redirect(302, target);

  const partner = await recordClick({
    refCode: ref, ip: req.ip,
    ua: req.get('user-agent'), referrer: req.get('referer'),
  });
  if (partner) {
    const payload = sign(JSON.stringify({ c: ref, t: Date.now() }));
    res.cookie(config.refCookie, payload, {
      httpOnly: true, sameSite: 'lax', secure: config.secureCookies,
      domain: config.cookieDomain, path: '/', maxAge: config.attributionWindowDays * 864e5,
    });
  }
  res.redirect(302, target);
}));

// GET /track/click?ref=CODE  — background beacon from any nx.sa page that carries
// ?ref=. Logs the click + drops the first-party attribution cookie, no redirect.
// Lets partners share the clean https://nx.sa/?ref=CODE link and still get tracked.
router.get('/track/click', asyncH(async (req, res) => {
  const ref = str(req.query.ref, { name: 'ref', max: 40 });
  if (ref) {
    const partner = await recordClick({ refCode: ref, ip: req.ip, ua: req.get('user-agent'), referrer: req.get('referer') });
    if (partner) {
      res.cookie(config.refCookie, sign(JSON.stringify({ c: ref, t: Date.now() })), {
        httpOnly: true, sameSite: 'lax', secure: config.secureCookies,
        domain: config.cookieDomain, path: '/', maxAge: config.attributionWindowDays * 864e5,
      });
    }
  }
  res.set('Cache-Control', 'no-store');
  res.status(204).end();
}));

// POST /track/conversion  (server-to-server; authenticated by shared secret)
// Body: { ref?|coupon?, product (slug or path), client_name?, client_email?, deal_value, external_ref? }
router.post('/track/conversion', asyncH(async (req, res) => {
  const secret = req.get('x-webhook-secret') || '';
  if (!safeEqual(secret, config.webhookSecret)) throw new HttpError(401, 'Bad webhook secret', 'unauthorized');

  const b = req.body || {};
  const ref = str(b.ref, { name: 'ref', max: 40 });
  const coupon = str(b.coupon, { name: 'coupon', max: 40 });
  const productKey = str(b.product, { required: true, name: 'product', max: 120 });
  const dealValue = num(b.deal_value, { min: 0, def: 0 });
  const clientName = str(b.client_name, { name: 'client_name', max: 160 });
  const clientEmail = b.client_email ? String(b.client_email).toLowerCase().slice(0, 200) : null;
  const externalRef = str(b.external_ref, { name: 'external_ref', max: 120 });

  if (!ref && !coupon) throw new HttpError(400, 'ref or coupon is required', 'bad_request');

  const attr = await attribute({ refCode: ref, coupon, clientEmail });
  if (!attr) throw new HttpError(422, 'Could not attribute this conversion (unknown/expired/self-referral)', 'unattributed');

  const prod = (await query(
    `SELECT id, commission_pct FROM products WHERE slug = $1 OR path = $1`, [productKey])).rows[0];
  const pct = prod ? Number(prod.commission_pct) : 15;
  const commission = Math.round(dealValue * pct) / 100;

  try {
    const { rows } = await query(
      `INSERT INTO conversions(partner_id, product_id, client_name, deal_value, commission, via, external_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, status`,
      [attr.partnerId, prod ? prod.id : null, clientName, dealValue, commission, attr.via, externalRef]);
    res.status(201).json({ ok: true, conversion: rows[0], commission });
  } catch (e) {
    if (e.code === '23505') return res.status(200).json({ ok: true, duplicate: true }); // idempotent replay
    throw e;
  }
}));

// POST /track/lead  — fired by the site contact form on a successful submit.
// Attributes the lead to a partner from the body ref/coupon OR the signed
// attribution cookie, then records it. Non-affiliate leads are ignored (200,
// no-op) — this table only holds affiliate-attributed leads. Same-origin only
// (originGuard) + rate-limited, like every state-changing browser call.
router.post('/track/lead', asyncH(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const b = req.body || {};
  let ref = str(b.ref, { name: 'ref', max: 40 });
  const coupon = str(b.coupon, { name: 'coupon', max: 40 });
  if (!ref && !coupon) ref = refFromCookie(req); // fall back to first-party cookie

  if (!ref && !coupon) return res.status(200).json({ ok: true, attributed: false });

  const email = b.email ? String(b.email).toLowerCase().slice(0, 200) : null;
  const attr = await attribute({ refCode: ref, coupon, clientEmail: email });
  if (!attr) return res.status(200).json({ ok: true, attributed: false }); // unknown/expired/self

  const name = str(b.name, { name: 'name', max: 160 });
  const phone = str(b.phone, { name: 'phone', max: 40 });
  const company = str(b.company, { name: 'company', max: 160 });
  const service = str(b.service, { name: 'service', max: 60 });
  const sourcePage = str(b.source_page, { name: 'source_page', max: 300 });
  const ipHash = hashIp(req.ip, config.ipSalt);

  // Double-submit guard: same partner + same email within 10 min counts once.
  if (email) {
    const dup = await query(
      `SELECT 1 FROM leads WHERE partner_id=$1 AND email=$2
         AND created_at > now() - interval '10 minutes' LIMIT 1`, [attr.partnerId, email]);
    if (dup.rows[0]) return res.status(200).json({ ok: true, attributed: true, duplicate: true });
  }

  await query(
    `INSERT INTO leads(partner_id, name, email, phone, company, service, via, source_page, ip_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [attr.partnerId, name, email, phone, company, service, attr.via, sourcePage, ipHash]);
  res.status(201).json({ ok: true, attributed: true });
}));

module.exports = router;
