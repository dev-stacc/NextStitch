import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  title: string
  addHref?: string
  subtitle?: ReactNode
  children: ReactNode
}

export default function SectionCard({ title, addHref, subtitle, children }: Props) {
  return (
    <div className="bg-base-200 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-1 shrink-0">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>
          {subtitle}
        </div>
        {addHref && (
          <Link href={addHref} className="btn btn-primary btn-sm">
            + Add
          </Link>
        )}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
