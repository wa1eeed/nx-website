'use strict';
/* Seed products (real catalog) + an admin, a demo partner, and sample history.
   Destructive: truncates partners + products (and everything that references them).
   Run after `npm run migrate`.  Passwords come from env (see .env.example). */
const { pool, query } = require('./pool');
const { hashPassword } = require('../lib/auth');

const PRODUCTS = [
  ['services/launch', 'NX Launch', 'NX Launch', 'service', '/services/launch/', 15, 1],
  ['services/grow', 'NX Grow', 'NX Grow', 'service', '/services/grow/', 15, 2],
  ['services/automation360', 'NX 360', 'NX 360', 'service', '/services/automation360/', 18, 3],
  ['services/connect', 'NX Connect', 'NX Connect', 'service', '/services/connect/', 12, 4],
  ['services/scale', 'NX Scale', 'NX Scale', 'service', '/services/scale/', 12, 5],
  ['solutions/fintech-open-banking', 'التقنية المالية', 'FinTech & Open Banking', 'solution', '/solutions/fintech-open-banking/', 20, 6],
  ['work/ibp', 'IBP Insure', 'IBP Insure', 'platform', '/work/ibp/', 18, 7],
  ['work/nqlah', 'Nqlah', 'Nqlah', 'platform', '/work/nqlah/', 15, 8],
  ['work/nx-logistic', 'NX Logistic', 'NX Logistic', 'platform', '/work/nx-logistic/', 15, 9],
  ['work/iwork', 'iWork', 'iWork', 'platform', '/work/iwork/', 18, 10],
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nx.sa';
  const adminPw = process.env.SEED_ADMIN_PASSWORD || 'change-me-admin';
  const partnerEmail = process.env.SEED_PARTNER_EMAIL || 'khalid@rawnaq.sa';
  const partnerPw = process.env.SEED_PARTNER_PASSWORD || 'change-me-partner';

  console.log('[seed] clearing partners + products…');
  await query('TRUNCATE partners, products RESTART IDENTITY CASCADE');

  console.log('[seed] products…');
  for (const p of PRODUCTS) {
    await query(
      `INSERT INTO products(slug,name_ar,name_en,kind,path,commission_pct,sort) VALUES ($1,$2,$3,$4,$5,$6,$7)`, p);
  }
  const prodId = {};
  (await query('SELECT id, slug FROM products')).rows.forEach(r => { prodId[r.slug] = r.id; });

  console.log('[seed] accounts…');
  const adminHash = await hashPassword(adminPw);
  const partnerHash = await hashPassword(partnerPw);

  const admin = (await query(
    `INSERT INTO partners(name,email,role,status,ref_code,lang,password_hash,approved_at)
     VALUES ('فريق الشراكات',$1,'admin','active','ADMIN-NX0','ar',$2,now()) RETURNING id`,
    [adminEmail, adminHash])).rows[0];

  const khalid = (await query(
    `INSERT INTO partners(name,email,phone,company,channel,role,status,ref_code,coupon_code,lang,password_hash,payout_method,approved_at)
     VALUES ('Khalid Al-Otaibi',$1,'+9665XXXXXXXX','Rawnaq Co.','LinkedIn','partner','active','KHALID-7Q2','KHALID10','ar',$2,'bank',now()) RETURNING id`,
    [partnerEmail, partnerHash])).rows[0];

  const others = [
    ['Sara Al-Ghamdi', 'sara@mostashar.co', 'Newsletter', 'active', 'SARA-4K1', 'SARA10'],
    ['Faisal Media', 'hi@faisal.media', 'YouTube', 'active', 'FAISAL-9M2', 'FAISAL10'],
    ['Noura Consulting', 'noura@nc.sa', 'Referrals', 'pending', 'NOURA-3P7', null],
    ['Tariq Dev', 'tariq@devs.io', 'Blog', 'pending', 'TARIQ-6B4', null],
    ['Old Agency', 'x@old.co', 'Agency', 'suspended', 'OLDAG-2Z9', 'OLD10'],
  ];
  const oid = {};
  for (const [name, email, channel, status, rc, cc] of others) {
    const r = await query(
      `INSERT INTO partners(name,email,channel,role,status,ref_code,coupon_code,lang,approved_at)
       VALUES ($1,$2,$3,'partner',$4,$5,$6,'ar', CASE WHEN $4='active' THEN now() END) RETURNING id`,
      [name, email, channel, status, rc, cc]);
    oid[email] = r.rows[0].id;
  }

  console.log('[seed] clicks…');
  // ~90 clicks for Khalid spread over the last 30 days
  for (let i = 0; i < 90; i++) {
    await query(
      `INSERT INTO clicks(partner_id, ref_code, ip_hash, ua, created_at)
       VALUES ($1,'KHALID-7Q2',$2,'seed', now() - ($3 || ' hours')::interval)`,
      [khalid.id, 'ip' + (i % 40), String(Math.floor(Math.random() * 720))]);
  }

  console.log('[seed] conversions + ledger history…');
  // helper: insert a conversion; if approved, post the commission to the ledger at the same date
  async function conv({ partner, slug, client, deal, via, status, daysAgo }) {
    const pid = prodId[slug];
    const pct = PRODUCTS.find(p => p[0] === slug)[5];
    const commission = Math.round(deal * pct) / 100;
    const c = (await query(
      `INSERT INTO conversions(partner_id,product_id,client_name,deal_value,commission,via,status,created_at,decided_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now()-($8||' days')::interval, CASE WHEN $7<>'pending' THEN now()-($8||' days')::interval END)
       RETURNING id`,
      [partner, pid, client, deal, commission, via, status, String(daysAgo)])).rows[0];
    if (status === 'approved') {
      await query(
        `INSERT INTO ledger(partner_id,type,amount,ref_type,ref_id,memo,created_at)
         VALUES ($1,'commission',$2,'conversion',$3,'seed', now()-($4||' days')::interval)`,
        [partner, commission, c.id, String(daysAgo)]);
    }
    return commission;
  }

  // history across ~8 months so the earnings chart shows a trend
  const hist = [
    ['services/grow', 'Rawnaq Co.', 24000, 'link', 'approved', 2],
    ['services/launch', 'Nujoom Studio', 12000, 'KHALID10', 'approved', 5],
    ['work/ibp', 'Wathiq Brokers', 16000, 'KHALID10', 'pending', 8],
    ['services/automation360', 'Madar Logistics', 31600, 'link', 'pending', 11],
    ['solutions/fintech-open-banking', 'Sadad Wallet', 52000, 'link', 'approved', 18],
    ['services/grow', 'Bin Talib Co.', 20000, 'link', 'approved', 46],
    ['work/iwork', 'Manafith', 28000, 'link', 'approved', 74],
    ['services/scale', 'Tawseel', 40000, 'link', 'approved', 103],
    ['services/grow', 'Qimam', 24000, 'link', 'approved', 132],
    ['solutions/fintech-open-banking', 'Lahza Pay', 45000, 'link', 'approved', 165],
    ['services/automation360', 'Awtad', 30000, 'link', 'approved', 195],
    ['services/launch', 'Basata', 12000, 'link', 'reversed', 205],
  ];
  for (const [slug, client, deal, via, status, daysAgo] of hist) {
    await conv({ partner: khalid.id, slug, client, deal, via, status, daysAgo });
  }
  // a couple for Sara so admin lists look alive
  await conv({ partner: oid['sara@mostashar.co'], slug: 'services/grow', client: 'Yaqeen', deal: 18000, via: 'link', status: 'approved', daysAgo: 6 });
  await conv({ partner: oid['faisal.media'] ? oid['faisal.media'] : oid['hi@faisal.media'], slug: 'work/nqlah', client: 'Darb', deal: 16000, via: 'link', status: 'approved', daysAgo: 9 });

  console.log('[seed] payouts…');
  // one already paid (ledger debit) + one pending request
  const paid = (await query(
    `INSERT INTO payouts(partner_id,amount,method,status,requested_at,decided_at)
     VALUES ($1,6000,'bank','paid', now()-interval '20 days', now()-interval '18 days') RETURNING id`, [khalid.id])).rows[0];
  await query(
    `INSERT INTO ledger(partner_id,type,amount,ref_type,ref_id,memo,created_at)
     VALUES ($1,'payout',-6000,'payout',$2,'seed paid (bank external)', now()-interval '18 days')`, [khalid.id, paid.id]);
  await query(`INSERT INTO payouts(partner_id,amount,method,status) VALUES ($1,4200,'bank','pending')`, [oid['sara@mostashar.co']]);

  console.log('[seed] done. admin=%s  partner=%s', adminEmail, partnerEmail);
  await pool.end();
}

main().catch(e => { console.error('[seed] failed:', e); process.exit(1); });
