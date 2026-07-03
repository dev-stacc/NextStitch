import { afterEach, describe, expect, it, vi } from 'vitest'
import { moodScraper } from '@/src/server/services/patterns/mood'

afterEach(() => vi.unstubAllGlobals())

const HTML = `
<html><body>
  <article>
    <h2><a href="https://blog.moodfabrics.com/post-1">Palazzo Pants Free Pattern</a></h2>
    <img src="https://cdn/mood-1.jpg" />
  </article>
  <article>
    <h1><a href="https://blog.moodfabrics.com/post-2">Wrap Skirt Tutorial</a></h1>
  </article>
  <article>
    <p>No title here — should be skipped.</p>
  </article>
</body></html>`

describe('mood scraper', () => {
  it('extracts h2 and h1 anchored articles', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response(HTML, { status: 200 })),
    )
    const hits = await moodScraper.search('palazzo')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'mood',
      title: 'Palazzo Pants Free Pattern',
      url: 'https://blog.moodfabrics.com/post-1',
      image_url: 'https://cdn/mood-1.jpg',
    })
    expect(hits[1].url).toBe('https://blog.moodfabrics.com/post-2')
  })

  it('returns [] on upstream failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    )
    expect(await moodScraper.search('x')).toEqual([])
  })
})
