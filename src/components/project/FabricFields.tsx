'use client'

import type { GrainDirection } from '@/src/models'
import { GRAIN_DIRECTION_OPTIONS, GRAIN_LABELS } from '@/src/lib/constants'

export interface FabricFieldValues {
  careInstructions: string
  grainDirection: '' | GrainDirection
  preWash: 0 | 1
}

interface Props {
  mode: 'view' | 'edit'
  values: FabricFieldValues
  onChange: (updater: (prev: FabricFieldValues) => FabricFieldValues) => void
}

export default function FabricFields({ mode, values, onChange }: Props) {
  const isView = mode === 'view'
  return (
    <>
      <div className="form-control">
        <span className="label-text font-medium">Care instructions</span>
        {isView ? (
          <p className="text-sm px-1">
            {values.careInstructions || <span className="text-base-content/40">—</span>}
          </p>
        ) : (
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="e.g. Machine wash cold"
            value={values.careInstructions}
            onChange={(e) => onChange((v) => ({ ...v, careInstructions: e.target.value }))}
          />
        )}
      </div>

      <div className="form-control">
        <span className="label-text font-medium">Grain direction</span>
        {isView ? (
          <p className="text-sm px-1">
            {values.grainDirection ? (
              GRAIN_LABELS[values.grainDirection]
            ) : (
              <span className="text-base-content/40">Not specified</span>
            )}
          </p>
        ) : (
          <select
            className="select select-bordered select-sm w-full"
            value={values.grainDirection}
            onChange={(e) =>
              onChange((v) => ({ ...v, grainDirection: e.target.value as '' | GrainDirection }))
            }
          >
            {GRAIN_DIRECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2 py-1">
        {isView ? (
          <>
            <span className="text-sm">{values.preWash ? '✓' : '✗'}</span>
            <span className="label-text">Pre-washed</span>
          </>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={!!values.preWash}
              onChange={(e) =>
                onChange((v) => ({ ...v, preWash: e.target.checked ? 1 : 0 }))
              }
            />
            <span className="label-text">Pre-washed</span>
          </label>
        )}
      </div>
    </>
  )
}
