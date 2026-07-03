import type {
  ChecklistItem,
  Material,
  MeasurementSet,
  Pattern,
  Project,
  ProjectImage,
} from '@/src/models'

export interface ProjectRow {
  ownerId: string
  project: Project
  patterns: Pattern[]
  materials: Material[]
  checklist: ChecklistItem[]
  measurementSets: MeasurementSet[]
  globalMeasurementSetIds: Set<number>
  progressImages: ProjectImage[]
}

export interface GlobalSetRow {
  ownerId: string
  ms: MeasurementSet
}

export class DbState {
  readonly projects = new Map<number, ProjectRow>()
  readonly globalSets = new Map<number, GlobalSetRow>()
}

export function nextId(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function totalSpent(row: ProjectRow): number {
  const materials = row.materials.reduce(
    (sum, m) => (m.purchased && m.price != null ? sum + m.price : sum),
    0,
  )
  const patterns = row.patterns.reduce(
    (sum, p) => (p.price_paid != null ? sum + p.price_paid : sum),
    0,
  )
  return materials + patterns
}

export function toProjectSummary(row: ProjectRow): Project {
  return { ...row.project, total_spent: totalSpent(row) }
}
