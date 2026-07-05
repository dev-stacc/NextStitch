import { and, eq, inArray } from 'drizzle-orm'
import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectStatus,
  UpdateProjectInput,
} from '@/src/models'
import type { ProjectsRepo } from '../types'
import type { Db } from '../client'
import {
  checklistItems,
  globalMeasurementSets,
  materials,
  patterns,
  progressImages,
  projectGlobalMeasurementSets,
  projectMeasurementSets,
  projects,
} from '../schema'
import {
  toChecklistItem,
  toGlobalMeasurementSet,
  toMaterial,
  toPattern,
  toProgressImage,
  toProject,
  toProjectMeasurementSet,
} from './mappers'

interface PatternPriceRow {
  price_paid: number | null
}
interface MaterialPriceRow {
  purchased: number
  price: number | null
}

function computeTotal(patternRows: PatternPriceRow[], materialRows: MaterialPriceRow[]): number {
  const p = patternRows.reduce((s, r) => (r.price_paid != null ? s + r.price_paid : s), 0)
  const m = materialRows.reduce(
    (s, r) => (r.purchased && r.price != null ? s + r.price : s),
    0,
  )
  return p + m
}

export class NeonProjects implements ProjectsRepo {
  constructor(private readonly db: Db) {}

  private ownership(userId: string, projectId: number) {
    return and(eq(projects.id, projectId), eq(projects.user_id, userId))
  }

  async list(userId: string): Promise<Project[]> {
    const rows = await this.db.select().from(projects).where(eq(projects.user_id, userId))
    return Promise.all(
      rows.map(async (row) => {
        const [ps, ms] = await Promise.all([
          this.db
            .select({ price_paid: patterns.price_paid })
            .from(patterns)
            .where(eq(patterns.project_id, row.id)),
          this.db
            .select({ purchased: materials.purchased, price: materials.price })
            .from(materials)
            .where(eq(materials.project_id, row.id)),
        ])
        return toProject(row, computeTotal(ps, ms))
      }),
    )
  }

  async get(userId: string, id: number): Promise<ProjectDetail | null> {
    const [row] = await this.db.select().from(projects).where(this.ownership(userId, id))
    if (!row) return null
    const [ps, ms, cs, projMs, globalLinks, imgs] = await Promise.all([
      this.db.select().from(patterns).where(eq(patterns.project_id, id)),
      this.db.select().from(materials).where(eq(materials.project_id, id)),
      this.db.select().from(checklistItems).where(eq(checklistItems.project_id, id)),
      this.db.select().from(projectMeasurementSets).where(eq(projectMeasurementSets.project_id, id)),
      this.db
        .select({
          id: globalMeasurementSets.id,
          user_id: globalMeasurementSets.user_id,
          name: globalMeasurementSets.name,
          measurements: globalMeasurementSets.measurements,
        })
        .from(projectGlobalMeasurementSets)
        .innerJoin(
          globalMeasurementSets,
          eq(globalMeasurementSets.id, projectGlobalMeasurementSets.global_ms_id),
        )
        .where(eq(projectGlobalMeasurementSets.project_id, id)),
      this.db.select().from(progressImages).where(eq(progressImages.project_id, id)),
    ])
    const total = computeTotal(ps, ms)
    return {
      ...toProject(row, total),
      patterns: ps.map(toPattern),
      materials: ms.map(toMaterial),
      checklist: cs.sort((a, b) => a.position - b.position).map(toChecklistItem),
      measurement_sets: projMs.map(toProjectMeasurementSet),
      global_measurement_sets: globalLinks.map(toGlobalMeasurementSet),
      progress_images: imgs.sort((a, b) => a.position - b.position).map(toProgressImage),
    }
  }

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    const [row] = await this.db
      .insert(projects)
      .values({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        budget: input.budget ?? null,
      })
      .returning()
    const requestedIds = input.global_measurement_set_ids ?? []
    if (requestedIds.length > 0) {
      const owned = await this.db
        .select({ id: globalMeasurementSets.id })
        .from(globalMeasurementSets)
        .where(and(eq(globalMeasurementSets.user_id, userId), inArray(globalMeasurementSets.id, requestedIds)))
      if (owned.length > 0) {
        await this.db
          .insert(projectGlobalMeasurementSets)
          .values(owned.map(({ id: globalId }) => ({ project_id: row.id, global_ms_id: globalId })))
      }
    }
    return toProject(row, 0)
  }

  async update(userId: string, id: number, input: UpdateProjectInput): Promise<Project | null> {
    const patch: Partial<typeof projects.$inferInsert> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.description !== undefined) patch.description = input.description
    if (input.budget !== undefined) patch.budget = input.budget
    const [row] = await this.db
      .update(projects)
      .set(patch)
      .where(this.ownership(userId, id))
      .returning()
    if (!row) return null
    const [ps, ms] = await Promise.all([
      this.db
        .select({ price_paid: patterns.price_paid })
        .from(patterns)
        .where(eq(patterns.project_id, id)),
      this.db
        .select({ purchased: materials.purchased, price: materials.price })
        .from(materials)
        .where(eq(materials.project_id, id)),
    ])
    return toProject(row, computeTotal(ps, ms))
  }

  async setStatus(userId: string, id: number, status: ProjectStatus): Promise<boolean> {
    const rows = await this.db
      .update(projects)
      .set({ status })
      .where(this.ownership(userId, id))
      .returning({ id: projects.id })
    return rows.length > 0
  }

  async remove(userId: string, id: number): Promise<boolean> {
    const rows = await this.db
      .delete(projects)
      .where(this.ownership(userId, id))
      .returning({ id: projects.id })
    return rows.length > 0
  }
}
