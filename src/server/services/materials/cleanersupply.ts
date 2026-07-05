import { search, SafeSearchType } from 'duck-duck-scrape'
import type { MaterialSearchHit } from '@/src/models'
import type { MaterialScraper } from './types'

const SITE = 'cleanersupply.ca'

export const cleanersupplyScraper: MaterialScraper = {
  async search(query, maxResults = 10) {
    let results: Array<{ title?: string; url?: string }> = []
    try {
      const res = await search(`site:${SITE} ${query}`, { safeSearch: SafeSearchType.OFF })
      results = res.results ?? []
    } catch {
      // DDG rate-limits automated queries; degrade to [].
    }
    const hits: MaterialSearchHit[] = []
    for (const r of results) {
      if (hits.length >= maxResults) break
      if (!r.url?.includes(SITE)) continue
      hits.push({
        source: 'cleanersupply',
        title: r.title ?? '',
        url: r.url,
        image_url: null,
        price: null,
      })
    }
    return hits
  },
}
