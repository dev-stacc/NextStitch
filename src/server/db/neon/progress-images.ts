import { and, eq, max } from 'drizzle-orm'
import type { ProjectImage } from '@/src/models'
import type { ProgressImagesRepo } from '../types'
import type { Db } from '../client'
import { progressImages } from '../schema'
import { toProgressImage } from './mappers'

export class NeonProgressImages implements ProgressImagesRepo {
  constructor(private readonly db: Db) {}

  async add(projectId: number, url: string): Promise<ProjectImage | null> {
    const [{ value: currentMax }] = await this.db
      .select({ value: max(progressImages.position) })
      .from(progressImages)
      .where(eq(progressImages.project_id, projectId))
    const position = (currentMax ?? -1) + 1
    const [row] = await this.db
      .insert(progressImages)
      .values({ project_id: projectId, url, position })
      .returning()
    return row ? toProgressImage(row) : null
  }

  async remove(projectId: number, imageId: number): Promise<boolean> {
    const rows = await this.db
      .delete(progressImages)
      .where(and(eq(progressImages.id, imageId), eq(progressImages.project_id, projectId)))
      .returning({ id: progressImages.id })
    return rows.length > 0
  }
}
