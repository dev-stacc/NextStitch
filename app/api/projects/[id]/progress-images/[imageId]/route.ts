import { NextRequest } from 'next/server'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; imageId: string }> }

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, imageId } = await ctx.params
  const projectId = parseIntParam(id)
  const iid = parseIntParam(imageId)
  if (projectId == null || iid == null) return notFound()
  const ok = await getStore().progressImages.remove(projectId, iid)
  if (ok) getEventBus().notify(projectId)
  return ok ? noContent() : notFound()
}
