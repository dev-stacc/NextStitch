import { NextRequest } from 'next/server'
import type { FabricStore, NearbyStoresRequest, NearbyStoresResponse } from '@/src/domain'
import { badRequest, json } from '@/src/server/http'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as NearbyStoresRequest
  if (typeof body?.lat !== 'number' || typeof body?.lon !== 'number') {
    return badRequest('lat and lon required')
  }

  const stores: FabricStore[] = [
    {
      name: 'Threadbare Fabric Co.',
      address: '123 Main St',
      phone: '+1 555 010 1234',
      website: 'https://example.com/threadbare',
      opening_hours: 'Mo-Fr 10:00-18:00; Sa 11:00-17:00',
      lat: body.lat + 0.01,
      lon: body.lon + 0.01,
    },
    {
      name: 'The Sewing Studio',
      address: '456 Loom Ave',
      phone: null,
      website: null,
      opening_hours: 'Tu-Sa 09:00-19:00',
      lat: body.lat - 0.015,
      lon: body.lon + 0.005,
    },
    {
      name: 'Notions & Trims',
      address: 'Address not available',
      phone: '+1 555 010 5678',
      website: 'https://example.com/notions',
      opening_hours: null,
      lat: body.lat + 0.005,
      lon: body.lon - 0.02,
    },
  ]

  const res: NearbyStoresResponse = { stores }
  return json(res)
}
