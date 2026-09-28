import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER = path.join(dirname, '..', 'server')

// Read the isolated test-database connection from server/.env.test without
// hardcoding secrets in this file.
function parseEnv(file) {
  const out = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim())
    if (match) out[match[1]] = match[2]
  }
  return out
}

const testEnv = parseEnv(path.join(SERVER, '.env.test'))

const API_PORT = 4100
const CLIENT_PORT = 5174

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.cjs',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${CLIENT_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    // Use the locally installed Google Chrome ('channel') because this
    // environment cannot reach Playwright's browser CDN (cdn.playwright.dev).
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
  webServer: [
    {
      // Isolated API instance pointed at leaveflow_test (dev backend on 4000
      // is left untouched).
      command: 'node src/server.js',
      cwd: SERVER,
      port: API_PORT,
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        PORT: String(API_PORT),
        DATABASE_URL: testEnv.DATABASE_URL,
        JWT_SECRET: testEnv.JWT_SECRET,
      },
    },
    {
      // Isolated Vite dev server that proxies /api to the test API above.
      command: `npm run dev -- --port ${CLIENT_PORT} --strictPort`,
      cwd: dirname,
      port: CLIENT_PORT,
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        VITE_API_TARGET: `http://localhost:${API_PORT}`,
      },
    },
  ],
})
