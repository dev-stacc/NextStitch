import { NextRequest, NextResponse } from 'next/server'
import type { UpdateChecklistItemInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const iid = parseIntParam(itemId)
  if (iid == null) return notFound()
  const body = (await req.json()) as UpdateChecklistItemInput
  const updated = await getStore().checklist.update(access.projectId, iid, body)
  if (!updated) return notFound()
  getEventBus().notify(access.projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, itemId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const iid = parseIntParam(itemId)
  if (iid == null) return notFound()
  const ok = await getStore().checklist.remove(access.projectId, iid)
  if (ok) getEventBus().notify(access.projectId)
  return ok ? noContent() : notFound()
}
