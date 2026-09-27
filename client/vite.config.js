import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Defaults to the dev backend; E2E overrides this to the test backend.
      '/api': process.env.VITE_API_TARGET || 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Unit/component tests live under src/; e2e/ is Playwright's.
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
