import { afterEach, describe, expect, it, vi } from 'vitest'
import { blackSnailScraper } from '@/src/server/services/patterns/black_snail'

afterEach(() => vi.unstubAllGlobals())

function mockProducts(products: Array<Record<string, unknown>>) {
  return vi.fn<typeof fetch>(async () => {
    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

describe('black_snail scraper', () => {
  it('filters products by query in title or tags', async () => {
    vi.stubGlobal(
      'fetch',
      mockProducts([
        {
          title: 'Regency Day Dress 1810',
          handle: 'regency-day-dress',
          tags: ['1800-1820', 'women'],
          variants: [{ price: '18.50' }],
          images: [{ src: 'https://cdn.example/img.jpg' }],
        },
        {
          title: 'Men\'s Frock Coat',
          handle: 'mens-frock',
          tags: ['1860-1910', 'men'],
          variants: [{ price: '22.00' }],
        },
        {
          title: 'Georgian Waistcoat',
          handle: 'georgian-waistcoat',
          tags: ['regency'],
        },
      ]),
    )
    const hits = await blackSnailScraper.search('regency')
    expect(hits.map((h) => h.title)).toEqual(['Regency Day Dress 1810', 'Georgian Waistcoat'])
    expect(hits[0]).toMatchObject({
      source: 'black_snail',
      url: 'https://blacksnailpatterns.com/products/regency-day-dress',
      image_url: 'https://cdn.example/img.jpg',
      price: '18.50',
    })
  })

  it('honours maxResults', async () => {
    vi.stubGlobal(
      'fetch',
      mockProducts(
        Array.from({ length: 20 }, (_, i) => ({
          title: `Dress ${i}`,
          handle: `dress-${i}`,
          tags: [],
        })),
      ),
    )
    const hits = await blackSnailScraper.search('dress', 5)
    expect(hits).toHaveLength(5)
  })

  it('returns [] on upstream failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    )
    expect(await blackSnailScraper.search('anything')).toEqual([])
  })
})
