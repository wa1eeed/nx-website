'use strict';
const express = require('express');
const { query, tx } = require('../db/pool');
const { asyncH, HttpError, str, num, oneOf } = require('../lib/http');
const ledger = require('../services/ledger');
const config = require('../config');
const { send, status: mailStatus, leadDecisionMail, commissionMail } = require('../services/mailer');

const router = express.Router();

router.get('/overview', asyncH(async (_req, res) => {
  const k = (await query(
    `SELECT
       (SELECT COUNT(*) FROM partners WHERE role='partner') AS total_partners,
       (SELECT COUNT(*) FROM partners WHERE status='pending') AS pending_partners,
       (SELECT COALESCE(SUM(amount),0) FROM ledger) AS commissions_due,
       (SELECT COUNT(*) FROM conversions WHERE created_at>now()-interval '30 days') AS conv30,
       (SELECT COUNT(*) FROM payouts WHERE status='pending') AS pending_payouts,
       (SELECT COUNT(*) FROM conversions WHERE status='pending') AS pending_conversions,
       (SELECT COUNT(*) FROM leads WHERE status='pending') AS pending_leads`)).rows[0];
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
    pendingConversions: Number(k.pending_conversions), pendingLeads: Number(k.pending_leads),
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

// The requests queue. LEFT JOIN because a direct request (no referral code) has no
// partner — it still belongs in this queue; it just earns nobody a commission.
router.get('/leads', asyncH(async (_req, res) => {
  const rows = (await query(
    `SELECT l.id, l.created_at::date AS date, l.created_at AS submitted_at, l.decided_at,
            pt.id AS partner_id, pt.name AS partner, pt.ref_code AS partner_ref,
            pt.coupon_code AS partner_coupon, pt.email AS partner_email,
            l.name AS client_name, l.email, l.phone, l.company, l.service, l.via,
            l.source_page, l.note, l.meta, l.status,
            COALESCE(c.deal_value, l.deal_value, 0) AS deal_value, COALESCE(c.commission, 0) AS commission
     FROM leads l LEFT JOIN partners pt ON pt.id = l.partner_id
     LEFT JOIN conversions c ON c.id = l.conversion_id
     ORDER BY l.created_at DESC LIMIT 200`)).rows;
  res.json({ ok: true, leads: rows.map(r => ({ ...r, deal_value: Number(r.deal_value), commission: Number(r.commission) })) });
}));

// Map a form's service code to a product slug (best-effort; admin can override).
const SERVICE_TO_SLUG = {
  launch: 'services/launch', grow: 'services/grow', auto: 'services/automation360',
  connect: 'services/connect', scale: 'services/scale',
  'plate-market': 'solutions/plate-market',
};

// Admin decides a lead. 'won' verifies the customer paid → creates an APPROVED
// conversion + credits the commission ledger in one transaction. 'lost' closes it
// with no commission. 'reopen' returns a lost lead to pending (never a won one —
// reversing money goes through the conversion, not here).
router.post('/leads/:id/:action', asyncH(async (req, res) => {
  const action = oneOf(req.params.action, ['won', 'lost', 'reopen'], 'action');
  const id = parseInt(req.params.id, 10);
  const b = req.body || {};

  const out = await tx(async (db) => {
    const lead = (await db.query(`SELECT * FROM leads WHERE id=$1 FOR UPDATE`, [id])).rows[0];
    if (!lead) return { err: [404, 'Lead not found', 'not_found'] };

    if (action === 'lost') {
      if (lead.status === 'won') return { err: [409, 'A won lead cannot be marked lost — reverse its conversion instead', 'conflict'] };
      await db.query(`UPDATE leads SET status='lost', decided_at=now() WHERE id=$1`, [id]);
      return { ok: true, status: 'lost', lead, notify: 'client' };
    }
    if (action === 'reopen') {
      if (lead.status === 'won') return { err: [409, 'A won lead cannot be reopened here — reverse its conversion first', 'conflict'] };
      await db.query(`UPDATE leads SET status='pending', decided_at=NULL WHERE id=$1`, [id]);
      return { ok: true, status: 'pending' };
    }
    // won
    if (lead.status === 'won') return { err: [409, 'Lead is already won', 'conflict'] };
    const dealValue = num(b.deal_value, { min: 0, def: 0 });
    if (dealValue <= 0) return { err: [400, 'deal_value is required to mark a lead won', 'bad_request'] };

    // A direct request has no partner: close it with the deal value on record, but
    // create no conversion and credit no ledger — there is nobody to pay.
    if (!lead.partner_id) {
      await db.query(`UPDATE leads SET status='won', deal_value=$1, decided_at=now() WHERE id=$2`, [dealValue, id]);
      return { ok: true, status: 'won', commission: 0, direct: true, lead, notify: 'client' };
    }

    const slug = (b.product && String(b.product)) || SERVICE_TO_SLUG[lead.service] || null;
    const prod = slug
      ? (await db.query(`SELECT id, commission_pct FROM products WHERE slug=$1 OR path=$1`, [slug])).rows[0]
      : null;
    const pct = prod ? Number(prod.commission_pct) : 15;
    const commission = Math.round(dealValue * pct) / 100;
    const conv = (await db.query(
      `INSERT INTO conversions(partner_id, product_id, client_name, deal_value, commission, via, status, decided_at)
       VALUES ($1,$2,$3,$4,$5,$6,'approved',now()) RETURNING id`,
      [lead.partner_id, prod ? prod.id : null, lead.name, dealValue, commission, lead.via || 'link'])).rows[0];
    await ledger.post(db, { partnerId: lead.partner_id, type: 'commission', amount: commission,
      refType: 'lead', refId: id, memo: 'Lead won — commission credited' });
    await db.query(`UPDATE leads SET status='won', conversion_id=$1, deal_value=$2, decided_at=now() WHERE id=$3`, [conv.id, dealValue, id]);
    const partner = (await db.query(`SELECT name, email, lang FROM partners WHERE id=$1`, [lead.partner_id])).rows[0];
    return { ok: true, status: 'won', commission, lead, partner, notify: 'client+partner' };
  });

  if (out.err) throw new HttpError(out.err[0], out.err[1], out.err[2]);

  // Mail after the transaction commits, and never blocking the response: the
  // money is already booked, and a mail outage must not make the admin think the
  // decision failed and click again.
  notifyLeadDecision(out, str(b.message, { name: 'message', max: 1500 }))
    .catch(e => console.error('[notify] lead decision failed:', e.message));

  const { lead, partner, notify, ...body } = out;
  res.json(body);
}));

// The client hears what was decided (with the admin's own words, if they wrote
// any), and a partner whose client paid hears what they earned.
async function notifyLeadDecision(out, message) {
  if (!out.notify || !out.lead) return;
  const lead = out.lead;
  if (lead.email) {
    const lang = (lead.meta && lead.meta.language) === 'en' ? 'en' : 'ar';
    await send({ to: lead.email, ...leadDecisionMail({ lang, lead, status: out.status, message }) });
  }
  if (out.notify === 'client+partner' && out.partner && out.partner.email) {
    const portalUrl = `${config.publicOrigin}/${out.partner.lang === 'en' ? 'en' : 'ar'}/affiliate/portal/`;
    await send({ to: out.partner.email, ...commissionMail({
      lang: out.partner.lang, partner: out.partner, clientName: lead.name,
      service: lead.service, amount: out.commission, portalUrl }) });
  }
}

// Is outbound mail actually working? The reset flow answers 200 whatever happens,
// so without this an operator has no way to tell a delivered email from a missing
// API key. Reports configuration and the last outcome — never the key itself.
router.get('/mail-status', asyncH(async (_req, res) => {
  res.json({ ok: true, mail: mailStatus() });
}));

// Send a real message to the signed-in admin. The only honest way to prove the
// whole chain — key, verified domain, From address — actually delivers.
router.post('/mail-test', asyncH(async (req, res) => {
  const to = req.user.email;
  const r = await send({
    to,
    subject: 'NX Partners — mail test',
    html: '<p style="font:400 15px/1.7 -apple-system,Segoe UI,Tahoma,sans-serif">This is a test from the NX Partners admin console. If you are reading it, outbound email works.</p>',
    text: 'This is a test from the NX Partners admin console. If you are reading it, outbound email works.',
  });
  res.json({ ok: true, to, delivered: !!r.ok, detail: mailStatus().lastError });
}));

router.get('/offers', asyncH(async (_req, res) => {
  const rows = (await query(`SELECT id, slug, name_ar, name_en, kind, path, commission_pct, promotable, sort FROM products ORDER BY sort, id`)).rows;
  res.json({ ok: true, offers: rows.map(r => ({ ...r, commission_pct: Number(r.commission_pct) })) });
}));

// Site path → catalogue slug. A page lives at /{lang}/solutions/plate-market/ and its
// slug is the part after the language segment, which is also what SERVICE_TO_SLUG and
// the conversion webhook look up. Accepts either spelling from the admin form.
function normalisePath(input) {
  let path = String(input || '').trim();
  if (!path) return null;
  if (!path.startsWith('/')) path = '/' + path;
  if (!path.endsWith('/')) path += '/';
  if (/[\r\n\t]/.test(path) || path.startsWith('//')) throw new HttpError(400, 'Invalid path', 'bad_request');
  return path;
}
const slugOf = (path) => path.replace(/^\/(ar|en)\//, '/').replace(/^\/|\/$/g, '');

// Add a product to the partner catalogue. This is the only way a new solution reaches
// partners: publishing a card on /{lang}/solutions/ does not register it here, because
// the catalogue also carries a commission rate and a promotable flag that only the
// partnerships team decides. A path that keeps its language segment (e.g.
// /ar/solutions/…) marks the product as available in that language only.
router.post('/offers', asyncH(async (req, res) => {
  const b = req.body || {};
  const path = normalisePath(b.path);
  if (!path) throw new HttpError(400, 'path is required', 'bad_request');
  const nameAr = str(b.nameAr, { name: 'nameAr', max: 160 });
  const nameEn = str(b.nameEn, { name: 'nameEn', max: 160 });
  if (!nameAr && !nameEn) throw new HttpError(400, 'A name is required', 'bad_request');
  const kind = oneOf(b.kind || 'solution', ['service', 'solution', 'platform'], 'kind');
  const slug = str(b.slug, { name: 'slug', max: 120 }) || slugOf(path);
  const pct = num(b.commissionPct, { min: 0, max: 100, def: 15 });
  const promotable = b.promotable !== false;

  try {
    const r = await query(
      `INSERT INTO products(slug, name_ar, name_en, kind, path, commission_pct, promotable, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE((SELECT MAX(sort) FROM products), 0) + 1)
       RETURNING id, slug`,
      [slug, nameAr || nameEn, nameEn || nameAr, kind, path, pct, promotable]);
    res.status(201).json({ ok: true, product: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'A product with this slug already exists', 'conflict');
    throw e;
  }
}));

router.patch('/offers/:id', asyncH(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const b = req.body || {};
  const pct = num(b.commissionPct, { min: 0, max: 100, def: 15 });
  const promotable = b.promotable !== false;
  // name/path are optional on edit — left out, the stored values stand.
  const nameAr = str(b.nameAr, { name: 'nameAr', max: 160 });
  const nameEn = str(b.nameEn, { name: 'nameEn', max: 160 });
  const path = b.path === undefined ? null : normalisePath(b.path);
  const r = await query(
    `UPDATE products SET commission_pct=$1, promotable=$2,
       name_ar=COALESCE($3, name_ar), name_en=COALESCE($4, name_en), path=COALESCE($5, path)
     WHERE id=$6 RETURNING id`, [pct, promotable, nameAr, nameEn, path, id]);
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
