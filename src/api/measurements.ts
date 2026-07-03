import type { MeasurementSet, UpsertMeasurementSetInput } from '@/src/models'
import { requestJson, requestVoid } from './http'

export interface MeasurementsApi {
  listGlobal(): Promise<MeasurementSet[]>
  createGlobal(input: UpsertMeasurementSetInput): Promise<MeasurementSet>
  updateGlobal(msId: number | string, input: UpsertMeasurementSetInput): Promise<MeasurementSet>
  removeGlobal(msId: number | string): Promise<void>

  listForProject(projectId: number | string): Promise<MeasurementSet[]>
  createForProject(projectId: number | string, input: UpsertMeasurementSetInput): Promise<MeasurementSet>
  updateForProject(
    projectId: number | string,
    msId: number | string,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet>
  removeForProject(projectId: number | string, msId: number): Promise<void>
  unlinkGlobalFromProject(projectId: number | string, globalMsId: number): Promise<void>
}

export const measurementsApi: MeasurementsApi = {
  listGlobal: () => requestJson<MeasurementSet[]>('/api/measurements'),
  createGlobal: (input) =>
    requestJson<MeasurementSet>('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateGlobal: (msId, input) =>
    requestJson<MeasurementSet>(`/api/measurements/${msId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  removeGlobal: (msId) =>
    requestVoid(`/api/measurements/${msId}`, { method: 'DELETE' }),
  listForProject: (projectId) =>
    requestJson<MeasurementSet[]>(`/api/projects/${projectId}/measurement-sets`),
  createForProject: (projectId, input) =>
    requestJson<MeasurementSet>(`/api/projects/${projectId}/measurement-sets`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateForProject: (projectId, msId, input) =>
    requestJson<MeasurementSet>(`/api/projects/${projectId}/measurement-sets/${msId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  removeForProject: (projectId, msId) =>
    requestVoid(`/api/projects/${projectId}/measurement-sets/${msId}`, { method: 'DELETE' }),
  unlinkGlobalFromProject: (projectId, globalMsId) =>
    requestVoid(`/api/projects/${projectId}/global-measurement-sets/${globalMsId}`, {
      method: 'DELETE',
    }),
}
