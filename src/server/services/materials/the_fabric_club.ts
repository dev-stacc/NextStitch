import * as cheerio from 'cheerio'
import type { MaterialSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type MaterialScraper } from './types'

const BASE_URL = 'https://www.thefabricclub.ca'

export const theFabricClubScraper: MaterialScraper = {
  async search(query, maxResults = 10) {
    const url = new URL(`${BASE_URL}/en/search`)
    url.searchParams.set('q', query)

    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)

    const hits: MaterialSearchHit[] = []
    $('li.item.product.product-item').each((_, el) => {
      if (hits.length >= maxResults) return false
      const card = $(el)
      const link = card
        .find('strong.product-item-name a.product-item-link')
        .first()
      if (link.length === 0) return
      const title = link.text().trim()
      const priceEl = card.find('span.price-wrapper span.price').first()
      const price = priceEl.length ? priceEl.text().trim() : null
      const img = card.find('img.product-image-photo').first()
      const imageUrl = img.attr('src') ?? img.attr('data-src') ?? null
      const href = link.attr('href') ?? ''
      const productUrl = /^https?:/i.test(href) ? href : `${BASE_URL}${href}`
      hits.push({
        source: 'the_fabric_club',
        title,
        url: productUrl,
        image_url: imageUrl,
        price,
      })
    })
    return hits
  },
}
