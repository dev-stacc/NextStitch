import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getDb } from '@/src/server/db/client'
import { users } from '@/src/server/db/schema'
import { badRequest, json } from '@/src/server/http'

interface Body {
  email?: string
  password?: string
  name?: string
}

const MIN_PASSWORD_LENGTH = 8
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const name = String(body.name ?? '').trim() || null

  if (!EMAIL_RE.test(email)) return badRequest('Invalid email')
  if (password.length < MIN_PASSWORD_LENGTH) {
    return badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  const db = getDb()
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email))
  if (existing) return badRequest('Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const [created] = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning({ id: users.id, email: users.email, name: users.name })

  return json(created, 201)
}
