import * as cheerio from 'cheerio'
import type { PatternSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type PatternScraper } from './types'

const BASE_URL = 'https://trulyvictorian.info'

export const trulyVictorianScraper: PatternScraper = {
  async search(query, maxResults = 10) {
    const url = new URL(`${BASE_URL}/`)
    url.searchParams.set('s', query)
    url.searchParams.set('post_type', 'product')

    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)

    const hits: PatternSearchHit[] = []
    $('ul.products li.product').each((_, el) => {
      if (hits.length >= maxResults) return false
      const item = $(el)
      const link = item.find('a.woocommerce-loop-product__link').first()
      const titleEl = item.find('.woocommerce-loop-product__title').first()
      if (link.length === 0 || titleEl.length === 0) return
      const price = item.find('.price .woocommerce-Price-amount bdi').first().text().trim() || null
      const image = item.find('img').first().attr('src') ?? null
      hits.push({
        source: 'truly_victorian',
        title: titleEl.text().trim(),
        url: link.attr('href') ?? '',
        image_url: image,
        price,
        pattern_number: null,
      })
    })
    return hits
  },
}
