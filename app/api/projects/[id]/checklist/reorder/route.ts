import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, noContent, notFound, readJson } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const parsed = await readJson<{ ids?: number[] }>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
  if (!Array.isArray(body?.ids)) return badRequest('ids array required')
  const ok = await getStore().checklist.reorder(access.projectId, body.ids)
  if (!ok) return notFound()
  getEventBus().notify(access.projectId)
  return noContent()
}
