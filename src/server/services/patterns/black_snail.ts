import type { PatternSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type PatternScraper } from './types'

const BASE_URL = 'https://blacksnailpatterns.com'

interface ShopifyImage {
  src: string
}
interface ShopifyVariant {
  price: string
}
interface ShopifyProduct {
  title: string
  handle: string
  tags?: string[]
  variants?: ShopifyVariant[]
  images?: ShopifyImage[]
}

function toHit(product: ShopifyProduct): PatternSearchHit {
  return {
    source: 'black_snail',
    title: product.title,
    url: `${BASE_URL}/products/${product.handle}`,
    image_url: product.images?.[0]?.src ?? null,
    price: product.variants?.[0]?.price ?? null,
    pattern_number: null,
  }
}

export const blackSnailScraper: PatternScraper = {
  async search(query, maxResults = 10) {
    const res = await fetch(`${BASE_URL}/products.json?limit=250`, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { products?: ShopifyProduct[] }
    const products = data.products ?? []
    const q = query.toLowerCase()
    const hits: PatternSearchHit[] = []
    for (const p of products) {
      const inTitle = p.title.toLowerCase().includes(q)
      const inTags = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false
      if (!inTitle && !inTags) continue
      hits.push(toHit(p))
      if (hits.length >= maxResults) break
    }
    return hits
  },
}
