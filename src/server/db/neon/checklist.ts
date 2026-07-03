import { and, asc, eq, max, sql } from 'drizzle-orm'
import type {
  ChecklistItem,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from '@/src/models'
import type { ChecklistRepo } from '../types'
import type { Db } from '../client'
import { checklistItems } from '../schema'
import { toChecklistItem } from './mappers'

export class NeonChecklist implements ChecklistRepo {
  constructor(private readonly db: Db) {}

  async list(projectId: number): Promise<ChecklistItem[]> {
    const rows = await this.db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.project_id, projectId))
      .orderBy(asc(checklistItems.position))
    return rows.map(toChecklistItem)
  }

  async create(
    projectId: number,
    input: CreateChecklistItemInput,
  ): Promise<ChecklistItem | null> {
    const [{ value: currentMax }] = await this.db
      .select({ value: max(checklistItems.position) })
      .from(checklistItems)
      .where(eq(checklistItems.project_id, projectId))
    const position = (currentMax ?? -1) + 1
    const [row] = await this.db
      .insert(checklistItems)
      .values({
        project_id: projectId,
        title: input.title,
        notes: input.notes ?? '',
        position,
      })
      .returning()
    return row ? toChecklistItem(row) : null
  }

  async update(
    projectId: number,
    itemId: number,
    input: UpdateChecklistItemInput,
  ): Promise<ChecklistItem | null> {
    const patch: Partial<typeof checklistItems.$inferInsert> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.notes !== undefined) patch.notes = input.notes ?? ''
    if (input.image_urls !== undefined) patch.image_urls = input.image_urls
    const [row] = await this.db
      .update(checklistItems)
      .set(patch)
      .where(and(eq(checklistItems.id, itemId), eq(checklistItems.project_id, projectId)))
      .returning()
    return row ? toChecklistItem(row) : null
  }

  async toggle(projectId: number, itemId: number): Promise<ChecklistItem | null> {
    const [row] = await this.db
      .update(checklistItems)
      .set({ checked: sql`CASE WHEN ${checklistItems.checked} = 0 THEN 1 ELSE 0 END` })
      .where(and(eq(checklistItems.id, itemId), eq(checklistItems.project_id, projectId)))
      .returning()
    return row ? toChecklistItem(row) : null
  }

  async remove(projectId: number, itemId: number): Promise<boolean> {
    const rows = await this.db
      .delete(checklistItems)
      .where(and(eq(checklistItems.id, itemId), eq(checklistItems.project_id, projectId)))
      .returning({ id: checklistItems.id })
    return rows.length > 0
  }

  async reorder(projectId: number, ids: number[]): Promise<boolean> {
    if (ids.length === 0) return true
    // Neon HTTP driver has no cross-statement transactions.
    await Promise.all(
      ids.map((id, position) =>
        this.db
          .update(checklistItems)
          .set({ position })
          .where(
            and(eq(checklistItems.id, id), eq(checklistItems.project_id, projectId)),
          ),
      ),
    )
    return true
  }
}
