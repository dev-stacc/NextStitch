import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, noContent, notFound } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const body = (await req.json()) as { ids?: number[] }
  if (!Array.isArray(body?.ids)) return badRequest('ids array required')
  const ok = await getStore().checklist.reorder(access.projectId, body.ids)
  if (!ok) return notFound()
  getEventBus().notify(access.projectId)
  return noContent()
}
