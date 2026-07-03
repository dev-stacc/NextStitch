import type { Material, Pattern } from '@/src/domain'

export function materialsSpent(materials: readonly Material[]): number {
  return materials.reduce(
    (sum, m) => (m.purchased && m.price != null ? sum + m.price : sum),
    0,
  )
}

export function patternsSpent(patterns: readonly Pattern[]): number {
  return patterns.reduce((sum, p) => (p.price_paid != null ? sum + p.price_paid : sum), 0)
}
