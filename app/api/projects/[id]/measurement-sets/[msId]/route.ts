import { NextRequest } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; msId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, msId } = await ctx.params
  const projectId = parseIntParam(id)
  const mid = parseIntParam(msId)
  if (projectId == null || mid == null) return notFound()
  const body = (await req.json()) as UpsertMeasurementSetInput
  const updated = await getStore().measurementSets.updateForProject(projectId, mid, body)
  if (!updated) return notFound()
  getEventBus().notify(projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, msId } = await ctx.params
  const projectId = parseIntParam(id)
  const mid = parseIntParam(msId)
  if (projectId == null || mid == null) return notFound()
  const ok = await getStore().measurementSets.removeForProject(projectId, mid)
  if (ok) getEventBus().notify(projectId)
  return ok ? noContent() : notFound()
}
