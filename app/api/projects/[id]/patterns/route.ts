import { NextRequest } from 'next/server'
import type { CreatePatternInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as CreatePatternInput
  if (!body?.source || !body.url) return badRequest('source and url are required')
  const pattern = await getStore().patterns.create(projectId, body)
  if (!pattern) return notFound()
  getEventBus().notify(projectId)
  return json(pattern, 201)
}
