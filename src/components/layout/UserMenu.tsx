'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, UserRound } from 'lucide-react'

export default function UserMenu() {
  const { data, status } = useSession()
  if (status !== 'authenticated' || !data?.user) return null

  const label = data.user.name || data.user.email || 'Account'
  return (
    <div className="dropdown dropdown-end">
      <button type="button" tabIndex={0} className="btn btn-ghost btn-sm gap-2">
        <UserRound className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[10rem] truncate">{label}</span>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 border border-base-300 rounded-box shadow z-10 p-2 w-40 mt-1"
      >
        <li>
          <button
            type="button"
            className="text-sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </li>
      </ul>
    </div>
  )
}
