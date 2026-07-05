import { afterEach, describe, expect, it, vi } from 'vitest'
import { prestashopScraper } from '@/src/server/services/materials/prestashop'

afterEach(() => vi.unstubAllGlobals())

const HTML = `
<html><body>
  <article class="product-miniature">
    <h2 class="product-title"><a href="/en/silk/12-charmeuse">Silk Charmeuse</a></h2>
    <span class="price">$28.00</span>
    <img src="https://cdn/silk.jpg" />
  </article>
  <article class="product-miniature">
    <h2 class="product-name"><a href="https://tonitex.com/en/wool/34-tweed">Wool Tweed</a></h2>
    <span class="price">$54.00</span>
    <img data-src="https://cdn/wool-lazy.jpg" />
  </article>
  <article class="product-miniature">
    <span class="price">No title — skip</span>
  </article>
</body></html>`

const scraper = prestashopScraper('https://tonitex.com', 'tonitex')

describe('prestashop scraper', () => {
  it('parses cards with relative and absolute hrefs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response(HTML, { status: 200 })),
    )
    const hits = await scraper.search('fabric')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'tonitex',
      title: 'Silk Charmeuse',
      url: 'https://tonitex.com/en/silk/12-charmeuse',
      image_url: 'https://cdn/silk.jpg',
      price: '$28.00',
    })
    expect(hits[1]).toMatchObject({
      title: 'Wool Tweed',
      url: 'https://tonitex.com/en/wool/34-tweed',
      image_url: 'https://cdn/wool-lazy.jpg',
    })
  })
})
