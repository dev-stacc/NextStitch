import { NextRequest, NextResponse } from 'next/server'
import type { CreatePatternInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const body = (await req.json()) as CreatePatternInput
  if (!body?.source || !body.url) return badRequest('source and url are required')
  const pattern = await getStore().patterns.create(access.projectId, body)
  if (!pattern) return notFound()
  getEventBus().notify(access.projectId)
  return json(pattern, 201)
}
