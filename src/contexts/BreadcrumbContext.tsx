'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface BreadcrumbValue {
  crumb: string | null
  setCrumb: (crumb: string | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumb, setCrumb] = useState<string | null>(null)
  const value = useMemo(() => ({ crumb, setCrumb }), [crumb])
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumb(): BreadcrumbValue {
  const value = useContext(BreadcrumbContext)
  if (!value) throw new Error('useBreadcrumb must be used within BreadcrumbProvider')
  return value
}
