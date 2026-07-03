import { NextRequest } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ msId: string }> }

export async function PATCH(req: NextRequest, ctx: Params) {
  const { msId } = await ctx.params
  const mid = parseIntParam(msId)
  if (mid == null) return notFound()
  const body = (await req.json()) as UpsertMeasurementSetInput
  const updated = await getStore().measurementSets.updateGlobal(mid, body)
  if (!updated) return notFound()
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { msId } = await ctx.params
  const mid = parseIntParam(msId)
  if (mid == null) return notFound()
  const ok = await getStore().measurementSets.removeGlobal(mid)
  return ok ? noContent() : notFound()
}
