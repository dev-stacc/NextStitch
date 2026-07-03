import { NextRequest, NextResponse } from 'next/server'
import type { UpdatePatternInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; patternId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, patternId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const pid = parseIntParam(patternId)
  if (pid == null) return notFound()
  const body = (await req.json()) as UpdatePatternInput
  const updated = await getStore().patterns.update(access.projectId, pid, body)
  if (!updated) return notFound()
  getEventBus().notify(access.projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, patternId } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const pid = parseIntParam(patternId)
  if (pid == null) return notFound()
  const ok = await getStore().patterns.remove(access.projectId, pid)
  if (ok) getEventBus().notify(access.projectId)
  return ok ? noContent() : notFound()
}
