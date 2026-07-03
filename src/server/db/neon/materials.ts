import { and, eq } from 'drizzle-orm'
import type { CreateMaterialInput, Material, UpdateMaterialInput } from '@/src/models'
import type { MaterialsRepo } from '../types'
import type { Db } from '../client'
import { materials } from '../schema'
import { toMaterial } from './mappers'

export class NeonMaterials implements MaterialsRepo {
  constructor(private readonly db: Db) {}

  async create(projectId: number, input: CreateMaterialInput): Promise<Material | null> {
    const [row] = await this.db
      .insert(materials)
      .values({
        project_id: projectId,
        name: input.name,
        quantity: input.quantity ?? null,
        price: input.price ?? null,
        image_url: input.image_url ?? null,
        notes: input.notes ?? null,
        care_instructions: input.care_instructions ?? null,
        grain_direction: input.grain_direction ?? null,
        pre_wash: input.pre_wash ?? 0,
        purchased: 0,
      })
      .returning()
    return row ? toMaterial(row) : null
  }

  async update(
    projectId: number,
    materialId: number,
    input: UpdateMaterialInput,
  ): Promise<Material | null> {
    const patch: Partial<typeof materials.$inferInsert> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.quantity !== undefined) patch.quantity = input.quantity
    if (input.price !== undefined) patch.price = input.price
    if (input.image_url !== undefined) patch.image_url = input.image_url
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.care_instructions !== undefined) patch.care_instructions = input.care_instructions
    if (input.grain_direction !== undefined) patch.grain_direction = input.grain_direction
    if (input.pre_wash !== undefined) patch.pre_wash = input.pre_wash
    if (input.purchased !== undefined) patch.purchased = input.purchased
    const [row] = await this.db
      .update(materials)
      .set(patch)
      .where(and(eq(materials.id, materialId), eq(materials.project_id, projectId)))
      .returning()
    return row ? toMaterial(row) : null
  }

  async remove(projectId: number, materialId: number): Promise<boolean> {
    const rows = await this.db
      .delete(materials)
      .where(and(eq(materials.id, materialId), eq(materials.project_id, projectId)))
      .returning({ id: materials.id })
    return rows.length > 0
  }
}
