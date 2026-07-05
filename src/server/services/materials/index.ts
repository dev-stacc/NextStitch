import { cleanersupplyScraper } from './cleanersupply'
import { fabricvilleScraper } from './fabricville'
import { fineFabricsCanadaScraper } from './fine_fabrics_canada'
import { spoolOfThreadScraper } from './spool_of_thread'
import { theFabricClubScraper } from './the_fabric_club'
import { tonitexScraper } from './tonitex'
import type { MaterialScraper } from './types'

const SCRAPERS: Record<string, MaterialScraper> = {
  fabricville: fabricvilleScraper,
  tonitex: tonitexScraper,
  spool_of_thread: spoolOfThreadScraper,
  fine_fabrics_canada: fineFabricsCanadaScraper,
  the_fabric_club: theFabricClubScraper,
  cleanersupply: cleanersupplyScraper,
}

export function getMaterialScraper(source: string): MaterialScraper | null {
  return SCRAPERS[source] ?? null
}
