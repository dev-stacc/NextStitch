import { describe, expect, it } from 'vitest'
import type { MeasurementSet, Project, ProjectDetail } from '@/src/models'
import {
  GET as listGlobal,
  POST as createGlobal,
} from '@/app/api/measurements/route'
import {
  PATCH as updateGlobal,
  DELETE as deleteGlobal,
} from '@/app/api/measurements/[msId]/route'
import { POST as createProject } from '@/app/api/projects/route'
import { GET as getProject } from '@/app/api/projects/[id]/route'
import {
  GET as listForProject,
  POST as createForProject,
} from '@/app/api/projects/[id]/measurement-sets/route'
import {
  PATCH as updateForProject,
  DELETE as deleteForProject,
} from '@/app/api/projects/[id]/measurement-sets/[msId]/route'
import { DELETE as unlinkGlobal } from '@/app/api/projects/[id]/global-measurement-sets/[globalMsId]/route'
import { ctx, jsonRequest } from '../helpers'

describe('measurement-set route handlers', () => {
  it('CRUD on the global measurement sets collection', async () => {
    const create = await createGlobal(
      jsonRequest('/api/measurements', {
        method: 'POST',
        body: { name: 'Baseline', measurements: { chest: 92, waist: 74 } },
      }),
    )
    const created = (await create.json()) as MeasurementSet
    expect(created.name).toBe('Baseline')
    expect(created.measurements.chest).toBe(92)

    const listed = (await (await listGlobal()).json()) as MeasurementSet[]
    expect(listed).toHaveLength(1)

    const patched = (await (
      await updateGlobal(
        jsonRequest(`/api/measurements/${created.id}`, {
          method: 'PATCH',
          body: { name: 'Baseline v2', measurements: { chest: 93 } },
        }),
        ctx({ msId: String(created.id) }),
      )
    ).json()) as MeasurementSet
    expect(patched.name).toBe('Baseline v2')
    expect(patched.measurements.chest).toBe(93)

    const del = await deleteGlobal(
      jsonRequest(`/api/measurements/${created.id}`, { method: 'DELETE' }),
      ctx({ msId: String(created.id) }),
    )
    expect(del.status).toBe(204)
  })

  it('rejects create-global without a name', async () => {
    const res = await createGlobal(jsonRequest('/api/measurements', { method: 'POST', body: {} }))
    expect(res.status).toBe(400)
  })

  it('links a global set at project creation and unlinks it later', async () => {
    const global = (await (
      await createGlobal(
        jsonRequest('/api/measurements', { method: 'POST', body: { name: 'G', measurements: {} } }),
      )
    ).json()) as MeasurementSet

    const project = (await (
      await createProject(
        jsonRequest('/api/projects', {
          method: 'POST',
          body: { name: 'linked', global_measurement_set_ids: [global.id] },
        }),
      )
    ).json()) as Project

    let detail = (await (
      await getProject(jsonRequest(`/api/projects/${project.id}`), ctx({ id: String(project.id) }))
    ).json()) as ProjectDetail
    expect(detail.global_measurement_sets).toHaveLength(1)

    const unlink = await unlinkGlobal(
      jsonRequest(`/api/projects/${project.id}/global-measurement-sets/${global.id}`, { method: 'DELETE' }),
      ctx({ id: String(project.id), globalMsId: String(global.id) }),
    )
    expect(unlink.status).toBe(204)

    detail = (await (
      await getProject(jsonRequest(`/api/projects/${project.id}`), ctx({ id: String(project.id) }))
    ).json()) as ProjectDetail
    expect(detail.global_measurement_sets).toEqual([])
  })

  it('CRUD on project-scoped measurement sets', async () => {
    const project = (await (
      await createProject(jsonRequest('/api/projects', { method: 'POST', body: { name: 'p' } }))
    ).json()) as Project

    const created = (await (
      await createForProject(
        jsonRequest(`/api/projects/${project.id}/measurement-sets`, {
          method: 'POST',
          body: { name: 'Local', measurements: { chest: 94 } },
        }),
        ctx({ id: String(project.id) }),
      )
    ).json()) as MeasurementSet

    const list = (await (
      await listForProject(
        jsonRequest(`/api/projects/${project.id}/measurement-sets`),
        ctx({ id: String(project.id) }),
      )
    ).json()) as MeasurementSet[]
    expect(list).toHaveLength(1)

    const patched = (await (
      await updateForProject(
        jsonRequest(`/api/projects/${project.id}/measurement-sets/${created.id}`, {
          method: 'PATCH',
          body: { name: 'Local v2', measurements: { chest: 95 } },
        }),
        ctx({ id: String(project.id), msId: String(created.id) }),
      )
    ).json()) as MeasurementSet
    expect(patched.name).toBe('Local v2')

    const del = await deleteForProject(
      jsonRequest(`/api/projects/${project.id}/measurement-sets/${created.id}`, { method: 'DELETE' }),
      ctx({ id: String(project.id), msId: String(created.id) }),
    )
    expect(del.status).toBe(204)
  })
})
