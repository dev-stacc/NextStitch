import { NextRequest } from 'next/server'
import type { ProjectStatus } from '@/src/models'
import { getStore } from '@/src/server/db'
import { getCurrentUserId } from '@/src/server/auth-helpers'
import { getEventBus } from '@/src/server/events'
import { badRequest, noContent, notFound, parseIntParam, readJson, unauthorized } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

const VALID: readonly ProjectStatus[] = ['to_start', 'in_progress', 'on_hold', 'completed']

export async function PATCH(req: NextRequest, ctx: Params) {
  const userId = await getCurrentUserId()
  if (!userId) return unauthorized()
  const { id } = await ctx.params
  const projectId = parseIntParam(id)
  if (projectId == null) return notFound()
  const parsed = await readJson<{ status?: string }>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
  const status = body?.status
  if (!status || !VALID.includes(status as ProjectStatus)) return badRequest('invalid status')
  const ok = await getStore().projects.setStatus(userId, projectId, status as ProjectStatus)
  if (!ok) return notFound()
  getEventBus().notify(projectId)
  return noContent()
}
