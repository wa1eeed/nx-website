'use strict';
const express = require('express');
const config = require('../config');
const { query } = require('../db/pool');
const { asyncH, HttpError, str, num } = require('../lib/http');
const { sign, safeEqual } = require('../lib/auth');
const { recordClick, attribute } = require('../services/attribution');

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

module.exports = router;
