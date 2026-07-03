import { NextRequest, NextResponse } from 'next/server'
import type { NearbyStoresRequest, NearbyStoresResponse } from '@/src/models'
import { requireUser } from '@/src/server/auth-helpers'
import { badRequest, json } from '@/src/server/http'
import { findNearbyFabricStores } from '@/src/server/services/stores'

export async function POST(req: NextRequest) {
  const userId = await requireUser()
  if (userId instanceof NextResponse) return userId

  const body = (await req.json()) as NearbyStoresRequest
  if (typeof body?.lat !== 'number' || typeof body?.lon !== 'number') {
    return badRequest('lat and lon required')
  }

  const stores = await findNearbyFabricStores(body.lat, body.lon, body.radius_m ?? 10_000)
  const res: NearbyStoresResponse = { stores }
  return json(res)
}
