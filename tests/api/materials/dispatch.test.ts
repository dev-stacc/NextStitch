import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST as materialSearch } from '@/app/api/materials/search/route'
import { jsonRequest } from '../../helpers'

afterEach(() => vi.unstubAllGlobals())

describe('/api/materials/search dispatch', () => {
  it('rejects missing query or source', async () => {
    const res = await materialSearch(
      jsonRequest('/api/materials/search', {
        method: 'POST',
        body: { query: '' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('dispatches to fabricville (Shopify) and returns its hits', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        new Response(
          JSON.stringify({
            resources: {
              results: {
                products: [
                  { title: 'Linen', price: '20', image: 'https://cdn/x.jpg', url: '/products/linen' },
                ],
              },
            },
          }),
          { status: 200 },
        ),
      ),
    )
    const res = await materialSearch(
      jsonRequest('/api/materials/search', {
        method: 'POST',
        body: { query: 'linen', source: 'fabricville' },
      }),
    )
    const hits = (await res.json()) as Array<{ source: string; title: string }>
    expect(hits).toHaveLength(1)
    expect(hits[0].source).toBe('fabricville')
  })

  it('returns [] for an unknown source', async () => {
    const res = await materialSearch(
      jsonRequest('/api/materials/search', {
        method: 'POST',
        body: { query: 'x', source: 'not-a-real-store' },
      }),
    )
    expect(await res.json()).toEqual([])
  })

  it('returns [] when a scraper throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network flake')
      }),
    )
    const res = await materialSearch(
      jsonRequest('/api/materials/search', {
        method: 'POST',
        body: { query: 'x', source: 'tonitex' },
      }),
    )
    expect(await res.json()).toEqual([])
  })
})
