import * as cheerio from 'cheerio'
import type { MaterialSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type MaterialScraper } from './types'

export function prestashopScraper(baseUrl: string, source: string): MaterialScraper {
  return {
    async search(query, maxResults = 10) {
      const url = new URL(`${baseUrl}/en/search`)
      url.searchParams.set('controller', 'search')
      url.searchParams.set('s', query)

      const res = await fetch(url, {
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })
      if (!res.ok) return []
      const html = await res.text()
      const $ = cheerio.load(html)

      const hits: MaterialSearchHit[] = []
      $('.product-miniature').each((_, el) => {
        if (hits.length >= maxResults) return false
        const card = $(el)
        const link = card
          .find('.product-title a, .product-name a')
          .first()
        if (link.length === 0) return
        const title = link.text().trim()
        const priceEl = card.find('span.price').first()
        const price = priceEl.length ? priceEl.text().trim() : null
        const img = card.find('img').first()
        const imageUrl = img.attr('src') ?? img.attr('data-src') ?? null
        const href = link.attr('href') ?? ''
        const productUrl = href && !/^https?:/i.test(href) ? `${baseUrl}${href}` : href
        hits.push({ source, title, url: productUrl, image_url: imageUrl, price })
      })
      return hits
    },
  }
}
