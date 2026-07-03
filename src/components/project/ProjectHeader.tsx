'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import type { ProjectDetail, ProjectStatus } from '@/src/models'
import DeleteButton from '@/src/components/ui/DeleteButton'
import { fmtDate, fmtMoney } from '@/src/lib/format'
import { materialsSpent, patternsSpent } from '@/src/lib/project-totals'
import ProjectStatusMenu from './ProjectStatusMenu'

interface Props {
  project: ProjectDetail
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: ProjectStatus) => void
}

export default function ProjectHeader({ project, onEdit, onDelete, onStatusChange }: Props) {
  const spent = materialsSpent(project.materials) + patternsSpent(project.patterns)
  const hasSpent = spent > 0 || project.budget != null

  return (
    <div className="shrink-0 w-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Pencil className="w-4 h-4" /> Edit project
          </button>
          <DeleteButton size="btn-sm" onConfirm={onDelete}>
            <Trash2 className="w-4 h-4" /> Delete project
          </DeleteButton>
          <Link href="/projects" className="btn btn-ghost btn-sm">
            ← Back
          </Link>
        </div>
      </div>

      {project.description && (
        <p className="text-base-content/70">{project.description}</p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 w-full items-center justify-between mt-2 text-sm text-base-content/50">
        {hasSpent && (
          <span className="shrink-0">
            ${fmtMoney(spent)}
            {project.budget != null && ` / $${fmtMoney(Number(project.budget))}`}
          </span>
        )}
        <ProjectStatusMenu status={project.status} onChange={onStatusChange} />
        {project.created_at && (
          <span className="shrink-0" title={new Date(project.created_at).toLocaleDateString()}>
            {fmtDate(project.created_at)}
          </span>
        )}
      </div>
    </div>
  )
}
