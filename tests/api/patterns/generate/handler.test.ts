import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pattern, Project } from '@/src/models'
import { POST as createProject } from '@/app/api/projects/route'
import { ctx, jsonRequest } from '../../../helpers'

const messagesCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: messagesCreate }
  },
}))

const { POST: generateAi } = await import(
  '@/app/api/projects/[id]/patterns/generate-ai/route'
)

async function seedProject(): Promise<Project> {
  const res = await createProject(
    jsonRequest('/api/projects', { method: 'POST', body: { name: 'p' } }),
  )
  return (await res.json()) as Project
}

const VALID_SPEC = {
  title: 'Test skirt',
  instructions: ['Cut two panels', 'Sew sides'],
  pieces: [
    {
      name: 'Front',
      shape: 'rectangle',
      dimensions: { width_cm: 40, height_cm: 60 },
      cut_count: 1,
      on_fold: true,
      grain: 'straight',
    },
  ],
}

beforeEach(() => messagesCreate.mockReset())
afterEach(() => vi.clearAllMocks())

describe('/api/projects/[id]/patterns/generate-ai', () => {
  it('rejects a missing prompt', async () => {
    const project = await seedProject()
    const res = await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: '', measurements: {} },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(400)
  })

  it('generates a pattern with a PDF data URL', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(VALID_SPEC) }],
    })
    const project = await seedProject()
    const res = await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: 'A-line skirt', measurements: { waist: 74, hips: 98 } },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(201)
    const patterns = (await res.json()) as Pattern[]
    expect(patterns).toHaveLength(1)
    expect(patterns[0].source).toBe('generated')
    expect(patterns[0].title).toBe('Test skirt')
    expect(patterns[0].url?.startsWith('data:application/pdf;base64,')).toBe(true)
  })

  it('sends measurements as a comma-separated string to Claude', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(VALID_SPEC) }],
    })
    const project = await seedProject()
    await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: 'skirt', measurements: { waist: 74, hips: 98, chest: null } },
      }),
      ctx({ id: String(project.id) }),
    )
    const call = messagesCreate.mock.calls[0]![0]
    expect(call.messages[0].content).toBe(
      'Measurements: waist=74 cm, hips=98 cm\nGarment: skirt',
    )
  })

  it('strips markdown fences before parsing the JSON', async () => {
    messagesCreate.mockResolvedValue({
      content: [
        { type: 'text', text: '```json\n' + JSON.stringify(VALID_SPEC) + '\n```' },
      ],
    })
    const project = await seedProject()
    const res = await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: 'skirt', measurements: {} },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(201)
  })

  it('returns 502 when Claude returns unparseable JSON', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'this is not JSON' }],
    })
    const project = await seedProject()
    const res = await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: 'skirt', measurements: {} },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(502)
  })

  it("returns 502 when Claude's spec is missing pieces", async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ title: 'x', instructions: [] }) }],
    })
    const project = await seedProject()
    const res = await generateAi(
      jsonRequest(`/api/projects/${project.id}/patterns/generate-ai`, {
        method: 'POST',
        body: { prompt: 'skirt', measurements: {} },
      }),
      ctx({ id: String(project.id) }),
    )
    expect(res.status).toBe(502)
  })
})
