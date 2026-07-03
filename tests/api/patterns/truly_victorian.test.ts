import { afterEach, describe, expect, it, vi } from 'vitest'
import { trulyVictorianScraper } from '@/src/server/services/patterns/truly_victorian'

afterEach(() => vi.unstubAllGlobals())

const HTML = `
<html><body>
  <ul class="products">
    <li class="product">
      <a class="woocommerce-loop-product__link" href="https://trulyvictorian.info/product/tv-101">
        <img src="https://cdn/tv-101.jpg" />
        <h2 class="woocommerce-loop-product__title">TV101 1860s Corset</h2>
        <span class="price"><span class="woocommerce-Price-amount"><bdi>$24.00</bdi></span></span>
      </a>
    </li>
    <li class="product">
      <a class="woocommerce-loop-product__link" href="https://trulyvictorian.info/product/tv-102">
        <h2 class="woocommerce-loop-product__title">TV102 Chemise</h2>
      </a>
    </li>
    <li class="product">
      <h2 class="woocommerce-loop-product__title">Missing link — skip</h2>
    </li>
  </ul>
</body></html>`

describe('truly_victorian scraper', () => {
  it('parses products with title, link, price, image', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response(HTML, { status: 200 })),
    )
    const hits = await trulyVictorianScraper.search('corset')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'truly_victorian',
      title: 'TV101 1860s Corset',
      url: 'https://trulyvictorian.info/product/tv-101',
      image_url: 'https://cdn/tv-101.jpg',
      price: '$24.00',
    })
    expect(hits[1].price).toBeNull()
  })
})
