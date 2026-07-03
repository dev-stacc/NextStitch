import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectStatus,
  UpdateProjectInput,
} from '@/src/models'
import { requestJson, requestVoid } from './http'

export interface ProjectsApi {
  list(): Promise<Project[]>
  get(id: number | string): Promise<ProjectDetail>
  create(input: CreateProjectInput): Promise<Project>
  update(id: number | string, input: UpdateProjectInput): Promise<Project>
  setStatus(id: number | string, status: ProjectStatus): Promise<void>
  remove(id: number | string): Promise<void>
}

export const projectsApi: ProjectsApi = {
  list: () => requestJson<Project[]>('/api/projects'),
  get: (id) => requestJson<ProjectDetail>(`/api/projects/${id}`),
  create: (input) =>
    requestJson<Project>('/api/projects', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) =>
    requestJson<Project>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  setStatus: (id, status) =>
    requestVoid(`/api/projects/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
  remove: (id) => requestVoid(`/api/projects/${id}`, { method: 'DELETE' }),
}
