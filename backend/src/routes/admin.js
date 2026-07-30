'use strict';
const express = require('express');
const { query, tx } = require('../db/pool');
const { asyncH, HttpError, num, oneOf } = require('../lib/http');
const ledger = require('../services/ledger');

const router = express.Router();

router.get('/overview', asyncH(async (_req, res) => {
  const k = (await query(
    `SELECT
       (SELECT COUNT(*) FROM partners WHERE role='partner') AS total_partners,
       (SELECT COUNT(*) FROM partners WHERE status='pending') AS pending_partners,
       (SELECT COALESCE(SUM(amount),0) FROM ledger) AS commissions_due,
       (SELECT COUNT(*) FROM conversions WHERE created_at>now()-interval '30 days') AS conv30,
       (SELECT COUNT(*) FROM payouts WHERE status='pending') AS pending_payouts,
       (SELECT COUNT(*) FROM conversions WHERE status='pending') AS pending_conversions`)).rows[0];
  const chart = (await query(
    `SELECT to_char(g,'MM') AS label,
       (SELECT COUNT(*) FROM conversions WHERE date_trunc('month',created_at)=date_trunc('month',g)) AS value
     FROM generate_series(date_trunc('month',now())-interval '7 months', date_trunc('month',now()), interval '1 month') g
     ORDER BY g`)).rows.map(r => ({ label: r.label, value: Number(r.value) }));
  res.json({ ok: true, kpis: {
    totalPartners: Number(k.total_partners), commissionsDue: Number(k.commissions_due),
    pendingApprovals: Number(k.pending_partners), conversions30: Number(k.conv30),
  }, chart, needsAction: {
    joinRequests: Number(k.pending_partners), pendingPayouts: Number(k.pending_payouts),
    pendingConversions: Number(k.pending_conversions),
  } });
}));

router.get('/partners', asyncH(async (_req, res) => {
  const rows = (await query(
    `SELECT p.id, p.name, p.email, p.channel, p.coupon_code, p.status, p.created_at,
       (SELECT COUNT(*) FROM conversions c WHERE c.partner_id=p.id AND c.status='approved') AS conversions,
       COALESCE((SELECT SUM(amount) FROM ledger l WHERE l.partner_id=p.id AND l.type='commission'),0) AS earned
     FROM partners p WHERE p.role='partner' ORDER BY p.created_at DESC`)).rows;
  res.json({ ok: true, partners: rows.map(r => ({ ...r, conversions: Number(r.conversions), earned: Number(r.earned) })) });
}));

router.post('/partners/:id/:action', asyncH(async (req, res) => {
  const action = oneOf(req.params.action, ['approve', 'suspend', 'reinstate'], 'action');
  const id = parseInt(req.params.id, 10);
  const status = action === 'approve' ? 'active' : action === 'reinstate' ? 'active' : 'suspended';
  const r = await query(
    `UPDATE partners SET status=$1, approved_at=COALESCE(approved_at, CASE WHEN $1='active' THEN now() END)
     WHERE id=$2 AND role='partner' RETURNING id, status`, [status, id]);
  if (!r.rows[0]) throw new HttpError(404, 'Partner not found', 'not_found');
  res.json({ ok: true, partner: r.rows[0] });
}));

router.get('/conversions', asyncH(async (_req, res) => {
  const rows = (await query(
    `SELECT c.id, c.created_at::date AS date, pt.name AS partner, COALESCE(p.name_en,p.name_ar,'—') AS product,
            c.client_name, c.deal_value, c.commission, c.via, c.status
     FROM conversions c JOIN partners pt ON pt.id=c.partner_id LEFT JOIN products p ON p.id=c.product_id
     ORDER BY c.created_at DESC LIMIT 200`)).rows;
  res.json({ ok: true, conversions: rows.map(r => ({ ...r, deal_value: Number(r.deal_value), commission: Number(r.commission) })) });
}));

router.post('/conversions/:id/:action', asyncH(async (req, res) => {
  const action = oneOf(req.params.action, ['approve', 'reject', 'reverse'], 'action');
  const id = parseInt(req.params.id, 10);
  const out = await tx(async (db) => {
    if (action === 'approve') {
      const r = await db.query(`UPDATE conversions SET status='approved', decided_at=now() WHERE id=$1 AND status='pending' RETURNING partner_id, commission`, [id]);
      if (r.rows[0]) await ledger.post(db, { partnerId: r.rows[0].partner_id, type: 'commission', amount: Number(r.rows[0].commission), refType: 'conversion', refId: id, memo: 'Conversion approved' });
      return r.rows[0];
    }
    if (action === 'reverse') {
      const r = await db.query(`UPDATE conversions SET status='reversed', decided_at=now() WHERE id=$1 AND status='approved' RETURNING partner_id, commission`, [id]);
      if (r.rows[0]) await ledger.post(db, { partnerId: r.rows[0].partner_id, type: 'reversal', amount: -Number(r.rows[0].commission), refType: 'conversion', refId: id, memo: 'Conversion reversed' });
      return r.rows[0];
    }
    const r = await db.query(`UPDATE conversions SET status='rejected', decided_at=now() WHERE id=$1 AND status='pending' RETURNING partner_id`, [id]);
    return r.rows[0];
  });
  if (!out) throw new HttpError(409, 'Conversion not in a state for this action', 'conflict');
  res.json({ ok: true });
}));

router.get('/leads', asyncH(async (_req, res) => {
  const rows = (await query(
    `SELECT l.id, l.created_at::date AS date, pt.name AS partner, l.name AS client_name,
            l.email, l.phone, l.company, l.service, l.via, l.source_page, l.status
     FROM leads l JOIN partners pt ON pt.id = l.partner_id
     ORDER BY l.created_at DESC LIMIT 200`)).rows;
  res.json({ ok: true, leads: rows });
}));

router.get('/offers', asyncH(async (_req, res) => {
  const rows = (await query(`SELECT id, slug, name_ar, name_en, kind, commission_pct, promotable FROM products ORDER BY sort, id`)).rows;
  res.json({ ok: true, offers: rows.map(r => ({ ...r, commission_pct: Number(r.commission_pct) })) });
}));

router.patch('/offers/:id', asyncH(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pct = num((req.body || {}).commissionPct, { min: 0, max: 100, def: 15 });
  const promotable = (req.body || {}).promotable !== false;
  const r = await query(`UPDATE products SET commission_pct=$1, promotable=$2 WHERE id=$3 RETURNING id`, [pct, promotable, id]);
  if (!r.rows[0]) throw new HttpError(404, 'Product not found', 'not_found');
  res.json({ ok: true });
}));

router.get('/payouts', asyncH(async (_req, res) => {
  const rows = (await query(
    `SELECT po.id, po.requested_at::date AS date, pt.name AS partner, po.method, po.amount, po.status
     FROM payouts po JOIN partners pt ON pt.id=po.partner_id ORDER BY po.requested_at DESC LIMIT 200`)).rows;
  res.json({ ok: true, payouts: rows.map(r => ({ ...r, amount: Number(r.amount) })) });
}));

router.post('/payouts/:id/:action', asyncH(async (req, res) => {
  const action = oneOf(req.params.action, ['approve', 'paid', 'reject'], 'action');
  const id = parseInt(req.params.id, 10);
  const out = await tx(async (db) => {
    if (action === 'approve') return (await db.query(`UPDATE payouts SET status='approved', decided_at=now() WHERE id=$1 AND status='pending' RETURNING id`, [id])).rows[0];
    if (action === 'reject') return (await db.query(`UPDATE payouts SET status='rejected', decided_at=now() WHERE id=$1 AND status IN ('pending','approved') RETURNING id`, [id])).rows[0];
    // paid: record the debit in the ledger (does NOT move money — the bank transfer is external)
    const r = await db.query(`UPDATE payouts SET status='paid', decided_at=now() WHERE id=$1 AND status IN ('pending','approved') RETURNING partner_id, amount`, [id]);
    if (r.rows[0]) await ledger.post(db, { partnerId: r.rows[0].partner_id, type: 'payout', amount: -Number(r.rows[0].amount), refType: 'payout', refId: id, memo: 'Payout marked paid (bank transfer external)' });
    return r.rows[0];
  });
  if (!out) throw new HttpError(409, 'Payout not in a state for this action', 'conflict');
  res.json({ ok: true });
}));

router.get('/settings', asyncH(async (_req, res) => {
  const r = await query(`SELECT value FROM settings WHERE key='program'`);
  res.json({ ok: true, settings: r.rows[0] ? r.rows[0].value : {} });
}));

router.put('/settings', asyncH(async (req, res) => {
  const b = req.body || {};
  const cur = (await query(`SELECT value FROM settings WHERE key='program'`)).rows[0]?.value || {};
  const merged = {
    base_pct: num(b.base_pct, { min: 0, max: 100, def: cur.base_pct ?? 15 }),
    coupon_pct: num(b.coupon_pct, { min: 0, max: 100, def: cur.coupon_pct ?? 10 }),
    tier_growth_pct: num(b.tier_growth_pct, { min: 0, max: 100, def: cur.tier_growth_pct ?? 18 }),
    tier_elite_pct: num(b.tier_elite_pct, { min: 0, max: 100, def: cur.tier_elite_pct ?? 22 }),
    attribution_window_days: num(b.attribution_window_days, { min: 1, max: 365, def: cur.attribution_window_days ?? 60 }),
    min_payout: num(b.min_payout, { min: 0, def: cur.min_payout ?? 1000 }),
    payout_schedule: ['monthly', 'biweekly', 'quarterly'].includes(b.payout_schedule) ? b.payout_schedule : (cur.payout_schedule || 'monthly'),
    fraud_protection: b.fraud_protection !== false,
  };
  await query(`INSERT INTO settings(key,value) VALUES('program',$1) ON CONFLICT (key) DO UPDATE SET value=$1`, [JSON.stringify(merged)]);
  res.json({ ok: true, settings: merged });
}));

module.exports = router;
