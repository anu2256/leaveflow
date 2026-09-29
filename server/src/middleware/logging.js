'use strict';

const pinoHttp = require('pino-http');

// Structured JSON HTTP request logger (pino-http). Sensitive headers are
// redacted so bearer tokens and cookies never appear in the logs.
const httpLogger = pinoHttp({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
});

module.exports = { httpLogger };
