'use client'

import type { ProjectStatus } from '@/src/models'
import { STATUS_OPTIONS } from '@/src/lib/constants'

export type SortField = 'title' | 'budget' | 'date'
export type SortDir = 'asc' | 'desc'
export type StatusFilter = 'all' | ProjectStatus

interface ProjectFiltersProps {
  sortBy: SortField | null
  sortDir: SortDir
  statusFilter: StatusFilter
  onToggleSort: (field: SortField) => void
  onStatusFilter: (v: StatusFilter) => void
  onClear: () => void
}

const SORT_FIELDS: readonly [SortField, string][] = [
  ['title', 'Title'],
  ['budget', 'Budget'],
  ['date', 'Date'],
]

export default function ProjectFilters(props: ProjectFiltersProps) {
  const { sortBy, sortDir, statusFilter, onToggleSort, onStatusFilter, onClear } = props
  const dirty = sortBy !== null || statusFilter !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
      {SORT_FIELDS.map(([field, label]) => (
        <button
          key={field}
          type="button"
          className={`btn btn-xs min-w-[4.5rem] ${sortBy === field ? 'btn-neutral' : 'btn-ghost'}`}
          onClick={() => onToggleSort(field)}
        >
          {label} {sortBy === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </button>
      ))}

      <div className="w-px h-4 bg-base-300 mx-1 shrink-0" />

      <button
        type="button"
        className="badge cursor-pointer select-none badge-ghost"
        onClick={() => onStatusFilter('all')}
      >
        All
      </button>
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`badge cursor-pointer select-none ${opt.badge}`}
          onClick={() => onStatusFilter(opt.value)}
        >
          {opt.label}
        </button>
      ))}

      {dirty && (
        <button
          type="button"
          className="btn btn-xs btn-ghost text-base-content/40 ml-auto"
          onClick={onClear}
        >
          Clear ×
        </button>
      )}
    </div>
  )
}
