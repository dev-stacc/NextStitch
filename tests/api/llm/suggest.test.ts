import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Project } from '@/src/models'
import { POST as createProject } from '@/app/api/projects/route'
import { jsonRequest } from '../../helpers'
import { setTestUserIdForTests } from '@/src/server/auth-helpers'
import { OTHER_USER_ID, TEST_USER_ID } from '../../setup'

const messagesCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: messagesCreate }
  },
}))

const { POST: suggestPatterns } = await import('@/app/api/llm/suggest-patterns/route')
const { POST: suggestMaterials } = await import('@/app/api/llm/suggest-materials/route')

async function seedProject(name = 'Spring dress', description = 'A-line linen'): Promise<Project> {
  const res = await createProject(
    jsonRequest('/api/projects', {
      method: 'POST',
      body: { name, description },
    }),
  )
  return (await res.json()) as Project
}

beforeEach(() => messagesCreate.mockReset())
afterEach(() => vi.clearAllMocks())

describe('/api/llm/suggest-patterns', () => {
  it('rejects an unauthenticated request', async () => {
    setTestUserIdForTests(null)
    const res = await suggestPatterns(
      jsonRequest('/api/llm/suggest-patterns', { method: 'POST', body: { project_id: 1 } }),
    )
    expect(res.status).toBe(401)
  })

  it('rejects a missing project_id', async () => {
    const res = await suggestPatterns(
      jsonRequest('/api/llm/suggest-patterns', { method: 'POST', body: {} }),
    )
    expect(res.status).toBe(400)
  })

  it("returns 404 when the project isn't owned by the caller", async () => {
    const alice = await seedProject()
    setTestUserIdForTests(OTHER_USER_ID)
    const res = await suggestPatterns(
      jsonRequest('/api/llm/suggest-patterns', {
        method: 'POST',
        body: { project_id: alice.id },
      }),
    )
    expect(res.status).toBe(404)
  })

  it('sends project name + description to Claude and returns the reply', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'flowy summer dress' }],
    })
    const project = await seedProject('Beach party', 'Loose, breezy, cotton')
    const res = await suggestPatterns(
      jsonRequest('/api/llm/suggest-patterns', {
        method: 'POST',
        body: { project_id: project.id },
      }),
    )
    expect(await res.json()).toBe('flowy summer dress')

    const call = messagesCreate.mock.calls[0]![0]
    expect(call.model).toBe('claude-haiku-4-5')
    expect(call.max_tokens).toBe(16)
    expect(call.system).toMatch(/single search query of 1-3 words/)
    expect(call.messages[0].content).toBe(
      'Project: Beach party\nDescription: Loose, breezy, cotton',
    )
  })

  it('handles a null description', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'linen dress' }],
    })
    const project = await seedProject('Just a name', '')
    setTestUserIdForTests(TEST_USER_ID)
    // Force the DataStore to persist a null description
    const store = (await import('@/src/server/db')).getStore()
    await store.projects.update(TEST_USER_ID, project.id, { description: null })
    await suggestPatterns(
      jsonRequest('/api/llm/suggest-patterns', {
        method: 'POST',
        body: { project_id: project.id },
      }),
    )
    const call = messagesCreate.mock.calls[0]![0]
    expect(call.messages[0].content).toContain('No description provided.')
  })

})

describe('/api/llm/suggest-materials', () => {
  it('returns the fabric word from Claude', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'taffeta' }],
    })
    const project = await seedProject('Ball gown', 'Structured, formal')
    const res = await suggestMaterials(
      jsonRequest('/api/llm/suggest-materials', {
        method: 'POST',
        body: { project_id: project.id },
      }),
    )
    expect(await res.json()).toBe('taffeta')
    const call = messagesCreate.mock.calls[0]![0]
    expect(call.system).toMatch(/single 1-word fabric or notion/)
  })

  it('returns [] as empty string when Claude returns no text block', async () => {
    messagesCreate.mockResolvedValue({ content: [] })
    const project = await seedProject()
    const res = await suggestMaterials(
      jsonRequest('/api/llm/suggest-materials', {
        method: 'POST',
        body: { project_id: project.id },
      }),
    )
    expect(await res.json()).toBe('')
  })
})
