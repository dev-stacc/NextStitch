import { describe, expect, it } from 'vitest'
import type { Material, Project } from '@/src/models'
import { POST as createProject } from '@/app/api/projects/route'
import { POST as createMaterial } from '@/app/api/projects/[id]/materials/route'
import {
  PATCH as updateMaterial,
  DELETE as deleteMaterial,
} from '@/app/api/projects/[id]/materials/[materialId]/route'
import { PATCH as editMaterial } from '@/app/api/projects/[id]/materials/[materialId]/edit/route'
import { POST as uploadImage } from '@/app/api/projects/[id]/materials/upload-image/route'
import { ctx, formRequest, jsonRequest } from '../helpers'

async function seedProject(): Promise<Project> {
  const res = await createProject(jsonRequest('/api/projects', { method: 'POST', body: { name: 'p' } }))
  return (await res.json()) as Project
}

async function seedMaterial(projectId: number): Promise<Material> {
  const res = await createMaterial(
    jsonRequest(`/api/projects/${projectId}/materials`, {
      method: 'POST',
      body: { name: 'Linen', quantity: '3yd', price: 42 },
    }),
    ctx({ id: String(projectId) }),
  )
  return (await res.json()) as Material
}

describe('materials route handlers', () => {
  it('rejects a material without a name', async () => {
    const project = await seedProject()
    const res = await createMaterial(
      jsonRequest(`/api/projects/${project.id}/materials`, { method: 'POST', body: {} }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(400)
  })

  it('creates a material with fabric fields', async () => {
    const project = await seedProject()
    const material = await seedMaterial(project.id)
    expect(material.pre_wash).toBe(0)
    expect(material.purchased).toBe(0)
  })

  it('toggles purchased via PATCH', async () => {
    const project = await seedProject()
    const material = await seedMaterial(project.id)

    const purchased = (await (
      await updateMaterial(
        jsonRequest(`/api/projects/${project.id}/materials/${material.id}`, {
          method: 'PATCH',
          body: { purchased: 1, price: 40, quantity: '2yd' },
        }),
        ctx({ id: String(project.id), materialId: String(material.id) }),
      )
    ).json()) as Material
    expect(purchased.purchased).toBe(1)
    expect(purchased.price).toBe(40)
    expect(purchased.quantity).toBe('2yd')
  })

  it('edits fabric metadata', async () => {
    const project = await seedProject()
    const material = await seedMaterial(project.id)
    const res = await editMaterial(
      jsonRequest(`/api/projects/${project.id}/materials/${material.id}/edit`, {
        method: 'PATCH',
        body: {
          name: 'Linen v2',
          care_instructions: 'Machine wash cold',
          grain_direction: 'straight',
          pre_wash: 1,
        },
      }),
      ctx({ id: String(project.id), materialId: String(material.id) }),
    )
    const updated = (await res.json()) as Material
    expect(updated.name).toBe('Linen v2')
    expect(updated.grain_direction).toBe('straight')
    expect(updated.pre_wash).toBe(1)
  })

  it('deletes a material', async () => {
    const project = await seedProject()
    const material = await seedMaterial(project.id)
    const del = await deleteMaterial(
      jsonRequest(`/api/projects/${project.id}/materials/${material.id}`, { method: 'DELETE' }),
      ctx({ id: String(project.id), materialId: String(material.id) }),
    )
    expect(del.status).toBe(204)
  })

  it('uploads an image and returns a data-url', async () => {
    const project = await seedProject()
    const form = new FormData()
    form.set('file', new File(['jpeg-bytes'], 'a.jpg', { type: 'image/jpeg' }))

    const res = await uploadImage(
      formRequest(`/api/projects/${project.id}/materials/upload-image`, form),
      ctx({ id: String(project.id) }),
    )
    const body = (await res.json()) as { url: string }
    expect(body.url.startsWith('data:image/jpeg;base64,')).toBe(true)
  })
})
