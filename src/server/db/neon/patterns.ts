import { and, eq } from 'drizzle-orm'
import type { CreatePatternInput, Pattern, UpdatePatternInput } from '@/src/models'
import type { PatternsRepo } from '../types'
import type { Db } from '../client'
import { patterns } from '../schema'
import { toPattern } from './mappers'

export class NeonPatterns implements PatternsRepo {
  constructor(private readonly db: Db) {}

  async create(projectId: number, input: CreatePatternInput): Promise<Pattern | null> {
    const [row] = await this.db
      .insert(patterns)
      .values({
        project_id: projectId,
        source: input.source,
        title: input.title,
        url: input.url ?? null,
        image_url: input.image_url ?? null,
        price: input.price ?? null,
        price_paid: input.price_paid ?? null,
        notes: input.notes ?? null,
        purchased: 0,
      })
      .returning()
    return row ? toPattern(row) : null
  }

  async update(
    projectId: number,
    patternId: number,
    input: UpdatePatternInput,
  ): Promise<Pattern | null> {
    const patch: Partial<typeof patterns.$inferInsert> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.price_paid !== undefined) patch.price_paid = input.price_paid
    if (input.purchased !== undefined) patch.purchased = input.purchased
    const [row] = await this.db
      .update(patterns)
      .set(patch)
      .where(and(eq(patterns.id, patternId), eq(patterns.project_id, projectId)))
      .returning()
    return row ? toPattern(row) : null
  }

  async remove(projectId: number, patternId: number): Promise<boolean> {
    const rows = await this.db
      .delete(patterns)
      .where(and(eq(patterns.id, patternId), eq(patterns.project_id, projectId)))
      .returning({ id: patterns.id })
    return rows.length > 0
  }
}
