import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/api/**/*.ts', 'src/server/**/*.ts'],
      exclude: ['src/server/db/neon/**', 'src/server/db/client.ts', '**/schema/**'],
    },
  },
  resolve: {
    alias: [{ find: /^@\//, replacement: `${projectRoot}/` }],
  },
})
