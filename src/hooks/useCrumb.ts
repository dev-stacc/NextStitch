'use client'

import { useEffect } from 'react'
import { useBreadcrumb } from '@/src/contexts/BreadcrumbContext'

export function useCrumb(crumb: string | null | undefined): void {
  const { setCrumb } = useBreadcrumb()
  useEffect(() => {
    if (!crumb) return
    setCrumb(crumb)
    return () => setCrumb(null)
  }, [crumb, setCrumb])
}
