import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is required (e.g. in .env.local) for drizzle-kit commands.')
}

export default defineConfig({
  schema: './src/server/db/schema/index.ts',
  out: './src/server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  casing: 'snake_case',
})
