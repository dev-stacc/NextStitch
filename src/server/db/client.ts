import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export type Db = ReturnType<typeof buildDb>

function buildDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return drizzle(neon(url), { schema })
}

const globalKey = Symbol.for('next-stitch.neonDb')
type WithDb = typeof globalThis & { [key: symbol]: Db | undefined }

export function getDb(): Db {
  const g = globalThis as WithDb
  if (!g[globalKey]) g[globalKey] = buildDb()
  return g[globalKey]!
}
