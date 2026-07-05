import type { PatternSearchHit } from '@/src/models'

export interface PatternScraper {
  search(query: string, maxResults?: number): Promise<PatternSearchHit[]>
}

export { BROWSER_HEADERS, DEFAULT_TIMEOUT_MS } from '../http'
