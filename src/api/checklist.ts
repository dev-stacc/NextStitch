import type {
  ChecklistItem,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from '@/src/models'
import { requestForm, requestJson, requestVoid } from './http'
import type { UploadedImage } from './materials'

export interface ChecklistApi {
  list(projectId: number | string): Promise<ChecklistItem[]>
  create(projectId: number | string, input: CreateChecklistItemInput): Promise<ChecklistItem>
  update(
    projectId: number | string,
    itemId: number,
    input: UpdateChecklistItemInput,
  ): Promise<ChecklistItem>
  toggle(projectId: number | string, itemId: number): Promise<ChecklistItem>
  remove(projectId: number | string, itemId: number): Promise<void>
  reorder(projectId: number | string, ids: number[]): Promise<void>
  uploadImage(projectId: number | string, itemId: number, file: File): Promise<UploadedImage>
}

export const checklistApi: ChecklistApi = {
  list: (projectId) => requestJson<ChecklistItem[]>(`/api/projects/${projectId}/checklist`),
  create: (projectId, input) =>
    requestJson<ChecklistItem>(`/api/projects/${projectId}/checklist`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (projectId, itemId, input) =>
    requestJson<ChecklistItem>(`/api/projects/${projectId}/checklist/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  toggle: (projectId, itemId) =>
    requestJson<ChecklistItem>(`/api/projects/${projectId}/checklist/${itemId}/toggle`, {
      method: 'PATCH',
    }),
  remove: (projectId, itemId) =>
    requestVoid(`/api/projects/${projectId}/checklist/${itemId}`, { method: 'DELETE' }),
  reorder: (projectId, ids) =>
    requestVoid(`/api/projects/${projectId}/checklist/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }),
  uploadImage: (projectId, itemId, file) => {
    const form = new FormData()
    form.append('file', file)
    return requestForm<UploadedImage>(
      `/api/projects/${projectId}/checklist/${itemId}/upload-image`,
      form,
    )
  },
}
