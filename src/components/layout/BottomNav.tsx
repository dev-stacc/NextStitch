'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS, isActive } from './nav-links'

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-base-100 border-t border-base-300">
      {NAV_LINKS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs transition-colors ${
              active ? 'text-primary' : 'text-base-content/60'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
