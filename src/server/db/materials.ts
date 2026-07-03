import type { CreateMaterialInput, Material, UpdateMaterialInput } from '@/src/models'
import type { MaterialsRepo } from './types'
import { DbState, nextId } from './state'

export class MemoryMaterials implements MaterialsRepo {
  constructor(private readonly state: DbState) {}

  async create(projectId: number, input: CreateMaterialInput): Promise<Material | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const material: Material = {
      id: nextId(),
      name: input.name,
      quantity: input.quantity ?? null,
      price: input.price ?? null,
      image_url: input.image_url ?? null,
      notes: input.notes ?? null,
      care_instructions: input.care_instructions ?? null,
      grain_direction: input.grain_direction ?? null,
      pre_wash: input.pre_wash ?? 0,
      purchased: 0,
    }
    row.materials.push(material)
    return material
  }

  async update(
    projectId: number,
    materialId: number,
    input: UpdateMaterialInput,
  ): Promise<Material | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const material = row.materials.find((m) => m.id === materialId)
    if (!material) return null
    const keys = Object.keys(input) as (keyof UpdateMaterialInput)[]
    for (const key of keys) {
      if (input[key] === undefined) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(material as any)[key] = input[key]
    }
    return material
  }

  async remove(projectId: number, materialId: number): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    const before = row.materials.length
    row.materials = row.materials.filter((m) => m.id !== materialId)
    return row.materials.length !== before
  }
}
