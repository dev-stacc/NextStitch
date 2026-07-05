import { NextRequest, NextResponse } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, readJson } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  return json(await getStore().measurementSets.listForProject(access.projectId))
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const parsed = await readJson<UpsertMeasurementSetInput>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
  if (!body?.name?.trim()) return badRequest('name is required')
  const ms = await getStore().measurementSets.createForProject(access.projectId, body)
  if (!ms) return notFound()
  getEventBus().notify(access.projectId)
  return json(ms, 201)
}
