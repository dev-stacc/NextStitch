'use client'

import { type FormEvent, useState } from 'react'
import { llmApi, patternsApi } from '@/src/api'
import type { CreatePatternInput, Pattern, PatternSearchHit } from '@/src/domain'
import Spinner from '@/src/components/ui/Spinner'
import { PATTERN_SOURCES } from '@/src/lib/constants'
import PatternSearchResultRow from './PatternSearchResultRow'

interface Props {
  projectId: number | string
  onSave: (input: CreatePatternInput) => Promise<Pattern>
}

export default function ScrapeSection({ projectId, onSave }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PatternSearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState(false)

  async function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setResults([])
    const responses = await Promise.allSettled(
      PATTERN_SOURCES.map((source) => patternsApi.search(source, q)),
    )
    const all = responses
      .filter((r): r is PromiseFulfilledResult<PatternSearchHit[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
    setResults(all)
    setLoading(false)
  }

  async function handleSuggest() {
    setSuggesting(true)
    try {
      const suggestion = await llmApi.suggestPatterns(Number(projectId))
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

  async function handleAdd(hit: PatternSearchHit) {
    setSavingKey(hit.url)
    try {
      await onSave({
        source: hit.source,
        title: hit.title,
        url: hit.url,
        image_url: hit.image_url ?? null,
        price: hit.price ?? null,
      })
      setSaved((prev) => new Set([...prev, hit.url]))
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="flex flex-col md:flex-1 md:min-h-0">
      <h2 className="text-lg font-medium mb-4 shrink-0">Search & scrape</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4 shrink-0">
        <input
          type="text"
          placeholder="Search all sources…"
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
        {results.map((hit) => (
          <PatternSearchResultRow
            key={`${hit.source}-${hit.url}`}
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
