import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST as storesNearby } from '@/app/api/stores/nearby/route'
import { jsonRequest } from '../helpers'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

interface OverpassPayload {
  elements: Array<{
    lat?: number
    lon?: number
    tags?: Record<string, string | undefined>
  }>
}

function mockOverpass(payload: OverpassPayload) {
  return vi.fn<typeof fetch>(async (input) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (!url.startsWith(OVERPASS_URL)) {
      throw new Error(`Unexpected fetch: ${url}`)
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('stores/nearby (Overpass)', () => {
  it('rejects a body without lat/lon', async () => {
    vi.stubGlobal('fetch', vi.fn())
    const res = await storesNearby(
      jsonRequest('/api/stores/nearby', { method: 'POST', body: {} }),
    )
    expect(res.status).toBe(400)
  })

  it('maps Overpass elements into FabricStore shape', async () => {
    vi.stubGlobal(
      'fetch',
      mockOverpass({
        elements: [
          {
            lat: 45.51,
            lon: -73.55,
            tags: {
              name: 'Fabricville',
              phone: '+1 555 555 0000',
              website: 'https://fabricville.example',
              opening_hours: 'Mo-Sa 10:00-18:00',
              'addr:housenumber': '123',
              'addr:street': 'Sherbrooke',
              'addr:city': 'Montreal',
              'addr:postcode': 'H2X 1X1',
            },
          },
          {
            lat: 45.52,
            lon: -73.56,
            tags: { name: 'Threadbare', phone: undefined, website: undefined },
          },
          {
            tags: { name: 'ghost-without-coords' },
          },
        ],
      }),
    )

    const res = await storesNearby(
      jsonRequest('/api/stores/nearby', {
        method: 'POST',
        body: { lat: 45.5, lon: -73.5, radius_m: 10_000 },
      }),
    )
    const body = (await res.json()) as { stores: Array<{ name: string; address: string; phone: string | null }> }

    expect(body.stores).toHaveLength(2)
    expect(body.stores[0]).toMatchObject({
      name: 'Fabricville',
      address: '123, Sherbrooke, Montreal, H2X 1X1',
      phone: '+1 555 555 0000',
    })
    expect(body.stores[1]).toMatchObject({
      name: 'Threadbare',
      address: 'Address not available',
      phone: null,
      website: null,
    })
  })

  it('returns an empty list when Overpass fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    )
    const res = await storesNearby(
      jsonRequest('/api/stores/nearby', {
        method: 'POST',
        body: { lat: 45.5, lon: -73.5, radius_m: 5000 },
      }),
    )
    const body = (await res.json()) as { stores: unknown[] }
    expect(body.stores).toEqual([])
  })

  it('sends a POST with data body to Overpass', async () => {
    const fetchMock = mockOverpass({ elements: [] })
    vi.stubGlobal('fetch', fetchMock)
    await storesNearby(
      jsonRequest('/api/stores/nearby', {
        method: 'POST',
        body: { lat: 1, lon: 2, radius_m: 500 },
      }),
    )
    expect(fetchMock).toHaveBeenCalledOnce()
    const call = fetchMock.mock.calls[0]
    const init = call[1] as RequestInit
    expect(init.method).toBe('POST')
    const bodyText = (init.body as URLSearchParams).toString()
    expect(bodyText).toContain('around%3A500%2C1%2C2')
  })
})
