import { describe, expect, it } from 'vitest'
import type { Project, ProjectDetail } from '@/src/models'
import { GET as listProjects, POST as createProject } from '@/app/api/projects/route'
import {
  GET as getProject,
  PATCH as updateProject,
  DELETE as deleteProject,
} from '@/app/api/projects/[id]/route'
import { PATCH as setStatus } from '@/app/api/projects/[id]/status/route'
import { ctx, jsonRequest } from '../helpers'

async function seedProject(name = 'Test'): Promise<Project> {
  const res = await createProject(
    jsonRequest('/api/projects', { method: 'POST', body: { name, description: 'x', budget: 20 } }),
  )
  return (await res.json()) as Project
}

describe('projects route handlers', () => {
  it('lists nothing on a fresh store', async () => {
    const res = await listProjects()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('creates and lists a project', async () => {
    const created = await seedProject('Spring dress')
    expect(created.id).toBeTypeOf('number')
    expect(created.status).toBe('to_start')
    expect(created.total_spent).toBe(0)

    const list = await (await listProjects()).json()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Spring dress')
  })

  it('rejects a create without a name', async () => {
    const res = await createProject(jsonRequest('/api/projects', { method: 'POST', body: {} }))
    expect(res.status).toBe(400)
  })

  it('gets a project by id with empty relations', async () => {
    const created = await seedProject()
    const res = await getProject(jsonRequest(`/api/projects/${created.id}`), ctx({ id: String(created.id) }))
    expect(res.status).toBe(200)
    const detail = (await res.json()) as ProjectDetail
    expect(detail.patterns).toEqual([])
    expect(detail.materials).toEqual([])
    expect(detail.checklist).toEqual([])
  })

  it('returns 404 for missing project', async () => {
    const res = await getProject(jsonRequest('/api/projects/9999'), ctx({ id: '9999' }))
    expect(res.status).toBe(404)
  })

  it('patches name/description/budget', async () => {
    const created = await seedProject()
    const res = await updateProject(
      jsonRequest(`/api/projects/${created.id}`, { method: 'PATCH', body: { name: 'Renamed', budget: 50 } }),
      ctx({ id: String(created.id) }),
    )
    expect(res.status).toBe(200)
    const updated = (await res.json()) as Project
    expect(updated.name).toBe('Renamed')
    expect(updated.budget).toBe(50)
  })

  it('sets status and rejects invalid ones', async () => {
    const created = await seedProject()
    const ok = await setStatus(
      jsonRequest(`/api/projects/${created.id}/status`, { method: 'PATCH', body: { status: 'in_progress' } }),
      ctx({ id: String(created.id) }),
    )
    expect(ok.status).toBe(204)

    const bad = await setStatus(
      jsonRequest(`/api/projects/${created.id}/status`, { method: 'PATCH', body: { status: 'nope' } }),
      ctx({ id: String(created.id) }),
    )
    expect(bad.status).toBe(400)
  })

  it('deletes a project', async () => {
    const created = await seedProject()
    const del = await deleteProject(
      jsonRequest(`/api/projects/${created.id}`, { method: 'DELETE' }),
      ctx({ id: String(created.id) }),
    )
    expect(del.status).toBe(204)

    const list = await (await listProjects()).json()
    expect(list).toHaveLength(0)
  })
})
