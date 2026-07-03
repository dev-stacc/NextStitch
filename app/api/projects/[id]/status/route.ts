import { NextRequest } from 'next/server'
import type { ProjectStatus } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { getEventBus } from '@/src/server/events'
import { badRequest, noContent, notFound, parseIntParam } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

const VALID: readonly ProjectStatus[] = ['to_start', 'in_progress', 'on_hold', 'completed']

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const body = (await req.json()) as { status?: string }
  const status = body?.status
  if (!status || !VALID.includes(status as ProjectStatus)) return badRequest('invalid status')
  const ok = await getStore().projects.setStatus(projectId, status as ProjectStatus)
  if (!ok) return notFound()
  getEventBus().notify(projectId)
  return noContent()
}
