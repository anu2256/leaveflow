'use strict';

const path = require('path');

// Load the test-database environment BEFORE any test file requires
// src/db/pool.js. Jest runs `setupFiles` prior to loading the test
// modules, so process.env.DATABASE_URL is already pointed at
// leaveflow_test by the time pool.js is imported.
//
// `override: true` ensures these values win even if a DATABASE_URL is
// already present in the environment, and pool.js's own later
// dotenv.config() (which reads .env without override) cannot clobber them.
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.test'),
  override: true,
});
