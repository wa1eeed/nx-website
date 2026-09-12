'use strict';
const config = require('./config');
const { query } = require('./db/pool');
const { HttpError } = require('./lib/http');

// Attach req.user from the session cookie (if valid + unexpired).
//
// There are two cookies, and a browser may hold both: an administrator working the
// console and a partner account open in the same window are different identities,
// not two views of one. Which cookie applies is decided by what is being asked for
// — anything under /api/admin reads the admin session, everything else the
// partner's — so neither can stand in for the other by accident.
async function sessionFor(req, cookieName) {
  const tok = req.cookies && req.cookies[cookieName];
  if (!tok) return null;
  const { rows } = await query(
    `SELECT p.* FROM sessions s JOIN partners p ON p.id = s.partner_id
     WHERE s.token = $1 AND s.expires_at > now()`, [tok]);
  return rows[0] || null;
}

async function loadUser(req, _res, next) {
  try {
    const wantsAdmin = req.path.startsWith('/api/admin')
      || (req.path === '/api/auth/me' && req.query.scope === 'admin')
      || (req.path === '/api/auth/logout' && req.query.scope === 'admin');
    req.sessionScope = wantsAdmin ? 'admin' : 'partner';
    req.user = await sessionFor(req, wantsAdmin ? config.adminCookieName : config.cookieName);
  } catch (e) { /* ignore — treated as anonymous */ }
  next();
}

const requireAuth = (req, _res, next) =>
  req.user ? next() : next(new HttpError(401, 'Login required', 'unauthorized'));

const requireAdmin = (req, _res, next) =>
  (req.user && req.user.role === 'admin') ? next() : next(new HttpError(403, 'Admin only', 'forbidden'));

// CSRF-lite: for state-changing requests, the Origin (if present) must be an allowed host.
function originGuard(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // non-browser client (curl, server-to-server)
  let host;
  try { host = new URL(origin).host; } catch (_) { return next(new HttpError(403, 'Bad origin', 'forbidden')); }
  const allowed = new Set([req.get('host')]);
  try { allowed.add(new URL(config.publicOrigin).host); } catch (_) {}
  return allowed.has(host) ? next() : next(new HttpError(403, 'Bad origin', 'forbidden'));
}

// Minimal CORS for the marketing-site origin, with credentials (cookies).
function cors(req, res, next) {
  const origin = req.get('origin');
  let allow = null;
  try { if (origin && new URL(origin).host === new URL(config.publicOrigin).host) allow = origin; } catch (_) {}
  if (allow) {
    res.set('Access-Control-Allow-Origin', allow);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ ok: false, error: err.message || 'Server error', code: err.code || 'error' });
}

module.exports = { loadUser, requireAuth, requireAdmin, originGuard, cors, errorHandler };
