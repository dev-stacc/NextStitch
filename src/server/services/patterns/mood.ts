import * as cheerio from 'cheerio'
import type { PatternSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type PatternScraper } from './types'

const BASE_URL = 'https://blog.moodfabrics.com'

export const moodScraper: PatternScraper = {
  async search(query, maxResults = 10) {
    const url = new URL(`${BASE_URL}/`)
    url.searchParams.set('s', query)

    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)

    const hits: PatternSearchHit[] = []
    $('article').each((_, el) => {
      if (hits.length >= maxResults) return false
      const article = $(el)
      const titleEl = article.find('h2 a').first().length
        ? article.find('h2 a').first()
        : article.find('h1 a').first()
      if (titleEl.length === 0) return
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') ?? ''
      const image = article.find('img').first().attr('src') ?? null
      hits.push({
        source: 'mood',
        title,
        url: href,
        image_url: image,
        price: null,
        pattern_number: null,
      })
    })
    return hits
  },
}
