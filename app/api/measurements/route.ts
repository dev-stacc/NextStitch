import { NextRequest } from 'next/server'
import type { UpsertMeasurementSetInput } from '@/src/domain'
import { getStore } from '@/src/server/db'
import { badRequest, json } from '@/src/server/http'

export async function GET() {
  return json(await getStore().measurementSets.listGlobal())
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as UpsertMeasurementSetInput
  if (!body?.name?.trim()) return badRequest('name is required')
  return json(await getStore().measurementSets.createGlobal(body), 201)
}
