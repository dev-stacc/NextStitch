import { NextRequest, NextResponse } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam, readJson } from '@/src/server/http'

type Params = { params: Promise<{ id: string; msId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, msId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const mid = parseIntParam(msId)
  if (mid == null) return notFound()
  const parsed = await readJson<UpsertMeasurementSetInput>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
  const updated = await getStore().measurementSets.updateForProject(access.projectId, mid, body)
  if (!updated) return notFound()
  getEventBus().notify(access.projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, msId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const mid = parseIntParam(msId)
  if (mid == null) return notFound()
  const ok = await getStore().measurementSets.removeForProject(access.projectId, mid)
  if (ok) getEventBus().notify(access.projectId)
  return ok ? noContent() : notFound()
}
