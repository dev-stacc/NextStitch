'use client'

import { MEASUREMENTS } from '@/src/lib/constants'

export type MeasurementFormState = Record<string, string>

interface Props {
  values: MeasurementFormState
  invalid: Set<string>
  onChange: (key: string, value: string) => void
  onBlur: (key: string, value: string) => void
}

export default function MeasurementFields({ values, invalid, onChange, onBlur }: Props) {
  return (
    <div className="flex flex-col gap-2 md:flex-1 md:min-h-0 overflow-y-auto">
      {MEASUREMENTS.map(([key, label]) => (
        <label key={key} className="flex items-center gap-3">
          <span className="flex-1 text-sm text-base-content/70">{label}</span>
          <input
            type="number"
            step="0.1"
            min="0"
            className={`input input-bordered input-sm w-24 text-right ${invalid.has(key) ? 'input-error' : ''}`}
            placeholder="cm"
            value={values[key] ?? ''}
            onChange={(e) => onChange(key, e.target.value)}
            onBlur={(e) => onBlur(key, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}
