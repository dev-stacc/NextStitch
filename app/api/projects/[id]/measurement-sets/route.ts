import { NextRequest } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  return json(await getStore().measurementSets.listForProject(projectId))
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as UpsertMeasurementSetInput
  if (!body?.name?.trim()) return badRequest('name is required')
  const ms = await getStore().measurementSets.createForProject(projectId, body)
  if (!ms) return notFound()
  getEventBus().notify(projectId)
  return json(ms, 201)
}
