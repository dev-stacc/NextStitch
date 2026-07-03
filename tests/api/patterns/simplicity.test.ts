import { afterEach, describe, expect, it, vi } from 'vitest'
import { simplicityScraper } from '@/src/server/services/patterns/simplicity'

afterEach(() => vi.unstubAllGlobals())

const HTML = `
<html><body>
  <article class="card">
    <figure class="card-figure"><img src="https://cdn/1.jpg" /></figure>
    <span class="productSku">S9251</span>
    <a class="card-title" href="/pattern/S9251">Misses' Loose-Fitting Dresses</a>
    <div class="card-text" data-test-info-type="price"><span>USD</span><span>$18.99</span></div>
  </article>
  <article class="card">
    <a class="card-title" href="/pattern/S9252">Second title</a>
  </article>
  <article class="card">
    <!-- no title, should be skipped -->
    <span class="productSku">X-9999</span>
  </article>
</body></html>`

function mockHtml(html: string) {
  return vi.fn<typeof fetch>(async () => new Response(html, { status: 200 }))
}

describe('simplicity scraper', () => {
  it('parses cards into hits', async () => {
    vi.stubGlobal('fetch', mockHtml(HTML))
    const hits = await simplicityScraper.search('dress')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'simplicity',
      title: "Misses' Loose-Fitting Dresses",
      pattern_number: 'S9251',
      url: '/pattern/S9251',
      image_url: 'https://cdn/1.jpg',
      price: '$18.99',
    })
    expect(hits[1].title).toBe('Second title')
    expect(hits[1].pattern_number).toBeNull()
  })

  it('honours maxResults', async () => {
    vi.stubGlobal('fetch', mockHtml(HTML))
    const hits = await simplicityScraper.search('dress', 1)
    expect(hits).toHaveLength(1)
  })

  it('returns [] on upstream failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 502 })),
    )
    expect(await simplicityScraper.search('x')).toEqual([])
  })
})
