import { NextRequest } from 'next/server'
import type { CreateProjectInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { getCurrentUserId } from '@/src/server/auth-helpers'
import { badRequest, json, readJson, unauthorized } from '@/src/server/http'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return unauthorized()
  return json(await getStore().projects.list(userId))
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return unauthorized()
  const parsed = await readJson<CreateProjectInput>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
  if (!body?.name?.trim()) return badRequest('name is required')
  return json(await getStore().projects.create(userId, body), 201)
}
