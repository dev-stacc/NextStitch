'use client'

import { Eye } from 'lucide-react'
import DeleteButton from '@/src/components/ui/DeleteButton'
import type { MeasurementSet } from '@/src/models'

interface Props {
  ms: MeasurementSet
  badge?: string
  onView: () => void
  onDelete: () => void
}

export default function MeasurementSetRow({ ms, badge, onView, onDelete }: Props) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-300 transition-colors">
      <span className="flex-1 text-sm font-medium truncate min-w-0">{ms.name}</span>
      {badge && <span className="badge badge-ghost badge-xs shrink-0">{badge}</span>}
      <button
        type="button"
        className="btn btn-xs btn-ghost shrink-0"
        onClick={onView}
        title="View"
      >
        <Eye className="w-4 h-4" />
      </button>
      <DeleteButton className="shrink-0" onConfirm={onDelete} />
    </div>
  )
}
