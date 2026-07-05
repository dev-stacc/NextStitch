'use client'

import { Pencil } from 'lucide-react'
import { type ReactNode } from 'react'

interface ModalHeaderProps {
  title: ReactNode
  onClose: () => void
  onEdit?: () => void
  actions?: ReactNode
}

export default function ModalHeader({ title, onClose, onEdit, actions }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 shrink-0">
      <span className="font-semibold">{title}</span>
      <div className="flex gap-1 shrink-0">
        {onEdit && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={onEdit} title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {actions}
        <button
          type="button"
          className="btn btn-sm btn-ghost text-lg leading-none"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  )
}
