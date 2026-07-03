import type {
  ChecklistItem,
  GrainDirection,
  Material,
  MeasurementSet,
  Pattern,
  PatternSource,
  ProjectImage,
  ProjectStatus,
  Project,
} from '@/src/models'
import type {
  ChecklistItemRow,
  GlobalMeasurementSetRow,
  MaterialRow,
  PatternRow,
  ProgressImageRow,
  ProjectMeasurementSetRow,
  ProjectRow,
} from '../schema'

export function toProject(row: ProjectRow, totalSpent: number): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    budget: row.budget,
    status: (row.status as ProjectStatus) ?? 'to_start',
    created_at: row.created_at.toISOString(),
    total_spent: totalSpent,
  }
}

export function toPattern(row: PatternRow): Pattern {
  return {
    id: row.id,
    source: row.source as PatternSource,
    title: row.title,
    pattern_number: row.pattern_number,
    url: row.url,
    image_url: row.image_url,
    price: row.price,
    price_paid: row.price_paid,
    purchased: (row.purchased ? 1 : 0) as 0 | 1,
    notes: row.notes,
  }
}

export function toMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    price: row.price,
    image_url: row.image_url,
    notes: row.notes,
    care_instructions: row.care_instructions,
    grain_direction: (row.grain_direction as GrainDirection) ?? null,
    pre_wash: (row.pre_wash ? 1 : 0) as 0 | 1,
    purchased: (row.purchased ? 1 : 0) as 0 | 1,
  }
}

export function toChecklistItem(row: ChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    checked: (row.checked ? 1 : 0) as 0 | 1,
    image_urls: row.image_urls ?? [],
  }
}

export function toGlobalMeasurementSet(row: GlobalMeasurementSetRow): MeasurementSet {
  return { id: row.id, name: row.name, measurements: row.measurements ?? {} }
}

export function toProjectMeasurementSet(row: ProjectMeasurementSetRow): MeasurementSet {
  return { id: row.id, name: row.name, measurements: row.measurements ?? {} }
}

export function toProgressImage(row: ProgressImageRow): ProjectImage {
  return { id: row.id, url: row.url }
}
