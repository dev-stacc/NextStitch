import { NextRequest, NextResponse } from 'next/server'
import type { NearbyStoresRequest, NearbyStoresResponse } from '@/src/models'
import { requireUser } from '@/src/server/auth-helpers'
import { badRequest, json, readJson } from '@/src/server/http'
import { findNearbyFabricStores } from '@/src/server/services/stores'

export async function POST(req: NextRequest) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId
    const parsed = await readJson<NearbyStoresRequest>(req)
  if (!parsed.ok) return parsed.res
  const body = parsed.data
if (typeof body?.lat !== 'number' || typeof body?.lon !== 'number') {
    return badRequest('lat and lon required')
  }

  const stores = await findNearbyFabricStores(body.lat, body.lon, body.radius_m ?? 10_000)
  const res: NearbyStoresResponse = { stores }
  return json(res)
}
