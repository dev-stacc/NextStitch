import { NextRequest } from 'next/server'
import type { CreateChecklistItemInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  return json(await getStore().checklist.list(projectId))
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as CreateChecklistItemInput
  if (!body?.title?.trim()) return badRequest('title is required')
  const item = await getStore().checklist.create(projectId, body)
  if (!item) return notFound()
  getEventBus().notify(projectId)
  return json(item, 201)
}
