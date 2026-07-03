import * as cheerio from 'cheerio'
import type { PatternSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type PatternScraper } from './types'

const SEARCH_URL = 'https://simplicity.com/search.php'

export const simplicityScraper: PatternScraper = {
  async search(query, maxResults = 10) {
    const url = new URL(SEARCH_URL)
    url.searchParams.set('section', 'product')
    url.searchParams.set('search_query', query)

    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)

    const hits: PatternSearchHit[] = []
    $('article.card').each((_, el) => {
      if (hits.length >= maxResults) return false
      const card = $(el)
      const titleEl = card.find('a.card-title').first()
      if (titleEl.length === 0) return
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') ?? ''
      const sku = card.find('span.productSku').first().text().trim() || null
      const price =
        card
          .find("div.card-text[data-test-info-type='price'] span")
          .last()
          .text()
          .trim() || null
      const image = card.find('figure.card-figure img').first().attr('src') ?? null

      hits.push({
        source: 'simplicity',
        title,
        url: href,
        image_url: image,
        price,
        pattern_number: sku,
      })
    })
    return hits
  },
}
