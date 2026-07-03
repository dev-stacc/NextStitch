import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; globalMsId: string }> }

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, globalMsId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const gid = parseIntParam(globalMsId)
  if (gid == null) return notFound()
  const ok = await getStore().measurementSets.unlinkGlobal(access.projectId, gid)
  if (ok) getEventBus().notify(access.projectId)
  return ok ? noContent() : notFound()
}
