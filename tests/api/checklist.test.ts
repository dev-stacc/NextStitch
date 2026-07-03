import { describe, expect, it } from 'vitest'
import type { ChecklistItem, Project } from '@/src/models'
import { POST as createProject } from '@/app/api/projects/route'
import {
  GET as listChecklist,
  POST as createItem,
} from '@/app/api/projects/[id]/checklist/route'
import {
  PATCH as updateItem,
  DELETE as deleteItem,
} from '@/app/api/projects/[id]/checklist/[itemId]/route'
import { PATCH as toggleItem } from '@/app/api/projects/[id]/checklist/[itemId]/toggle/route'
import { PATCH as reorder } from '@/app/api/projects/[id]/checklist/reorder/route'
import { ctx, jsonRequest } from '../helpers'

async function seedProject(): Promise<Project> {
  const res = await createProject(jsonRequest('/api/projects', { method: 'POST', body: { name: 'p' } }))
  return (await res.json()) as Project
}

async function seedItem(projectId: number, title: string): Promise<ChecklistItem> {
  const res = await createItem(
    jsonRequest(`/api/projects/${projectId}/checklist`, { method: 'POST', body: { title } }),
    ctx({ id: String(projectId) }),
  )
  return (await res.json()) as ChecklistItem
}

describe('checklist route handlers', () => {
  it('rejects an empty title', async () => {
    const project = await seedProject()
    const res = await createItem(
      jsonRequest(`/api/projects/${project.id}/checklist`, { method: 'POST', body: { title: '' } }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(400)
  })

  it('creates items and lists them in order', async () => {
    const project = await seedProject()
    const a = await seedItem(project.id, 'A')
    const b = await seedItem(project.id, 'B')
    const c = await seedItem(project.id, 'C')

    const list = (await (
      await listChecklist(jsonRequest(`/api/projects/${project.id}/checklist`), ctx({ id: String(project.id) }))
    ).json()) as ChecklistItem[]
    expect(list.map((i) => i.title)).toEqual(['A', 'B', 'C'])
    expect([a.id, b.id, c.id]).toEqual(list.map((i) => i.id))
  })

  it('toggles checked and back', async () => {
    const project = await seedProject()
    const item = await seedItem(project.id, 'X')

    const checked = (await (
      await toggleItem(
        jsonRequest(`/api/projects/${project.id}/checklist/${item.id}/toggle`, { method: 'PATCH' }),
        ctx({ id: String(project.id), itemId: String(item.id) }),
      )
    ).json()) as ChecklistItem
    expect(checked.checked).toBe(1)

    const unchecked = (await (
      await toggleItem(
        jsonRequest(`/api/projects/${project.id}/checklist/${item.id}/toggle`, { method: 'PATCH' }),
        ctx({ id: String(project.id), itemId: String(item.id) }),
      )
    ).json()) as ChecklistItem
    expect(unchecked.checked).toBe(0)
  })

  it('updates title/notes/image_urls', async () => {
    const project = await seedProject()
    const item = await seedItem(project.id, 'X')
    const res = await updateItem(
      jsonRequest(`/api/projects/${project.id}/checklist/${item.id}`, {
        method: 'PATCH',
        body: { title: 'X2', notes: 'go', image_urls: ['data:image/jpeg;base64,'] },
      }),
      ctx({ id: String(project.id), itemId: String(item.id) }),
    )
    const updated = (await res.json()) as ChecklistItem
    expect(updated.title).toBe('X2')
    expect(updated.notes).toBe('go')
    expect(updated.image_urls).toHaveLength(1)
  })

  it('reorders items by ids', async () => {
    const project = await seedProject()
    const a = await seedItem(project.id, 'A')
    const b = await seedItem(project.id, 'B')
    const c = await seedItem(project.id, 'C')

    const res = await reorder(
      jsonRequest(`/api/projects/${project.id}/checklist/reorder`, {
        method: 'PATCH',
        body: { ids: [c.id, a.id, b.id] },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(204)

    const list = (await (
      await listChecklist(jsonRequest(`/api/projects/${project.id}/checklist`), ctx({ id: String(project.id) }))
    ).json()) as ChecklistItem[]
    expect(list.map((i) => i.title)).toEqual(['C', 'A', 'B'])
  })

  it('deletes an item', async () => {
    const project = await seedProject()
    const item = await seedItem(project.id, 'X')
    const del = await deleteItem(
      jsonRequest(`/api/projects/${project.id}/checklist/${item.id}`, { method: 'DELETE' }),
      ctx({ id: String(project.id), itemId: String(item.id) }),
    )
    expect(del.status).toBe(204)
  })
})
