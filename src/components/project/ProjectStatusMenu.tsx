'use client'

import type { ProjectStatus } from '@/src/domain'
import { STATUS_OPTIONS } from '@/src/lib/constants'

interface Props {
  status: ProjectStatus
  onChange: (status: ProjectStatus) => void
}

export default function ProjectStatusMenu({ status, onChange }: Props) {
  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
  return (
    <div className="dropdown dropdown-end shrink-0">
      <div tabIndex={0} role="button" className={`badge cursor-pointer select-none ${current.badge}`}>
        {current.label} ▾
      </div>
      <ul className="dropdown-content menu bg-base-100 border border-base-300 rounded-box shadow z-10 p-1 w-36 mt-1">
        {STATUS_OPTIONS.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              className={`text-sm ${opt.value === current.value ? 'font-semibold' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              <span className={`badge badge-xs ${opt.badge}`} />
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
