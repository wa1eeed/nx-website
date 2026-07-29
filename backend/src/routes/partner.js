'use strict';
const express = require('express');
const config = require('../config');
const { query } = require('../db/pool');
const { asyncH, HttpError, str, num } = require('../lib/http');
const ledger = require('../services/ledger');

const router = express.Router();
const me = (req) => req.user;
const deepLink = (u, path) => `${config.publicOrigin}/${u.lang || 'ar'}${path}?ref=${u.ref_code}`;

async function programSettings() {
  const r = await query(`SELECT value FROM settings WHERE key='program'`);
  return r.rows[0] ? r.rows[0].value : { min_payout: 1000, payout_schedule: 'monthly' };
}

router.get('/overview', asyncH(async (req, res) => {
  const u = me(req);
  const bal = await ledger.balances(u.id);
  const kpi = (await query(
    `SELECT
       COALESCE((SELECT SUM(amount) FROM ledger WHERE partner_id=$1 AND type='commission'
                  AND date_trunc('month',created_at)=date_trunc('month',now())),0) AS month,
       (SELECT COUNT(*) FROM clicks WHERE partner_id=$1 AND created_at>now()-interval '30 days') AS clicks30,
       (SELECT COUNT(*) FROM conversions WHERE partner_id=$1 AND created_at>now()-interval '30 days') AS conv30`,
    [u.id])).rows[0];
  const chart = (await query(
    `SELECT to_char(g,'MM') AS label,
       COALESCE((SELECT SUM(amount) FROM ledger WHERE partner_id=$1 AND type='commission'
                  AND date_trunc('month',created_at)=date_trunc('month',g)),0) AS value
     FROM generate_series(date_trunc('month',now())-interval '7 months', date_trunc('month',now()), interval '1 month') g
     ORDER BY g`, [u.id])).rows.map(r => ({ label: r.label, value: Number(r.value) }));
  const recent = await recentConversions(u.id, 8);
  res.json({ ok: true, kpis: {
    available: bal.available, month: Number(kpi.month),
    clicks30: Number(kpi.clicks30), conversions30: Number(kpi.conv30),
  }, chart, recentConversions: recent });
}));

async function recentConversions(partnerId, limit) {
  const { rows } = await query(
    `SELECT c.created_at::date AS date, COALESCE(p.name_en, p.name_ar, '—') AS product,
            c.client_name, c.deal_value, c.commission, c.via, c.status
     FROM conversions c LEFT JOIN products p ON p.id = c.product_id
     WHERE c.partner_id = $1 ORDER BY c.created_at DESC LIMIT $2`, [partnerId, limit]);
  return rows.map(r => ({ ...r, deal_value: Number(r.deal_value), commission: Number(r.commission) }));
}

router.get('/wallet', asyncH(async (req, res) => {
  const u = me(req);
  const bal = await ledger.balances(u.id);
  const tx = (await query(
    `SELECT created_at::date AS date, type, amount, memo, ref_type FROM ledger
     WHERE partner_id=$1 ORDER BY created_at DESC LIMIT 50`, [u.id])).rows.map(r => ({ ...r, amount: Number(r.amount) }));
  const s = await programSettings();
  res.json({ ok: true, balances: bal, transactions: tx,
    nextPayout: { min: s.min_payout, schedule: s.payout_schedule, method: u.payout_method || 'bank' } });
}));

router.get('/conversions', asyncH(async (req, res) => {
  res.json({ ok: true, conversions: await recentConversions(me(req).id, 100) });
}));

router.get('/links', asyncH(async (req, res) => {
  const u = me(req);
  const base = `${config.publicOrigin}/?ref=${u.ref_code}`;
  const custom = (await query(
    `SELECT l.id, l.name, l.campaign,
       (SELECT COUNT(*) FROM clicks c WHERE c.link_id = l.id) AS clicks
     FROM links l WHERE l.partner_id = $1 ORDER BY l.created_at`, [u.id])).rows;
  const totalClicks = (await query(`SELECT COUNT(*) n FROM clicks WHERE partner_id=$1`, [u.id])).rows[0].n;
  const totalConv = (await query(`SELECT COUNT(*) n FROM conversions WHERE partner_id=$1`, [u.id])).rows[0].n;
  res.json({ ok: true,
    refCode: u.ref_code, couponCode: u.coupon_code, defaultLink: base,
    totals: { clicks: Number(totalClicks), conversions: Number(totalConv) },
    links: custom.map(l => ({ id: l.id, name: l.name, url: base + (l.campaign ? '&c=' + encodeURIComponent(l.campaign) : ''), clicks: Number(l.clicks) })),
  });
}));

router.post('/links', asyncH(async (req, res) => {
  const u = me(req);
  const name = str((req.body || {}).name, { required: true, name: 'name', max: 80 });
  const campaign = (str((req.body || {}).campaign, { name: 'campaign', max: 40 }) || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const r = await query(`INSERT INTO links(partner_id, name, campaign) VALUES ($1,$2,$3) RETURNING id`, [u.id, name, campaign]);
  res.status(201).json({ ok: true, id: r.rows[0].id });
}));

router.get('/catalog', asyncH(async (req, res) => {
  const u = me(req);
  const rows = (await query(
    `SELECT slug, name_ar, name_en, kind, path, commission_pct FROM products WHERE promotable ORDER BY sort, id`)).rows;
  res.json({ ok: true, couponCode: u.coupon_code, products: rows.map(p => ({
    slug: p.slug, name_ar: p.name_ar, name_en: p.name_en, kind: p.kind,
    commissionPct: Number(p.commission_pct), url: deepLink(u, p.path),
  })) });
}));

router.get('/profile', asyncH(async (req, res) => {
  const u = me(req);
  res.json({ ok: true, profile: {
    name: u.name, email: u.email, phone: u.phone, company: u.company, lang: u.lang,
    payoutMethod: u.payout_method, iban: u.iban, accountHolder: u.account_holder,
  } });
}));

router.patch('/profile', asyncH(async (req, res) => {
  const b = req.body || {};
  const fields = {
    name: str(b.name, { name: 'name', max: 120 }),
    phone: str(b.phone, { name: 'phone', max: 40 }),
    company: str(b.company, { name: 'company', max: 160 }),
    lang: b.lang === 'en' ? 'en' : (b.lang === 'ar' ? 'ar' : null),
    payout_method: str(b.payoutMethod, { name: 'payoutMethod', max: 40 }),
    iban: str(b.iban, { name: 'iban', max: 34 }),
    account_holder: str(b.accountHolder, { name: 'accountHolder', max: 160 }),
  };
  const set = [], vals = [];
  for (const [k, v] of Object.entries(fields)) if (v != null) { vals.push(v); set.push(`${k}=$${vals.length}`); }
  if (set.length) { vals.push(me(req).id); await query(`UPDATE partners SET ${set.join(',')} WHERE id=$${vals.length}`, vals); }
  res.json({ ok: true });
}));

router.post('/payouts', asyncH(async (req, res) => {
  const u = me(req);
  const bal = await ledger.balances(u.id);
  const s = await programSettings();
  const min = Number(s.min_payout || 1000);
  const amount = num((req.body || {}).amount, { def: bal.available });
  if (amount < min) throw new HttpError(400, `Minimum withdrawal is ${min}`, 'below_min');
  if (amount > bal.available) throw new HttpError(400, 'Amount exceeds available balance', 'insufficient');
  const r = await query(
    `INSERT INTO payouts(partner_id, amount, method) VALUES ($1,$2,$3) RETURNING id, status, requested_at`,
    [u.id, amount, u.payout_method || 'bank']);
  res.status(201).json({ ok: true, payout: r.rows[0],
    note: 'Recorded. The actual transfer is executed by NX via bank after review.' });
}));

module.exports = router;
