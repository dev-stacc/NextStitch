import { NextRequest } from 'next/server'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as { ids?: number[] }
  if (!Array.isArray(body?.ids)) return badRequest('ids array required')
  const ok = await getStore().checklist.reorder(projectId, body.ids)
  if (!ok) return notFound()
  getEventBus().notify(projectId)
  return noContent()
}
