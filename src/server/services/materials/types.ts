import type { MaterialSearchHit } from '@/src/models'

export interface MaterialScraper {
  search(query: string, maxResults?: number): Promise<MaterialSearchHit[]>
}

export { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS } from '../http'
