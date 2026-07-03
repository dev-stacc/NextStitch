import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectStatus,
  UpdateProjectInput,
} from '@/src/models'
import type { ProjectsRepo } from './types'
import { DbState, ProjectRow, nextId, toProjectSummary } from './state'

export class MemoryProjects implements ProjectsRepo {
  constructor(private readonly state: DbState) {}

  private ownedRow(userId: string, id: number): ProjectRow | null {
    const row = this.state.projects.get(id)
    if (!row || row.ownerId !== userId) return null
    return row
  }

  async list(userId: string): Promise<Project[]> {
    return Array.from(this.state.projects.values())
      .filter((r) => r.ownerId === userId)
      .map(toProjectSummary)
  }

  async get(userId: string, id: number): Promise<ProjectDetail | null> {
    const row = this.ownedRow(userId, id)
    if (!row) return null
    const globals = Array.from(this.state.globalSets.values())
      .filter((g) => g.ownerId === userId)
      .map((g) => g.ms)
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

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
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
      ownerId: userId,
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

  async update(userId: string, id: number, input: UpdateProjectInput): Promise<Project | null> {
    const row = this.ownedRow(userId, id)
    if (!row) return null
    if (input.name !== undefined) row.project.name = input.name
    if (input.description !== undefined) row.project.description = input.description
    if (input.budget !== undefined) row.project.budget = input.budget
    return toProjectSummary(row)
  }

  async setStatus(userId: string, id: number, status: ProjectStatus): Promise<boolean> {
    const row = this.ownedRow(userId, id)
    if (!row) return false
    row.project.status = status
    return true
  }

  async remove(userId: string, id: number): Promise<boolean> {
    if (!this.ownedRow(userId, id)) return false
    return this.state.projects.delete(id)
  }
}
