import type { CreatePatternInput, Pattern, UpdatePatternInput } from '@/src/models'
import type { PatternsRepo } from './types'
import { DbState, nextId } from './state'

export class MemoryPatterns implements PatternsRepo {
  constructor(private readonly state: DbState) {}

  async create(projectId: number, input: CreatePatternInput): Promise<Pattern | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const pattern: Pattern = {
      id: nextId(),
      source: input.source,
      title: input.title,
      pattern_number: null,
      url: input.url ?? null,
      image_url: input.image_url ?? null,
      price: input.price ?? null,
      price_paid: input.price_paid ?? null,
      purchased: 0,
      notes: input.notes ?? null,
    }
    row.patterns.push(pattern)
    return pattern
  }

  async update(
    projectId: number,
    patternId: number,
    input: UpdatePatternInput,
  ): Promise<Pattern | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const pattern = row.patterns.find((p) => p.id === patternId)
    if (!pattern) return null
    if (input.title !== undefined) pattern.title = input.title
    if (input.notes !== undefined) pattern.notes = input.notes
    if (input.price_paid !== undefined) pattern.price_paid = input.price_paid
    if (input.purchased !== undefined) pattern.purchased = input.purchased
    return pattern
  }

  async remove(projectId: number, patternId: number): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    const before = row.patterns.length
    row.patterns = row.patterns.filter((p) => p.id !== patternId)
    return row.patterns.length !== before
  }
}
