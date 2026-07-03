import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(_req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const iid = parseIntParam(itemId)
  if (iid == null) return notFound()
  const updated = await getStore().checklist.toggle(access.projectId, iid)
  if (!updated) return notFound()
  getEventBus().notify(access.projectId)
  return json(updated)
}
