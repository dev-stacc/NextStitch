'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderOpen, MapPin, Ruler } from 'lucide-react'
import { projectsApi } from '@/src/api'
import type { Project } from '@/src/domain'

export default function LandingPage() {
  const [recent, setRecent] = useState<Project | null>(null)

  useEffect(() => {
    projectsApi
      .list()
      .then((data) => {
        if (data.length === 0) return
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        setRecent(sorted[0])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Welcome Back</h1>

      <div className="flex flex-col gap-3">
        {recent && (
          <Link
            href={`/projects/${recent.id}`}
            className="card bg-base-200 border border-base-300 hover:border-primary transition-colors"
          >
            <div className="card-body py-4 px-5">
              <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                Continue working on
              </p>
              <p className="font-semibold text-lg leading-tight">{recent.name}</p>
              {recent.description && (
                <p className="text-sm text-base-content/60 line-clamp-2 mt-1">
                  {recent.description}
                </p>
              )}
            </div>
          </Link>
        )}

        <NavCard href="/projects" Icon={FolderOpen} label="Your projects" />
        <NavCard href="/measurements" Icon={Ruler} label="Saved measurements" />
        <NavCard href="/stores" Icon={MapPin} label="Find fabric stores" />
      </div>
    </div>
  )
}

interface NavCardProps {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

function NavCard({ href, label, Icon }: NavCardProps) {
  return (
    <Link
      href={href}
      className="card bg-base-200 border border-base-300 hover:border-primary transition-colors"
    >
      <div className="card-body py-4 px-5 flex-row items-center gap-3">
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  )
}
