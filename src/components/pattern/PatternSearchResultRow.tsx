'use client'

import Spinner from '@/src/components/ui/Spinner'
import type { PatternSearchHit } from '@/src/models'

interface Props {
  hit: PatternSearchHit
  saving: boolean
  saved: boolean
  onAdd: () => void
}

export default function PatternSearchResultRow({ hit, saving, saved, onAdd }: Props) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body py-3 flex-row items-center gap-3">
        {hit.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hit.image_url}
            alt={hit.title}
            className="w-14 h-14 object-cover rounded shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <a
            href={hit.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium line-clamp-2 text-sm hover:underline"
          >
            {hit.title}
          </a>
          <div className="flex gap-2 text-xs text-base-content/50 mt-1">
            {hit.pattern_number && <span>{hit.pattern_number}</span>}
            {hit.price && <span>{hit.price}</span>}
            <span className="capitalize">{hit.source.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-xs btn-primary shrink-0"
          disabled={saved || saving}
          onClick={onAdd}
        >
          {saving ? <Spinner size="xs" /> : saved ? '✓' : 'Add'}
        </button>
      </div>
    </div>
  )
}
