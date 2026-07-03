import type { ReactNode } from 'react'

interface AlertProps {
  kind?: 'error' | 'info' | 'success' | 'warning'
  children: ReactNode
  className?: string
}

export default function Alert({ kind = 'error', children, className = '' }: AlertProps) {
  return (
    <div className={`alert alert-${kind} ${className}`}>
      <span>{children}</span>
    </div>
  )
}
