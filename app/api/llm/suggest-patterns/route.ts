import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/src/server/db'
import { getCurrentUserId } from '@/src/server/auth-helpers'
import { badRequest, json, notFound, unauthorized } from '@/src/server/http'
import { suggestPatterns } from '@/src/server/services/llm'

interface Body {
  project_id: number
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return unauthorized()
  const body = (await req.json()) as Body
  if (typeof body?.project_id !== 'number') return badRequest('project_id required')
  const project = await getStore().projects.get(userId, body.project_id)
  if (!project) return notFound()
  try {
    const query = await suggestPatterns(project.name, project.description)
    return json(query)
  } catch (err) {
    return NextResponse.json({ detail: (err as Error).message }, { status: 502 })
  }
}
