import { NextRequest, NextResponse } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireUser } from '@/src/server/auth-helpers'
import { badRequest, json } from '@/src/server/http'

export async function GET() {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId
  return json(await getStore().measurementSets.listGlobal(userId))
}

export async function POST(req: NextRequest) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId
  const body = (await req.json()) as UpsertMeasurementSetInput
  if (!body?.name?.trim()) return badRequest('name is required')
  return json(await getStore().measurementSets.createGlobal(userId, body), 201)
}
