import { NextRequest } from 'next/server'
import type { UpdatePatternInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; patternId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, patternId } = await ctx.params
  const projectId = parseIntParam(id)
  const pid = parseIntParam(patternId)
  if (projectId == null || pid == null) return notFound()
  const body = (await req.json()) as UpdatePatternInput
  const updated = await getStore().patterns.update(projectId, pid, body)
  if (!updated) return notFound()
  getEventBus().notify(projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, patternId } = await ctx.params
  const projectId = parseIntParam(id)
  const pid = parseIntParam(patternId)
  if (projectId == null || pid == null) return notFound()
  const ok = await getStore().patterns.remove(projectId, pid)
  if (ok) getEventBus().notify(projectId)
  return ok ? noContent() : notFound()
}
