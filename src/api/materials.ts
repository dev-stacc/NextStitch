import type {
  CreateMaterialInput,
  Material,
  MaterialSearchHit,
  UpdateMaterialInput,
} from '@/src/domain'
import { requestForm, requestJson, requestVoid } from './http'

export interface UploadedImage {
  url: string
}

export interface MaterialsApi {
  search(source: string, query: string): Promise<MaterialSearchHit[]>
  create(projectId: number | string, input: CreateMaterialInput): Promise<Material>
  update(projectId: number | string, materialId: number, input: UpdateMaterialInput): Promise<Material>
  edit(projectId: number | string, materialId: number, input: UpdateMaterialInput): Promise<Material>
  remove(projectId: number | string, materialId: number): Promise<void>
  uploadImage(projectId: number | string, file: File): Promise<UploadedImage>
}

export const materialsApi: MaterialsApi = {
  search: (source, query) =>
    requestJson<MaterialSearchHit[]>('/api/materials/search', {
      method: 'POST',
      body: JSON.stringify({ query, source }),
    }),
  create: (projectId, input) =>
    requestJson<Material>(`/api/projects/${projectId}/materials`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (projectId, materialId, input) =>
    requestJson<Material>(`/api/projects/${projectId}/materials/${materialId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  edit: (projectId, materialId, input) =>
    requestJson<Material>(`/api/projects/${projectId}/materials/${materialId}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  remove: (projectId, materialId) =>
    requestVoid(`/api/projects/${projectId}/materials/${materialId}`, { method: 'DELETE' }),
  uploadImage: (projectId, file) => {
    const form = new FormData()
    form.append('file', file)
    return requestForm<UploadedImage>(`/api/projects/${projectId}/materials/upload-image`, form)
  },
}
