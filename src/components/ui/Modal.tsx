'use client'

import { type ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  className?: string
  contentClassName?: string
}

export default function Modal({
  onClose,
  children,
  className = 'bg-black/60',
  contentClassName = 'bg-base-100 rounded-xl shadow-2xl w-full max-w-sm mx-4',
}: ModalProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      onClick={onClose}
    >
      <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
