'use strict';
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const mw = require('./middleware');

const app = express();
app.set('trust proxy', 1); // behind nginx / Coolify — required for correct req.ip
app.disable('x-powered-by');

app.use(helmet({ contentSecurityPolicy: false })); // JSON API; CSP handled by the site
app.use(mw.cors);
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60 * 1000, max: 240, standardHeaders: true, legacyHeaders: false }));
app.use(mw.loadUser);
app.use(mw.originGuard);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'nx-partners', env: config.env, time: new Date().toISOString() }));

app.use('/api', require('./routes/public'));          // GET /api/program (public terms)
app.use('/api/auth', require('./routes/auth'));
app.use('/', require('./routes/track'));                              // /r + /track/conversion
app.use('/api/partner', mw.requireAuth, require('./routes/partner'));
app.use('/api/admin', mw.requireAuth, mw.requireAdmin, require('./routes/admin'));

app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found', code: 'not_found' }));
app.use(mw.errorHandler);

module.exports = app;
