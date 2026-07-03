import type { ProjectImage } from '@/src/models'
import type { ProgressImagesRepo } from './types'
import { DbState, nextId } from './state'

export class MemoryProgressImages implements ProgressImagesRepo {
  constructor(private readonly state: DbState) {}

  async add(projectId: number, url: string): Promise<ProjectImage | null> {
    const row = this.state.projects.get(projectId)
    if (!row) return null
    const img: ProjectImage = { id: nextId(), url }
    row.progressImages.push(img)
    return img
  }

  async remove(projectId: number, imageId: number): Promise<boolean> {
    const row = this.state.projects.get(projectId)
    if (!row) return false
    const before = row.progressImages.length
    row.progressImages = row.progressImages.filter((i) => i.id !== imageId)
    return row.progressImages.length !== before
  }
}
