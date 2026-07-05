import type { MaterialSearchHit } from '@/src/models'
import { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS, type MaterialScraper } from './types'

interface ShopifyProduct {
  title?: string
  price?: string | number
  image?: string
  url?: string
}

interface SuggestPayload {
  resources?: {
    results?: {
      products?: ShopifyProduct[]
    }
  }
}

function formatPrice(raw: string | number | undefined): string | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null
  if (/[$£€]|CAD|USD/i.test(s)) return s
  const n = parseFloat(s)
  return Number.isFinite(n) ? `CAD $${n.toFixed(2)}` : s
}

export function shopifyScraper(baseUrl: string, source: string): MaterialScraper {
  return {
    async search(query, maxResults = 10) {
      const url = new URL(`${baseUrl}/search/suggest.json`)
      url.searchParams.set('q', query)
      url.searchParams.set('resources[type]', 'product')
      url.searchParams.set('resources[limit]', String(maxResults))

      const res = await fetch(url, {
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })
      if (!res.ok) return []
      const data = (await res.json()) as SuggestPayload
      const products = data.resources?.results?.products ?? []
      return products.map<MaterialSearchHit>((p) => {
        const productUrl = p.url ?? ''
        const abs = productUrl && !/^https?:/i.test(productUrl) ? `${baseUrl}${productUrl}` : productUrl
        return {
          source,
          title: p.title ?? '',
          url: abs,
          image_url: p.image ?? null,
          price: formatPrice(p.price),
        }
      })
    },
  }
}
