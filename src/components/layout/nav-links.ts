import { FolderOpen, House, MapPin, Ruler, type LucideIcon } from 'lucide-react'

export interface NavLinkDef {
  href: string
  label: string
  Icon: LucideIcon
}

export const NAV_LINKS: readonly NavLinkDef[] = [
  { href: '/', label: 'Home', Icon: House },
  { href: '/projects', label: 'Projects', Icon: FolderOpen },
  { href: '/measurements', label: 'Measurements', Icon: Ruler },
  { href: '/stores', label: 'Stores', Icon: MapPin },
]

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
