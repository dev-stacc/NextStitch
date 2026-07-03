'use server'

import { neon } from '@neondatabase/serverless'

// TODO: this file is unused — the app talks to Neon via the DataStore repos in
// src/server/db. Delete or replace with a real server action if needed.
export async function getData() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const sql = neon(url)
  const data = await sql`SELECT 1 AS ok`
  return data
}
