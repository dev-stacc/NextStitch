import { describe, expect, it } from 'vitest'
import type { Pattern, Project } from '@/src/models'
import { POST as createProject } from '@/app/api/projects/route'
import { POST as createPattern } from '@/app/api/projects/[id]/patterns/route'
import {
  PATCH as updatePattern,
  DELETE as deletePattern,
} from '@/app/api/projects/[id]/patterns/[patternId]/route'
import { POST as uploadPattern } from '@/app/api/projects/[id]/patterns/upload/route'
import { POST as generateAi } from '@/app/api/projects/[id]/patterns/generate-ai/route'
import { ctx, formRequest, jsonRequest } from '../helpers'

async function seedProject(): Promise<Project> {
  const res = await createProject(jsonRequest('/api/projects', { method: 'POST', body: { name: 'p' } }))
  return (await res.json()) as Project
}

describe('patterns route handlers', () => {
  it('rejects a pattern without source or url', async () => {
    const project = await seedProject()
    const res = await createPattern(
      jsonRequest(`/api/projects/${project.id}/patterns`, { method: 'POST', body: { title: 't' } }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(400)
  })

  it('creates and updates a scraped pattern', async () => {
    const project = await seedProject()
    const created = (await (
      await createPattern(
        jsonRequest(`/api/projects/${project.id}/patterns`, {
          method: 'POST',
          body: { source: 'simplicity', title: 'S1', url: 'https://e/1', image_url: null, price: '$5' },
        }),
        ctx({ id: String(project.id) }),
      )
    ).json()) as Pattern
    expect(created.purchased).toBe(0)

    const patched = (await (
      await updatePattern(
        jsonRequest(`/api/projects/${project.id}/patterns/${created.id}`, {
          method: 'PATCH',
          body: { title: 'S1 v2', purchased: 1, price_paid: 5, notes: 'nice' },
        }),
        ctx({ id: String(project.id), patternId: String(created.id) }),
      )
    ).json()) as Pattern
    expect(patched.title).toBe('S1 v2')
    expect(patched.purchased).toBe(1)
    expect(patched.price_paid).toBe(5)
  })

  it('deletes a pattern', async () => {
    const project = await seedProject()
    const created = (await (
      await createPattern(
        jsonRequest(`/api/projects/${project.id}/patterns`, {
          method: 'POST',
          body: { source: 'manual', title: 'M', url: 'https://x' },
        }),
        ctx({ id: String(project.id) }),
      )
    ).json()) as Pattern

    const del = await deletePattern(
      jsonRequest(`/api/projects/${project.id}/patterns/${created.id}`, { method: 'DELETE' }),
      ctx({ id: String(project.id), patternId: String(created.id) }),
    )
    expect(del.status).toBe(204)
  })

  it('uploads a file and creates an upload-source pattern', async () => {
    const project = await seedProject()
    const form = new FormData()
    form.set('file', new File(['dummy'], 'sample.pdf', { type: 'application/pdf' }))
    form.set('title', 'my scan')
    form.set('notes', 'note')
    form.set('price_paid', '3.5')

    const res = await uploadPattern(
      formRequest(`/api/projects/${project.id}/patterns/upload`, form),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(201)
    const created = (await res.json()) as Pattern
    expect(created.source).toBe('upload')
    expect(created.title).toBe('my scan')
    expect(created.url?.startsWith('data:application/pdf;base64,')).toBe(true)
    expect(created.price_paid).toBe(3.5)
  })

  it('generate-ai returns an array with a stubbed generated pattern', async () => {
    const project = await seedProject()
    const res = await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: 'wide-leg pants', measurements: { waist: 74 } },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(201)
    const patterns = (await res.json()) as Pattern[]
    expect(patterns).toHaveLength(1)
    expect(patterns[0].source).toBe('generated')
  })
})
