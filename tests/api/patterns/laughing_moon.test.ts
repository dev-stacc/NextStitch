import { afterEach, describe, expect, it, vi } from 'vitest'
import { laughingMoonScraper } from '@/src/server/services/patterns/laughing_moon'

afterEach(() => vi.unstubAllGlobals())

const HTML = `
<html><body>
  <div class="result">
    <h2 class="result__title">
      <a href="//duckduckgo.com/l/?uddg=https%3A%2F%2Flaughingmoonmercantile.com%2Fproducts%2Fla-101">
        LM101 1860s Day Dress
      </a>
    </h2>
  </div>
  <div class="result">
    <h2 class="result__title">
      <a href="//duckduckgo.com/l/?uddg=https%3A%2F%2Flaughingmoonmercantile.com%2Fproducts%2Fla-102">
        LM102 Bloomers
      </a>
    </h2>
  </div>
  <div class="result">
    <h2 class="result__title">
      <a href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fother-site.com%2Fpage">
        Unrelated
      </a>
    </h2>
  </div>
</body></html>`

describe('laughing_moon scraper', () => {
  it('extracts and unwraps DDG results on the target site', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response(HTML, { status: 200 })),
    )
    const hits = await laughingMoonScraper.search('1860s dress')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'laughing_moon',
      title: 'LM101 1860s Day Dress',
      url: 'https://laughingmoonmercantile.com/products/la-101',
    })
    expect(hits[1].url).toBe('https://laughingmoonmercantile.com/products/la-102')
  })
})
