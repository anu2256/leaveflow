'use strict';

// Playwright global setup: prepare the isolated leaveflow_test database so the
// E2E run is deterministic and independent — without ever touching the dev DB.
//
// It (1) refuses to run unless connected to leaveflow_test, (2) clears
// leave_requests and leave_balances, and (3) normalizes the Ishara and Ruwan
// password hashes to 'Password123!' so the UI logins in the test work. Only
// these two existing test users are updated; no rows are deleted from users.

const fs = require('fs');
const path = require('path');

const SERVER = path.join(__dirname, '..', '..', 'server');
const { Client } = require(path.join(SERVER, 'node_modules', 'pg'));
const bcrypt = require(path.join(SERVER, 'node_modules', 'bcrypt'));

function parseEnv(file) {
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim());
    if (match) out[match[1]] = match[2];
  }
  return out;
}

module.exports = async () => {
  const env = parseEnv(path.join(SERVER, '.env.test'));
  const connectionString = env.DATABASE_URL;

  if (!connectionString || !/\/leaveflow_test(\b|$)/.test(connectionString)) {
    throw new Error(
      'Refusing to run E2E setup: DATABASE_URL is not leaveflow_test'
    );
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const dbName = (await client.query('SELECT current_database() AS db'))
      .rows[0].db;
    if (dbName !== 'leaveflow_test') {
      throw new Error(`Refusing: connected to ${dbName}, not leaveflow_test`);
    }

    // Clean transactional state for a deterministic run.
    await client.query('DELETE FROM leave_balances');
    await client.query('DELETE FROM leave_requests');

    // Ensure the two UI logins used by the test work in the test DB.
    const hash = await bcrypt.hash('Password123!', 10);
    await client.query(
      `UPDATE users
          SET password_hash = $1
        WHERE email IN ('ishara@ceylonroots.lk', 'ruwan@ceylonroots.lk')`,
      [hash]
    );
  } finally {
    await client.end();
  }
};
