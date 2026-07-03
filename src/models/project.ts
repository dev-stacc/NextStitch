import type { Pattern } from './pattern'
import type { Material } from './material'
import type { ChecklistItem } from './checklist'
import type { MeasurementSet } from './measurement'
import type { ProjectImage } from './image'

export type ProjectStatus = 'to_start' | 'in_progress' | 'on_hold' | 'completed'

export interface Project {
  id: number
  name: string
  description: string | null
  budget: number | null
  status: ProjectStatus
  created_at: string
  total_spent: number
}

export interface ProjectDetail extends Project {
  patterns: Pattern[]
  materials: Material[]
  checklist: ChecklistItem[]
  measurement_sets: MeasurementSet[]
  global_measurement_sets: MeasurementSet[]
  progress_images: ProjectImage[]
}

export interface CreateProjectInput {
  name: string
  description?: string | null
  budget?: number | null
  global_measurement_set_ids?: number[]
}

export interface UpdateProjectInput {
  name?: string
  description?: string | null
  budget?: number | null
}
