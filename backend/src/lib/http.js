'use strict';

// Wrap async route handlers so thrown errors reach the error middleware.
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || 'error';
  }
}
const bad = (m) => { throw new HttpError(400, m, 'bad_request'); };

// --- tiny validators (throw HttpError 400 on failure) ---
function str(v, { min = 0, max = 2000, required = false, name = 'field' } = {}) {
  if (v == null || v === '') { if (required) bad(name + ' is required'); return null; }
  if (typeof v !== 'string') bad(name + ' must be text');
  v = v.trim();
  if (v.length < min) bad(name + ' is too short');
  if (v.length > max) v = v.slice(0, max);
  return v;
}
function email(v, { required = true } = {}) {
  v = str(v, { required, name: 'email', max: 200 });
  if (v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) bad('invalid email');
  return v ? v.toLowerCase() : v;
}
function num(v, { min, max, def = 0 } = {}) {
  let n = typeof v === 'number' ? v : parseFloat(v);
  if (Number.isNaN(n)) n = def;
  if (min != null && n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}
function oneOf(v, allowed, name = 'value') {
  if (!allowed.includes(v)) bad(name + ' must be one of: ' + allowed.join(', '));
  return v;
}

module.exports = { asyncH, HttpError, bad, str, email, num, oneOf };
