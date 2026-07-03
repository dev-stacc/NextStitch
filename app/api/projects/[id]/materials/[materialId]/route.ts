import { NextRequest } from 'next/server'
import type { UpdateMaterialInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string; materialId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id, materialId } = await ctx.params
  const projectId = parseIntParam(id)
  const mid = parseIntParam(materialId)
  if (projectId == null || mid == null) return notFound()
  const body = (await req.json()) as UpdateMaterialInput
  const updated = await getStore().materials.update(projectId, mid, body)
  if (!updated) return notFound()
  getEventBus().notify(projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id, materialId } = await ctx.params
  const projectId = parseIntParam(id)
  const mid = parseIntParam(materialId)
  if (projectId == null || mid == null) return notFound()
  const ok = await getStore().materials.remove(projectId, mid)
  if (ok) getEventBus().notify(projectId)
  return ok ? noContent() : notFound()
}
