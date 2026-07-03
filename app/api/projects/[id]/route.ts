import { NextRequest } from 'next/server'
import type { UpdateProjectInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { json, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const project = await getStore().projects.get(projectId)
  if (!project) return notFound()
  return json(project)
}

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as UpdateProjectInput
  const updated = await getStore().projects.update(projectId, body)
  if (!updated) return notFound()
  getEventBus().notify(projectId)
  return json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const ok = await getStore().projects.remove(projectId)
  return ok ? noContent() : notFound()
}
