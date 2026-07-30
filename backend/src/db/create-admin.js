'use strict';
/* Non-destructive admin bootstrap for production.
   Usage:  node src/db/create-admin.js <email> <password> [full name]
   Creates a new active admin, or promotes/updates the password of an
   existing account with that email. Does NOT touch any other data. */
const { pool, query } = require('./pool');
const { hashPassword } = require('../lib/auth');
const { refCode } = require('../lib/ids');

async function main() {
  const email = (process.argv[2] || '').toLowerCase();
  const password = process.argv[3] || '';
  const name = process.argv.slice(4).join(' ') || 'NX Admin';
  if (!email || !password) {
    console.error('Usage: node src/db/create-admin.js <email> <password> [full name]');
    process.exit(1);
  }
  if (password.length < 8) { console.error('Password must be at least 8 characters.'); process.exit(1); }

  const hash = await hashPassword(password);
  const existing = (await query('SELECT id FROM partners WHERE email=$1', [email])).rows[0];

  if (existing) {
    await query(
      `UPDATE partners SET password_hash=$1, role='admin', status='active',
         approved_at=COALESCE(approved_at, now()) WHERE id=$2`, [hash, existing.id]);
    console.log('Updated existing account → active admin:', email);
  } else {
    let done = false;
    for (let i = 0; i < 8 && !done; i++) {
      try {
        await query(
          `INSERT INTO partners(name,email,role,status,ref_code,lang,password_hash,approved_at)
           VALUES ($1,$2,'admin','active',$3,'ar',$4,now())`, [name, email, refCode(name), hash]);
        done = true;
      } catch (e) { if (e.code === '23505' && i < 7) continue; throw e; }
    }
    console.log('Created admin:', email);
  }
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
