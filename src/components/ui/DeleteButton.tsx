'use client'

import { useState, type ReactNode, type MouseEvent } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  onConfirm: () => void
  size?: 'btn-xs' | 'btn-sm' | 'btn-md'
  className?: string
  children?: ReactNode
}

export default function DeleteButton({
  onConfirm,
  size = 'btn-xs',
  className = '',
  children,
}: DeleteButtonProps) {
  const [pending, setPending] = useState(false)

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (pending) onConfirm()
    else setPending(true)
  }

  return (
    <button
      type="button"
      className={`btn ${size} ${pending ? 'btn-error text-white' : 'btn-ghost text-error'} ${className}`}
      onClick={handleClick}
      onBlur={() => setPending(false)}
      title={pending ? 'Click again to confirm' : 'Delete'}
    >
      {children ?? <Trash2 className="w-4 h-4" />}
    </button>
  )
}
