import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectStatus,
  UpdateProjectInput,
} from '@/src/domain'
import type { ProjectsRepo } from './types'
import { DbState, ProjectRow, nextId, toProjectSummary } from './state'

export class MemoryProjects implements ProjectsRepo {
  constructor(private readonly state: DbState) {}

  async list(): Promise<Project[]> {
    return Array.from(this.state.projects.values()).map(toProjectSummary)
  }

  async get(id: number): Promise<ProjectDetail | null> {
    const row = this.state.projects.get(id)
    if (!row) return null
    const globals = Array.from(this.state.globalSets.values())
    return {
      ...toProjectSummary(row),
      patterns: [...row.patterns],
      materials: [...row.materials],
      checklist: [...row.checklist],
      measurement_sets: [...row.measurementSets],
      global_measurement_sets: globals.filter((ms) => row.globalMeasurementSetIds.has(ms.id)),
      progress_images: [...row.progressImages],
    }
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const id = nextId()
    const project: Project = {
      id,
      name: input.name,
      description: input.description ?? null,
      budget: input.budget ?? null,
      status: 'to_start',
      created_at: new Date().toISOString(),
      total_spent: 0,
    }
    const row: ProjectRow = {
      project,
      patterns: [],
      materials: [],
      checklist: [],
      measurementSets: [],
      globalMeasurementSetIds: new Set(input.global_measurement_set_ids ?? []),
      progressImages: [],
    }
    this.state.projects.set(id, row)
    return { ...project }
  }

  async update(id: number, input: UpdateProjectInput): Promise<Project | null> {
    const row = this.state.projects.get(id)
    if (!row) return null
    if (input.name !== undefined) row.project.name = input.name
    if (input.description !== undefined) row.project.description = input.description
    if (input.budget !== undefined) row.project.budget = input.budget
    return toProjectSummary(row)
  }

  async setStatus(id: number, status: ProjectStatus): Promise<boolean> {
    const row = this.state.projects.get(id)
    if (!row) return false
    row.project.status = status
    return true
  }

  async remove(id: number): Promise<boolean> {
    return this.state.projects.delete(id)
  }
}
