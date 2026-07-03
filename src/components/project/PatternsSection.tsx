'use client'

import type { Pattern } from '@/src/models'
import PatternRow from './PatternRow'
import SectionCard from './SectionCard'
import { patternsSpent } from '@/src/lib/project-totals'

interface Props {
  projectId: number | string
  patterns: Pattern[]
  onOpenPreview: (pattern: Pattern) => void
  onRemoved: (patternId: number) => void
  onUpdated: (pattern: Pattern) => void
  onTogglePurchase: (pattern: Pattern, newPurchased: 0 | 1) => void
}

export default function PatternsSection({
  projectId,
  patterns,
  onOpenPreview,
  onRemoved,
  onUpdated,
  onTogglePurchase,
}: Props) {
  const spent = patternsSpent(patterns)
  const sorted = [...patterns].sort((a, b) => (a.purchased ?? 0) - (b.purchased ?? 0))

  return (
    <SectionCard
      title="Patterns"
      addHref={`/projects/${projectId}/patterns/add`}
      subtitle={
        spent > 0 ? (
          <p className="text-xs text-base-content/50 mt-0.5">Expenses: ${spent.toFixed(2)}</p>
        ) : null
      }
    >
      {sorted.length > 0 ? (
        <div className="space-y-1">
          {sorted.map((p) => (
            <PatternRow
              key={p.id}
              pattern={p}
              projectId={projectId}
              onOpenPreview={onOpenPreview}
              onRemoved={onRemoved}
              onUpdated={onUpdated}
              onTogglePurchase={onTogglePurchase}
            />
          ))}
        </div>
      ) : (
        <p className="text-base-content/40 text-sm px-2">No patterns added yet.</p>
      )}
    </SectionCard>
  )
}
