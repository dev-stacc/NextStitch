'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface Props {
  title: string
  backHref: string
  children: ReactNode
}

export default function MeasurementPageShell({ title, backHref, children }: Props) {
  const router = useRouter()
  return (
    <div className="flex flex-col md:h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push(backHref)}>
          ← Back
        </button>
      </div>
      <div className="bg-base-200 rounded-xl p-4 flex flex-col md:flex-1 md:min-h-0">
        {children}
      </div>
    </div>
  )
}
