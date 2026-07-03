import { NextRequest } from 'next/server'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(_req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const projectId = parseIntParam(id)
  const iid = parseIntParam(itemId)
  if (projectId == null || iid == null) return notFound()
  const updated = await getStore().checklist.toggle(projectId, iid)
  if (!updated) return notFound()
  getEventBus().notify(projectId)
  return json(updated)
}
