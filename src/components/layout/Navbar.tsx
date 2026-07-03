'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useBreadcrumb } from '@/src/contexts/BreadcrumbContext'
import { buildCrumbs } from './breadcrumbs'

interface NavbarProps {
  onToggleSidebar: () => void
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const pathname = usePathname()
  const { crumb } = useBreadcrumb()
  const crumbs = buildCrumbs({ pathname, crumb })

  return (
    <nav className="navbar bg-base-100 border-b border-base-300 px-4 gap-4">
      <button
        type="button"
        className="hidden md:flex btn btn-ghost btn-square"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <span className="text-base-content/50">Sewing Assistant</span>
          </li>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <li key={`${c.label}-${i}`} className={isLast ? 'font-medium' : undefined}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
