export type PatternSource =
  | 'upload'
  | 'generated'
  | 'manual'
  | 'simplicity'
  | 'mood'
  | 'black_snail'
  | 'truly_victorian'
  | 'laughing_moon'

export interface Pattern {
  id: number
  source: PatternSource
  title: string | null
  pattern_number: string | null
  url: string | null
  image_url: string | null
  price: string | null
  price_paid: number | null
  purchased: 0 | 1
  notes: string | null
}

export interface PatternSearchHit {
  source: PatternSource
  title: string
  url: string
  image_url: string | null
  price: string | null
  pattern_number?: string | null
}

export interface CreatePatternInput {
  source: PatternSource
  title: string
  url: string
  image_url?: string | null
  price?: string | null
  price_paid?: number | null
  notes?: string | null
}

export interface UpdatePatternInput {
  title?: string
  notes?: string | null
  price_paid?: number | null
  purchased?: 0 | 1
}
