'use client'

import type { MeasurementSet } from '@/src/models'

interface Props {
  sets: MeasurementSet[]
  selected: Set<number>
  onChange: (updater: (prev: Set<number>) => Set<number>) => void
}

export default function GlobalMeasurementSetsPicker({ sets, selected, onChange }: Props) {
  if (sets.length === 0) return null
  return (
    <fieldset className="form-control">
      <legend className="label-text font-medium">Include your measurements</legend>
      <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
        {sets.map((gs) => (
          <label key={gs.id} className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selected.has(gs.id)}
              onChange={(e) =>
                onChange((prev) => {
                  const next = new Set(prev)
                  if (e.target.checked) next.add(gs.id)
                  else next.delete(gs.id)
                  return next
                })
              }
            />
            <span className="text-sm">{gs.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
