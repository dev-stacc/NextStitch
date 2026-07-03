import type { PatternSource } from '@/src/models'
import { blackSnailScraper } from './black_snail'
import { laughingMoonScraper } from './laughing_moon'
import { moodScraper } from './mood'
import { simplicityScraper } from './simplicity'
import { trulyVictorianScraper } from './truly_victorian'
import type { PatternScraper } from './types'

const SCRAPERS: Partial<Record<PatternSource, PatternScraper>> = {
  simplicity: simplicityScraper,
  mood: moodScraper,
  black_snail: blackSnailScraper,
  truly_victorian: trulyVictorianScraper,
  laughing_moon: laughingMoonScraper,
}

export function getPatternScraper(source: PatternSource): PatternScraper | null {
  return SCRAPERS[source] ?? null
}
