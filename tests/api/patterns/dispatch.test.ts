import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST as patternSearch } from '@/app/api/patterns/search/route'
import { jsonRequest } from '../../helpers'

afterEach(() => vi.unstubAllGlobals())

describe('/api/patterns/search dispatch', () => {
  it('rejects missing query or source', async () => {
    const r1 = await patternSearch(
      jsonRequest('/api/patterns/search', {
        method: 'POST',
        body: { query: '', source: 'simplicity' },
      }),
    )
    expect(r1.status).toBe(400)
  })

  it('dispatches to the black_snail scraper and returns its hits', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () =>
        new Response(
          JSON.stringify({
            products: [
              {
                title: 'Regency Dress',
                handle: 'regency-dress',
                tags: [],
                variants: [{ price: '18.00' }],
                images: [{ src: 'https://x/img.jpg' }],
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    )
    const res = await patternSearch(
      jsonRequest('/api/patterns/search', {
        method: 'POST',
        body: { query: 'regency', source: 'black_snail' },
      }),
    )
    const hits = (await res.json()) as Array<{ source: string; title: string }>
    expect(hits).toHaveLength(1)
    expect(hits[0].source).toBe('black_snail')
  })

  it('returns [] when a scraper throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network flake')
      }),
    )
    const res = await patternSearch(
      jsonRequest('/api/patterns/search', {
        method: 'POST',
        body: { query: 'x', source: 'mood' },
      }),
    )
    expect(await res.json()).toEqual([])
  })
})
