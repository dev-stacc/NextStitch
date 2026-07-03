import { describe, expect, it } from 'vitest'
import type { MaterialSearchHit, PatternSearchHit } from '@/src/models'
import { POST as patternSearch } from '@/app/api/patterns/search/route'
import { POST as materialSearch } from '@/app/api/materials/search/route'
import { POST as suggestPatterns } from '@/app/api/llm/suggest-patterns/route'
import { POST as suggestMaterials } from '@/app/api/llm/suggest-materials/route'
import { jsonRequest } from '../helpers'

// These endpoints are stubs — the tests document current behaviour so we notice
// when the real implementations land and the shapes change.

describe('stub endpoints', () => {
  it('patterns/search returns 3 hits per source', async () => {
    const res = await patternSearch(
      jsonRequest('/api/patterns/search', {
        method: 'POST',
        body: { query: 'dress', source: 'simplicity' },
      }),
    )
    const hits = (await res.json()) as PatternSearchHit[]
    expect(hits).toHaveLength(3)
    expect(hits[0].source).toBe('simplicity')
  })

  it('materials/search returns 3 hits per source', async () => {
    const res = await materialSearch(
      jsonRequest('/api/materials/search', {
        method: 'POST',
        body: { query: 'linen', source: 'fabricville' },
      }),
    )
    const hits = (await res.json()) as MaterialSearchHit[]
    expect(hits).toHaveLength(3)
  })

  it('LLM suggest endpoints return strings', async () => {
    expect(await (await suggestPatterns()).json()).toBeTypeOf('string')
    expect(await (await suggestMaterials()).json()).toBeTypeOf('string')
  })

  it('rejects search calls missing query or source', async () => {
    const r1 = await patternSearch(
      jsonRequest('/api/patterns/search', { method: 'POST', body: { query: '', source: 'simplicity' } }),
    )
    expect(r1.status).toBe(400)

    const r2 = await materialSearch(
      jsonRequest('/api/materials/search', { method: 'POST', body: { query: 'x' } }),
    )
    expect(r2.status).toBe(400)
  })
})
