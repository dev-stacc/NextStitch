import { afterEach, describe, expect, it, vi } from 'vitest'
import { shopifyScraper } from '@/src/server/services/materials/shopify'

afterEach(() => vi.unstubAllGlobals())

function mockJson(body: unknown) {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status: 200 }))
}

const scraper = shopifyScraper('https://shop.example', 'test_shop')

describe('shopify material scraper', () => {
  it('maps suggest.json products into hits with absolute URLs', async () => {
    vi.stubGlobal(
      'fetch',
      mockJson({
        resources: {
          results: {
            products: [
              {
                title: 'Belgian Linen — Natural',
                price: '42.00',
                image: 'https://cdn/linen.jpg',
                url: '/products/belgian-linen',
              },
              {
                title: 'Cotton Lawn',
                price: 12.5,
                image: 'https://cdn/cotton.jpg',
                url: 'https://shop.example/products/cotton-lawn',
              },
            ],
          },
        },
      }),
    )
    const hits = await scraper.search('linen')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'test_shop',
      title: 'Belgian Linen — Natural',
      url: 'https://shop.example/products/belgian-linen',
      image_url: 'https://cdn/linen.jpg',
      price: 'CAD $42.00',
    })
    expect(hits[1].url).toBe('https://shop.example/products/cotton-lawn')
    expect(hits[1].price).toBe('CAD $12.50')
  })

  it('leaves prices with currency symbols untouched', async () => {
    vi.stubGlobal(
      'fetch',
      mockJson({
        resources: { results: { products: [{ title: 'A', price: '$9.99', url: '/a' }] } },
      }),
    )
    const [hit] = await scraper.search('a')
    expect(hit.price).toBe('$9.99')
  })

  it('returns [] on upstream failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('boom', { status: 500 })))
    expect(await scraper.search('anything')).toEqual([])
  })
})
