import { NextRequest, NextResponse } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireUser } from '@/src/server/auth-helpers'
import { json, noContent, notFound, parseIntParam, readJson } from '@/src/server/http'

type Params = { params: Promise<{ msId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId
  const { msId } = await ctx.params
  const mid = parseIntParam(msId)
  if (mid == null) return notFound()
    const parsed = await readJson<UpsertMeasurementSetInput>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
const updated = await getStore().measurementSets.updateGlobal(userId, mid, body)
  if (!updated) return notFound()
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId
  const { msId } = await ctx.params
  const mid = parseIntParam(msId)
  if (mid == null) return notFound()
  const ok = await getStore().measurementSets.removeGlobal(userId, mid)
  return ok ? noContent() : notFound()
}
