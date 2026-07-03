import { describe, expect, it } from 'vitest'
import type { Project, ProjectDetail, ProjectImage } from '@/src/models'
import { POST as createProject } from '@/app/api/projects/route'
import { GET as getProject } from '@/app/api/projects/[id]/route'
import { POST as addProgress } from '@/app/api/projects/[id]/progress-images/route'
import { DELETE as removeProgress } from '@/app/api/projects/[id]/progress-images/[imageId]/route'
import { ctx, formRequest, jsonRequest } from '../helpers'

async function seedProject(): Promise<Project> {
  const res = await createProject(jsonRequest('/api/projects', { method: 'POST', body: { name: 'p' } }))
  return (await res.json()) as Project
}

function imageForm(name: string): FormData {
  const fd = new FormData()
  fd.set('file', new File(['fake'], name, { type: 'image/jpeg' }))
  return fd
}

describe('progress images route handlers', () => {
  it('uploads a progress image and stores it on the project', async () => {
    const project = await seedProject()
    const res = await addProgress(
      formRequest(`/api/projects/${project.id}/progress-images`, imageForm('a.jpg')),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(201)
    const img = (await res.json()) as ProjectImage
    expect(img.url.startsWith('data:image/jpeg;base64,')).toBe(true)

    const detail = (await (
      await getProject(jsonRequest(`/api/projects/${project.id}`), ctx({ id: String(project.id) }))
    ).json()) as ProjectDetail
    expect(detail.progress_images).toHaveLength(1)
  })

  it('rejects an upload without a file', async () => {
    const project = await seedProject()
    const res = await addProgress(
      formRequest(`/api/projects/${project.id}/progress-images`, new FormData()),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(400)
  })

  it('removes a progress image', async () => {
    const project = await seedProject()
    const created = (await (
      await addProgress(
        formRequest(`/api/projects/${project.id}/progress-images`, imageForm('a.jpg')),
        ctx({ id: String(project.id) }),
      )
    ).json()) as ProjectImage

    const del = await removeProgress(
      jsonRequest(`/api/projects/${project.id}/progress-images/${created.id}`, { method: 'DELETE' }),
      ctx({ id: String(project.id), imageId: String(created.id) }),
    )
    expect(del.status).toBe(204)
  })
})
