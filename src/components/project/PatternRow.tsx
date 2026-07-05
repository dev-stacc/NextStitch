'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { patternsApi } from '@/src/api'
import type { Pattern } from '@/src/models'
import DeleteButton from '@/src/components/ui/DeleteButton'
import PatternModal from './PatternModal'
import PatternThumbnail, { patternIsUpload } from './PatternThumbnail'

interface Props {
  pattern: Pattern
  projectId: number | string
  onOpenPreview: (pattern: Pattern) => void
  onRemoved: (patternId: number) => void
  onUpdated: (pattern: Pattern) => void
  onTogglePurchase: (pattern: Pattern, newPurchased: 0 | 1) => void
}

export default function PatternRow({
  pattern,
  projectId,
  onOpenPreview,
  onRemoved,
  onUpdated,
  onTogglePurchase,
}: Props) {
  const [viewing, setViewing] = useState(false)
  const isPurchased = !!pattern.purchased
  const isUpload = patternIsUpload(pattern)

  async function handleDelete() {
    try {
      await patternsApi.remove(projectId, pattern.id)
      onRemoved(pattern.id)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const title = pattern.title ?? pattern.pattern_number ?? 'Untitled'

  return (
    <>
      {viewing && (
        <PatternModal
          pattern={pattern}
          projectId={projectId}
          onSaved={(updated) => {
            onUpdated(updated)
            setViewing(false)
          }}
          onClose={() => setViewing(false)}
        />
      )}
      <div
        className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-300 transition-colors ${
          isPurchased ? 'opacity-60' : ''
        }`}
      >
        <input
          type="checkbox"
          className="checkbox checkbox-sm shrink-0"
          checked={isPurchased}
          onChange={() => onTogglePurchase(pattern, isPurchased ? 0 : 1)}
        />
        <div
          className="w-12 h-12 flex-none rounded overflow-hidden bg-base-200 border border-base-300 cursor-pointer"
          onClick={() => (isUpload ? onOpenPreview(pattern) : setViewing(true))}
        >
          <PatternThumbnail pattern={pattern} />
        </div>
        <span
          className={`flex-1 text-sm font-medium truncate min-w-0 ${
            isPurchased ? 'line-through' : ''
          }`}
        >
          {title}
        </span>
        {pattern.price && (
          <span className="text-xs text-base-content/60 shrink-0">{pattern.price}</span>
        )}
        <button
          type="button"
          className="btn btn-xs btn-ghost shrink-0"
          onClick={() => setViewing(true)}
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <DeleteButton onConfirm={handleDelete} />
      </div>
    </>
  )
}
