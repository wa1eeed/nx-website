-- NX Partners — schema (idempotent). Run via `npm run migrate`.

CREATE TABLE IF NOT EXISTS partners (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  phone          TEXT,
  company        TEXT,
  channel        TEXT,
  audience       TEXT,
  note           TEXT,
  password_hash  TEXT,
  ref_code       TEXT UNIQUE NOT NULL,
  coupon_code    TEXT UNIQUE,
  status         TEXT NOT NULL DEFAULT 'pending',   -- pending | active | suspended
  role           TEXT NOT NULL DEFAULT 'partner',   -- partner | admin
  lang           TEXT NOT NULL DEFAULT 'ar',
  payout_method  TEXT,
  iban           TEXT,
  account_holder TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  partner_id  INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  ip_hash     TEXT,
  ua          TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_partner ON sessions(partner_id);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  name_ar        TEXT,
  name_en        TEXT,
  kind           TEXT,                              -- service | solution | platform
  path           TEXT,                              -- e.g. /services/grow/
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 15,
  promotable     BOOLEAN NOT NULL DEFAULT true,
  sort           INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS links (
  id          SERIAL PRIMARY KEY,
  partner_id  INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name        TEXT,
  campaign    TEXT,                                 -- appended as &c=<campaign>
  product_id  INT REFERENCES products(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_links_partner ON links(partner_id);

CREATE TABLE IF NOT EXISTS clicks (
  id          BIGSERIAL PRIMARY KEY,
  partner_id  INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  link_id     INT REFERENCES links(id) ON DELETE SET NULL,
  ref_code    TEXT NOT NULL,
  ip_hash     TEXT,
  ua          TEXT,
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clicks_partner_time ON clicks(partner_id, created_at);

CREATE TABLE IF NOT EXISTS conversions (
  id           SERIAL PRIMARY KEY,
  partner_id   INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  product_id   INT REFERENCES products(id) ON DELETE SET NULL,
  client_name  TEXT,
  deal_value   NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission   NUMERIC(12,2) NOT NULL DEFAULT 0,
  via          TEXT,                                -- 'link' | coupon code
  status       TEXT NOT NULL DEFAULT 'pending',     -- pending | approved | rejected | reversed
  external_ref TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_conv_partner_time ON conversions(partner_id, created_at);
-- idempotency for webhook-created conversions
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conv_external ON conversions(external_ref) WHERE external_ref IS NOT NULL;

-- client requests from every site form. NX is B2B (no online checkout), so the
-- conversion event is a visitor submitting the contact form or a product request
-- form. When the visitor carries a referral code the lead is attributed to that
-- partner; a direct request has partner_id NULL and earns no commission — it still
-- lands in the admin «Requests» queue, tagged direct, so the team works one inbox.
-- This therefore holds contact details for all site leads, not only affiliate ones.
-- Sales later closes it → admin turns the lead into a conversion → commission.
CREATE TABLE IF NOT EXISTS leads (
  id            SERIAL PRIMARY KEY,
  partner_id    INT REFERENCES partners(id) ON DELETE CASCADE,   -- NULL = direct (unattributed)
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  company       TEXT,
  service       TEXT,                                -- service of interest (from the form)
  via           TEXT,                                -- 'link' | coupon code
  source_page   TEXT,                                -- page the form was submitted from
  ip_hash       TEXT,
  note          TEXT,                                -- free-text details from the request form
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,  -- the rest of the form's answers, as submitted
  deal_value    NUMERIC(12,2),                       -- recorded when the admin marks it won
  status        TEXT NOT NULL DEFAULT 'pending',     -- pending (awaiting) | won (paid → commission) | lost
  conversion_id INT REFERENCES conversions(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_leads_partner_time ON leads(partner_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_time ON leads(created_at);

-- upgrades for databases created before direct (unattributed) requests existed
ALTER TABLE leads ALTER COLUMN partner_id DROP NOT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value NUMERIC(12,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;

-- append-only commission ledger (money accounting only — never moves funds)
CREATE TABLE IF NOT EXISTS ledger (
  id          BIGSERIAL PRIMARY KEY,
  partner_id  INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                        -- commission | payout | reversal | adjustment
  amount      NUMERIC(12,2) NOT NULL,               -- signed: + credit, - debit
  ref_type    TEXT,
  ref_id      INT,
  memo        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ledger_partner ON ledger(partner_id);

CREATE TABLE IF NOT EXISTS payouts (
  id           SERIAL PRIMARY KEY,
  partner_id   INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL,
  method       TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',     -- pending | approved | paid | rejected
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  memo         TEXT
);
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);

CREATE TABLE IF NOT EXISTS settings (
  key    TEXT PRIMARY KEY,
  value  JSONB NOT NULL
);

-- program defaults (only inserted once)
INSERT INTO settings(key, value) VALUES
  ('program', '{"base_pct":15,"coupon_pct":10,"tier_growth_pct":18,"tier_elite_pct":22,"attribution_window_days":60,"min_payout":1000,"payout_schedule":"monthly","fraud_protection":true}')
ON CONFLICT (key) DO NOTHING;

-- product catalog = the real NX offerings (reference data, idempotent).
-- ON CONFLICT DO NOTHING preserves any rates an admin later edits.
INSERT INTO products(slug, name_ar, name_en, kind, path, commission_pct, sort) VALUES
  ('services/launch',                'NX Launch',        'NX Launch',              'service',  '/services/launch/',                15, 1),
  ('services/grow',                  'NX Grow',          'NX Grow',                'service',  '/services/grow/',                  15, 2),
  ('services/automation360',         'NX 360',           'NX 360',                 'service',  '/services/automation360/',         18, 3),
  ('services/connect',               'NX Connect',       'NX Connect',             'service',  '/services/connect/',               12, 4),
  ('services/scale',                 'NX Scale',         'NX Scale',               'service',  '/services/scale/',                 12, 5),
  ('solutions/fintech-open-banking', 'التقنية المالية',  'FinTech & Open Banking', 'solution', '/solutions/fintech-open-banking/', 20, 6),
  ('work/ibp',                       'IBP Insure',       'IBP Insure',             'platform', '/work/ibp/',                       18, 7),
  ('work/nqlah',                     'Nqlah',            'Nqlah',                  'platform', '/work/nqlah/',                     15, 8),
  ('work/nx-logistic',               'NX Logistic',      'NX Logistic',            'platform', '/work/nx-logistic/',               15, 9),
  ('work/iwork',                     'iWork',            'iWork',                  'platform', '/work/iwork/',                     18, 10)
ON CONFLICT (slug) DO NOTHING;

-- NX's own ready-to-launch products (the cards on /{lang}/solutions/). A path that
-- already carries a language segment is language-locked: deepLink() keeps it as-is
-- instead of prefixing the partner's language, so an EN partner still gets a live URL.
INSERT INTO products(slug, name_ar, name_en, kind, path, commission_pct, sort) VALUES
  ('solutions/plate-market', 'منصّة مزادات اللوحات المميّزة', 'Plate Auctions Platform', 'solution', '/ar/solutions/plate-market/', 20, 20)
ON CONFLICT (slug) DO NOTHING;

-- One-time catalog cleanup (guarded by a settings marker so an admin who later
-- re-enables one of these keeps their choice). Retires two kinds of entry from the
-- partner catalog: a solution whose page no longer exists, and the work/* case
-- studies — those are client platforms we built, not products a partner can sell.
-- They stay as rows because conversions reference them; they just stop being promotable.
-- Services left the partner catalogue: NX sells them itself, consultatively, so a
-- partner cannot meaningfully "refer" one as a product. Guarded the same way, and
-- the rows stay — an admin can make any of them promotable again from the console.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'migration_catalog_v3') THEN
    UPDATE products SET promotable = false WHERE kind = 'service';
    INSERT INTO settings(key, value) VALUES ('migration_catalog_v3', 'true');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'migration_catalog_v2') THEN
    UPDATE products SET promotable = false WHERE slug IN (
      'solutions/fintech-open-banking', 'work/ibp', 'work/nqlah', 'work/nx-logistic', 'work/iwork');
    INSERT INTO settings(key, value) VALUES ('migration_catalog_v2', 'true');
  END IF;
END $$;
