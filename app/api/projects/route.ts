import { NextRequest } from 'next/server'
import type { CreateProjectInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { badRequest, json } from '@/src/server/http'

export async function GET() {
  return json(await getStore().projects.list())
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateProjectInput
  if (!body?.name?.trim()) return badRequest('name is required')
  return json(await getStore().projects.create(body), 201)
}
