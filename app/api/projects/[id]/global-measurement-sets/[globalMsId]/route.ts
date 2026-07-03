import { NextRequest } from 'next/server'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; globalMsId: string }> }

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, globalMsId } = await ctx.params
  const projectId = parseIntParam(id)
  const gid = parseIntParam(globalMsId)
  if (projectId == null || gid == null) return notFound()
  const ok = await getStore().measurementSets.unlinkGlobal(projectId, gid)
  if (ok) getEventBus().notify(projectId)
  return ok ? noContent() : notFound()
}
