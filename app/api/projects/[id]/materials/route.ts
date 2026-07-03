import { NextRequest, NextResponse } from 'next/server'
import type { CreateMaterialInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const body = (await req.json()) as CreateMaterialInput
  if (!body?.name?.trim()) return badRequest('name is required')
  const material = await getStore().materials.create(access.projectId, body)
  if (!material) return notFound()
  getEventBus().notify(access.projectId)
  return json(material, 201)
}
