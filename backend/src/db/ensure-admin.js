'use strict';
// Bootstrap an admin from env vars on boot — no terminal needed.
// Set ADMIN_EMAIL + ADMIN_PASSWORD in the environment; on startup this creates
// the admin (or promotes/updates that email to an active admin). Idempotent.
// The env is the source of truth: while ADMIN_PASSWORD is set, it's re-asserted
// each boot. Remove ADMIN_PASSWORD to stop managing the password via env.
const { query } = require('./pool');
const { hashPassword } = require('../lib/auth');
const { refCode } = require('../lib/ids');

async function ensureAdminFromEnv() {
  const email = String(process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) return; // nothing to do
  if (password.length < 8) { console.warn('[admin] ADMIN_PASSWORD too short (<8) — skipping bootstrap'); return; }

  const hash = await hashPassword(password);
  const existing = (await query('SELECT id FROM partners WHERE email=$1', [email])).rows[0];
  if (existing) {
    await query(
      `UPDATE partners SET password_hash=$1, role='admin', status='active',
         approved_at=COALESCE(approved_at, now()) WHERE id=$2`, [hash, existing.id]);
    console.log('[admin] bootstrap: ensured admin (updated) →', email);
    return;
  }
  for (let i = 0; i < 8; i++) {
    try {
      await query(
        `INSERT INTO partners(name,email,role,status,ref_code,lang,password_hash,approved_at)
         VALUES ($1,$2,'admin','active',$3,'ar',$4,now())`,
        [process.env.ADMIN_NAME || 'NX Admin', email, refCode('NX Admin'), hash]);
      console.log('[admin] bootstrap: created admin →', email);
      return;
    } catch (e) { if (e.code === '23505' && i < 7) continue; throw e; }
  }
}

module.exports = { ensureAdminFromEnv };
