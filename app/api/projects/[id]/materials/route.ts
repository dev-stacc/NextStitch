import { NextRequest } from 'next/server'
import type { CreateMaterialInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as CreateMaterialInput
  if (!body?.name?.trim()) return badRequest('name is required')
  const material = await getStore().materials.create(projectId, body)
  if (!material) return notFound()
  getEventBus().notify(projectId)
  return json(material, 201)
}
