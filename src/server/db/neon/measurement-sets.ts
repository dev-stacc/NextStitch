import { and, eq } from 'drizzle-orm'
import type { MeasurementSet, UpsertMeasurementSetInput } from '@/src/models'
import type { MeasurementSetsRepo } from '../types'
import type { Db } from '../client'
import {
  globalMeasurementSets,
  projectGlobalMeasurementSets,
  projectMeasurementSets,
} from '../schema'
import { toGlobalMeasurementSet, toProjectMeasurementSet } from './mappers'

export class NeonMeasurementSets implements MeasurementSetsRepo {
  constructor(private readonly db: Db) {}

  private ownership(userId: string, msId: number) {
    return and(eq(globalMeasurementSets.id, msId), eq(globalMeasurementSets.user_id, userId))
  }

  async listGlobal(userId: string): Promise<MeasurementSet[]> {
    const rows = await this.db
      .select()
      .from(globalMeasurementSets)
      .where(eq(globalMeasurementSets.user_id, userId))
    return rows.map(toGlobalMeasurementSet)
  }

  async createGlobal(
    userId: string,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet> {
    const [row] = await this.db
      .insert(globalMeasurementSets)
      .values({ user_id: userId, name: input.name, measurements: input.measurements })
      .returning()
    return toGlobalMeasurementSet(row)
  }

  async updateGlobal(
    userId: string,
    msId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null> {
    const [row] = await this.db
      .update(globalMeasurementSets)
      .set({ name: input.name, measurements: input.measurements })
      .where(this.ownership(userId, msId))
      .returning()
    return row ? toGlobalMeasurementSet(row) : null
  }

  async removeGlobal(userId: string, msId: number): Promise<boolean> {
    const rows = await this.db
      .delete(globalMeasurementSets)
      .where(this.ownership(userId, msId))
      .returning({ id: globalMeasurementSets.id })
    return rows.length > 0
  }

  async listForProject(projectId: number): Promise<MeasurementSet[]> {
    const rows = await this.db
      .select()
      .from(projectMeasurementSets)
      .where(eq(projectMeasurementSets.project_id, projectId))
    return rows.map(toProjectMeasurementSet)
  }

  async createForProject(
    projectId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null> {
    const [row] = await this.db
      .insert(projectMeasurementSets)
      .values({ project_id: projectId, name: input.name, measurements: input.measurements })
      .returning()
    return row ? toProjectMeasurementSet(row) : null
  }

  async updateForProject(
    projectId: number,
    msId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null> {
    const [row] = await this.db
      .update(projectMeasurementSets)
      .set({ name: input.name, measurements: input.measurements })
      .where(
        and(
          eq(projectMeasurementSets.id, msId),
          eq(projectMeasurementSets.project_id, projectId),
        ),
      )
      .returning()
    return row ? toProjectMeasurementSet(row) : null
  }

  async removeForProject(projectId: number, msId: number): Promise<boolean> {
    const rows = await this.db
      .delete(projectMeasurementSets)
      .where(
        and(
          eq(projectMeasurementSets.id, msId),
          eq(projectMeasurementSets.project_id, projectId),
        ),
      )
      .returning({ id: projectMeasurementSets.id })
    return rows.length > 0
  }

  async unlinkGlobal(projectId: number, globalMsId: number): Promise<boolean> {
    const rows = await this.db
      .delete(projectGlobalMeasurementSets)
      .where(
        and(
          eq(projectGlobalMeasurementSets.project_id, projectId),
          eq(projectGlobalMeasurementSets.global_ms_id, globalMsId),
        ),
      )
      .returning({ project_id: projectGlobalMeasurementSets.project_id })
    return rows.length > 0
  }
}
