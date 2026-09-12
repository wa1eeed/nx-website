'use strict';
require('dotenv').config();

const bool = v => v === true || v === 'true' || v === '1';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/nx_partners',

  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  ipSalt: process.env.IP_SALT || 'dev-ip-salt-change-me',
  webhookSecret: process.env.WEBHOOK_SECRET || 'dev-webhook-secret-change-me',

  publicOrigin: (process.env.PUBLIC_ORIGIN || 'https://nx.sa').replace(/\/$/, ''),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,

  // Transactional email (Resend). Without an API key the app still runs and the
  // reset flow still answers normally — it just cannot deliver, which is logged
  // loudly rather than surfaced to the visitor (telling them would leak whether
  // the address exists).
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'NX Partners <no-reply@server.nx.sa>',
  mailReplyTo: process.env.MAIL_REPLY_TO || 'hello@nx.sa',
  resetTokenMinutes: parseInt(process.env.RESET_TOKEN_MINUTES || '60', 10),

  cookieName: 'nx_sess',
  refCookie: 'nxaff',
  sessionDays: 30,
  attributionWindowDays: parseInt(process.env.ATTRIBUTION_WINDOW_DAYS || '60', 10),
};

config.isProd = config.env === 'production';
config.secureCookies = config.isProd; // Secure flag only over HTTPS in prod

// Fail fast in production if secrets were left at their dev defaults.
if (config.isProd) {
  for (const k of ['sessionSecret', 'ipSalt', 'webhookSecret']) {
    if (String(config[k]).startsWith('dev-')) {
      throw new Error(`Refusing to start in production with a default ${k}. Set a strong value.`);
    }
  }
}

module.exports = config;
