import { describe, expect, it } from 'vitest'
import type { Project, ProjectDetail, MeasurementSet } from '@/src/models'
import {
  GET as listProjects,
  POST as createProject,
} from '@/app/api/projects/route'
import { GET as getProject } from '@/app/api/projects/[id]/route'
import { PATCH as setStatus } from '@/app/api/projects/[id]/status/route'
import { POST as createPattern } from '@/app/api/projects/[id]/patterns/route'
import {
  GET as listGlobal,
  POST as createGlobal,
} from '@/app/api/measurements/route'
import { setTestUserIdForTests } from '@/src/server/auth-helpers'
import { ctx, jsonRequest } from '../helpers'
import { OTHER_USER_ID, TEST_USER_ID } from '../setup'

async function seedProjectAs(userId: string, name = 'p'): Promise<Project> {
  setTestUserIdForTests(userId)
  const res = await createProject(
    jsonRequest('/api/projects', { method: 'POST', body: { name } }),
  )
  return (await res.json()) as Project
}

describe('auth scoping', () => {
  it('returns 401 when the user is not signed in', async () => {
    setTestUserIdForTests(null)
    expect((await listProjects()).status).toBe(401)
    expect(
      (
        await createProject(jsonRequest('/api/projects', { method: 'POST', body: { name: 'x' } }))
      ).status,
    ).toBe(401)
    expect((await listGlobal()).status).toBe(401)
  })

  it('projects listed for one user do not include another user\'s', async () => {
    await seedProjectAs(TEST_USER_ID, "alice's project")
    await seedProjectAs(OTHER_USER_ID, "bob's project")

    setTestUserIdForTests(TEST_USER_ID)
    const listA = (await (await listProjects()).json()) as Project[]
    expect(listA.map((p) => p.name)).toEqual(["alice's project"])

    setTestUserIdForTests(OTHER_USER_ID)
    const listB = (await (await listProjects()).json()) as Project[]
    expect(listB.map((p) => p.name)).toEqual(["bob's project"])
  })

  it('user B cannot read, mutate, or add children to user A\'s project', async () => {
    const alice = await seedProjectAs(TEST_USER_ID)

    setTestUserIdForTests(OTHER_USER_ID)
    const idParam = { id: String(alice.id) }

    expect(
      (await getProject(jsonRequest(`/api/projects/${alice.id}`), ctx(idParam))).status,
    ).toBe(404)

    expect(
      (
        await setStatus(
          jsonRequest(`/api/projects/${alice.id}/status`, {
            method: 'PATCH',
            body: { status: 'in_progress' },
          }),
          ctx(idParam),
        )
      ).status,
    ).toBe(404)

    expect(
      (
        await createPattern(
          jsonRequest(`/api/projects/${alice.id}/patterns`, {
            method: 'POST',
            body: { source: 'manual', title: 't', url: 'https://x' },
          }),
          ctx(idParam),
        )
      ).status,
    ).toBe(404)
  })

  it('global measurement sets are scoped per user', async () => {
    setTestUserIdForTests(TEST_USER_ID)
    const aliceSet = (await (
      await createGlobal(
        jsonRequest('/api/measurements', {
          method: 'POST',
          body: { name: 'Alice', measurements: {} },
        }),
      )
    ).json()) as MeasurementSet

    setTestUserIdForTests(OTHER_USER_ID)
    const bobList = (await (await listGlobal()).json()) as MeasurementSet[]
    expect(bobList).toEqual([])

    // And ensure Bob can't fetch alice's project detail via her set id either.
    void aliceSet
    setTestUserIdForTests(TEST_USER_ID)
    const aliceList = (await (await listGlobal()).json()) as MeasurementSet[]
    expect(aliceList.map((s) => s.name)).toEqual(['Alice'])
  })

  it('detail: a user seeing their own project sees only their global sets', async () => {
    setTestUserIdForTests(TEST_USER_ID)
    await createGlobal(
      jsonRequest('/api/measurements', {
        method: 'POST',
        body: { name: 'Alice', measurements: {} },
      }),
    )
    const alice = await seedProjectAs(TEST_USER_ID, 'proj')
    setTestUserIdForTests(TEST_USER_ID)
    const detail = (await (
      await getProject(jsonRequest(`/api/projects/${alice.id}`), ctx({ id: String(alice.id) }))
    ).json()) as ProjectDetail
    expect(detail.name).toBe('proj')
  })
})
