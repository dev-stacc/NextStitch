'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS, isActive } from './nav-links'

interface SidebarProps {
  open: boolean
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside
      className={`hidden md:flex flex-col gap-1 py-4 bg-base-200 min-h-screen shrink-0 transition-all duration-200 ${
        open ? 'w-56 px-4' : 'w-15 px-2'
      }`}
    >
      {NAV_LINKS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            title={!open ? label : undefined}
            className={`btn btn-ghost justify-start gap-3 px-2 ${active ? 'btn-active' : ''}`}
          >
            <Icon size={20} className="shrink-0" />
            {open && <span>{label}</span>}
          </Link>
        )
      })}
    </aside>
  )
}
