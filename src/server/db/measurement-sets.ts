import type { MeasurementSet, UpsertMeasurementSetInput } from '@/src/domain'
import type { MeasurementSetsRepo } from './types'
import { DbState, nextId } from './state'

export class MemoryMeasurementSets implements MeasurementSetsRepo {
  constructor(private readonly state: DbState) {}

  async listGlobal(): Promise<MeasurementSet[]> {
    return Array.from(this.state.globalSets.values())
  }

  async createGlobal(input: UpsertMeasurementSetInput): Promise<MeasurementSet> {
    const ms: MeasurementSet = {
      id: nextId(),
      name: input.name,
      measurements: { ...input.measurements },
    }
    this.state.globalSets.set(ms.id, ms)
    return ms
  }

  async updateGlobal(
    msId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null> {
    const existing = this.state.globalSets.get(msId)
    if (!existing) return null
    existing.name = input.name
    existing.measurements = { ...input.measurements }
    return existing
  }

  async removeGlobal(msId: number): Promise<boolean> {
    for (const row of this.state.projects.values()) {
      row.globalMeasurementSetIds.delete(msId)
    }
    return this.state.globalSets.delete(msId)
  }

  async listForProject(projectId: number): Promise<MeasurementSet[]> {
    const row = this.state.projects.get(projectId)
    return row ? [...row.measurementSets] : []
  }

  async createForProject(
    projectId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const ms: MeasurementSet = {
      id: nextId(),
      name: input.name,
      measurements: { ...input.measurements },
    }
    row.measurementSets.push(ms)
    return ms
  }

  async updateForProject(
    projectId: number,
    msId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const existing = row.measurementSets.find((m) => m.id === msId)
    if (!existing) return null
    existing.name = input.name
    existing.measurements = { ...input.measurements }
    return existing
  }

  async removeForProject(projectId: number, msId: number): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    const before = row.measurementSets.length
    row.measurementSets = row.measurementSets.filter((m) => m.id !== msId)
    return row.measurementSets.length !== before
  }

  async unlinkGlobal(projectId: number, globalMsId: number): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    return row.globalMeasurementSetIds.delete(globalMsId)
  }
}
