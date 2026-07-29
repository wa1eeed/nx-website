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
