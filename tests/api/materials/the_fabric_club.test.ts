import { afterEach, describe, expect, it, vi } from 'vitest'
import { theFabricClubScraper } from '@/src/server/services/materials/the_fabric_club'

afterEach(() => vi.unstubAllGlobals())

const HTML = `
<html><body>
  <ol class="products">
    <li class="item product product-item">
      <strong class="product-item-name">
        <a class="product-item-link" href="https://www.thefabricclub.ca/en/silk-charmeuse.html">Silk Charmeuse</a>
      </strong>
      <span class="price-wrapper"><span class="price">$32.00</span></span>
      <img class="product-image-photo" src="https://cdn/silk.jpg" />
    </li>
    <li class="item product product-item">
      <strong class="product-item-name">
        <a class="product-item-link" href="/en/linen.html">Linen</a>
      </strong>
      <img class="product-image-photo" data-src="https://cdn/linen-lazy.jpg" />
    </li>
    <li class="item product product-item">
      <span class="price">missing link — skip</span>
    </li>
  </ol>
</body></html>`

describe('the_fabric_club scraper', () => {
  it('parses Magento product cards', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response(HTML, { status: 200 })),
    )
    const hits = await theFabricClubScraper.search('silk')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'the_fabric_club',
      title: 'Silk Charmeuse',
      url: 'https://www.thefabricclub.ca/en/silk-charmeuse.html',
      image_url: 'https://cdn/silk.jpg',
      price: '$32.00',
    })
    expect(hits[1].url).toBe('https://www.thefabricclub.ca/en/linen.html')
    expect(hits[1].image_url).toBe('https://cdn/linen-lazy.jpg')
    expect(hits[1].price).toBeNull()
  })
})
