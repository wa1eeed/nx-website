'use strict';
const express = require('express');
const { query } = require('../db/pool');
const { asyncH } = require('../lib/http');

const router = express.Router();

// Public, non-secret program terms — so the marketing landing/estimator can show
// the REAL figures the admin set (no numbers hard-coded in the front-end).
router.get('/program', asyncH(async (_req, res) => {
  const r = await query(`SELECT value FROM settings WHERE key='program'`);
  const v = r.rows[0] ? r.rows[0].value : {};
  const n = (x) => (x == null || x === '' ? null : Number(x));
  res.json({ ok: true, program: {
    base_pct: n(v.base_pct),
    coupon_pct: n(v.coupon_pct),
    tier_growth_pct: n(v.tier_growth_pct),
    tier_elite_pct: n(v.tier_elite_pct),
    attribution_window_days: n(v.attribution_window_days),
    min_payout: n(v.min_payout),
    payout_schedule: v.payout_schedule || null,
  } });
}));

module.exports = router;
