'use client'

import { type FormEvent, useState } from 'react'
import { llmApi, materialsApi } from '@/src/api'
import type { CreateMaterialInput, Material, MaterialSearchHit } from '@/src/models'
import Spinner from '@/src/components/ui/Spinner'
import { MATERIAL_SOURCES } from '@/src/lib/constants'
import MaterialSearchResultRow from './MaterialSearchResultRow'

interface Props {
  projectId: number | string
  onSave: (input: CreateMaterialInput) => Promise<Material>
}

function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

export default function SearchSection({ projectId, onSave }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MaterialSearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState(false)

  async function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setResults([])
    const responses = await Promise.allSettled(
      MATERIAL_SOURCES.map((source) => materialsApi.search(source, q)),
    )
    const all = responses
      .filter((r): r is PromiseFulfilledResult<MaterialSearchHit[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
    setResults(all)
    setLoading(false)
    setSaved(new Set())
  }

  async function handleSuggest() {
    setSuggesting(true)
    try {
      const suggestion = await llmApi.suggestMaterials(Number(projectId))
      setQuery(suggestion)
      await doSearch(suggestion)
    } finally {
      setSuggesting(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await doSearch(query)
  }

  async function handleAdd(hit: MaterialSearchHit) {
    setSavingKey(hit.url)
    try {
      await onSave({
        name: hit.title,
        quantity: '',
        notes: hit.url,
        image_url: hit.image_url ?? null,
        price: parsePrice(hit.price),
      })
      setSaved((prev) => new Set([...prev, hit.url]))
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="flex flex-col md:flex-1 md:min-h-0">
      <h2 className="text-lg font-medium mb-4 shrink-0">Search fabric stores</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4 shrink-0">
        <input
          type="text"
          placeholder="Search all stores…"
          className="input input-bordered flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="btn border-orange-500 text-orange-500 hover:bg-orange-500 hover:border-orange-500 hover:text-white"
          disabled={suggesting || loading}
          onClick={handleSuggest}
        >
          {suggesting ? <Spinner size="sm" /> : 'Suggest'}
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
          {loading ? <Spinner size="sm" /> : 'Search'}
        </button>
      </form>

      <div className="overflow-y-auto md:flex-1 md:min-h-0 space-y-3 pr-1">
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}
        {!loading && results.length === 0 && query && (
          <p className="text-base-content/40 text-sm text-center py-12">No results.</p>
        )}
        {results.map((hit, i) => (
          <MaterialSearchResultRow
            key={`${hit.url}-${i}`}
            hit={hit}
            saving={savingKey === hit.url}
            saved={saved.has(hit.url)}
            onAdd={() => handleAdd(hit)}
          />
        ))}
      </div>
    </div>
  )
}
