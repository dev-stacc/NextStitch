import { describe, expect, it } from 'vitest'
import type { MaterialSearchHit } from '@/src/models'
import { POST as materialSearch } from '@/app/api/materials/search/route'
import { POST as suggestPatterns } from '@/app/api/llm/suggest-patterns/route'
import { POST as suggestMaterials } from '@/app/api/llm/suggest-materials/route'
import { jsonRequest } from '../helpers'

// Canaries: they'll fail when the stubs are swapped for real impls.

describe('stub endpoints', () => {
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
    const r2 = await materialSearch(
      jsonRequest('/api/materials/search', { method: 'POST', body: { query: 'x' } }),
    )
    expect(r2.status).toBe(400)
  })
})
