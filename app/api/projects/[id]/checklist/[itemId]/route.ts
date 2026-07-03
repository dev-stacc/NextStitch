import { NextRequest } from 'next/server'
import type { UpdateChecklistItemInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const projectId = parseIntParam(id)
  const iid = parseIntParam(itemId)
  if (projectId == null || iid == null) return notFound()
  const body = (await req.json()) as UpdateChecklistItemInput
  const updated = await getStore().checklist.update(projectId, iid, body)
  if (!updated) return notFound()
  getEventBus().notify(projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const projectId = parseIntParam(id)
  const iid = parseIntParam(itemId)
  if (projectId == null || iid == null) return notFound()
  const ok = await getStore().checklist.remove(projectId, iid)
  if (ok) getEventBus().notify(projectId)
  return ok ? noContent() : notFound()
}
