import { NextRequest, NextResponse } from 'next/server'
import type { CreateChecklistItemInput } from '@/src/models'
import { getStore } from '@/src/server/db'
import { requireProjectAccess } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, json, notFound } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  return json(await getStore().checklist.list(access.projectId))
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const access = await requireProjectAccess(id)
  if (access instanceof NextResponse) return access
  const body = (await req.json()) as CreateChecklistItemInput
  if (!body?.title?.trim()) return badRequest('title is required')
  const item = await getStore().checklist.create(access.projectId, body)
  if (!item) return notFound()
  getEventBus().notify(access.projectId)
  return json(item, 201)
}
