import * as cheerio from 'cheerio'
import type { PatternSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type PatternScraper } from './types'

// Their storefront is JS-rendered Wix, so scrape DDG results for site: queries.
const DDG_URL = 'https://html.duckduckgo.com/html/'
const SITE = 'laughingmoonmercantile.com'

export const laughingMoonScraper: PatternScraper = {
  async search(query, maxResults = 10) {
    const form = new URLSearchParams({ q: `site:${SITE} ${query}` })
    const res = await fetch(DDG_URL, {
      method: 'POST',
      headers: {
        ...BROWSER_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)

    const hits: PatternSearchHit[] = []
    $('.result').each((_, el) => {
      if (hits.length >= maxResults) return false
      const anchor = $(el).find('.result__title a').first()
      if (anchor.length === 0) return
      const rawHref = anchor.attr('href') ?? ''
      const url = extractUddg(rawHref) ?? rawHref
      if (!url.includes(SITE)) return
      hits.push({
        source: 'laughing_moon',
        title: anchor.text().trim(),
        url,
        image_url: null,
        price: null,
        pattern_number: null,
      })
    })
    return hits
  },
}

// DDG wraps outbound URLs in /l/?uddg=<encoded-url>
function extractUddg(href: string): string | null {
  try {
    const u = new URL(href, DDG_URL)
    const target = u.searchParams.get('uddg')
    return target ? decodeURIComponent(target) : null
  } catch {
    return null
  }
}
