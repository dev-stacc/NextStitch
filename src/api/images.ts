import type { ProjectImage } from '@/src/domain'
import { requestForm, requestVoid } from './http'

export interface ProgressImagesApi {
  upload(projectId: number | string, file: File): Promise<ProjectImage>
  remove(projectId: number | string, imageId: number): Promise<void>
}

export const progressImagesApi: ProgressImagesApi = {
  upload: (projectId, file) => {
    const form = new FormData()
    form.append('file', file)
    return requestForm<ProjectImage>(`/api/projects/${projectId}/progress-images`, form)
  },
  remove: (projectId, imageId) =>
    requestVoid(`/api/projects/${projectId}/progress-images/${imageId}`, { method: 'DELETE' }),
}
