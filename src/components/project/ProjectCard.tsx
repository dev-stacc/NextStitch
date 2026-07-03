import Link from 'next/link'
import type { Project } from '@/src/domain'
import { fmtDate, fmtMoney } from '@/src/lib/format'
import ProjectStatusDot from './ProjectStatusDot'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-md transition-all"
    >
      <div className="card-body gap-2">
        <h2 className="card-title text-base line-clamp-2">{project.name}</h2>
        {project.description && (
          <p className="text-sm text-base-content/70 line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 text-xs text-base-content/50">
          <div className="flex gap-3">
            {(project.total_spent > 0 || project.budget != null) && (
              <span>
                ${fmtMoney(Number(project.total_spent ?? 0))}
                {project.budget != null && ` / $${fmtMoney(Number(project.budget))}`}
              </span>
            )}
            {project.created_at && (
              <span title={new Date(project.created_at).toLocaleDateString()}>
                {fmtDate(project.created_at)}
              </span>
            )}
          </div>
          <ProjectStatusDot status={project.status} />
        </div>
      </div>
    </Link>
  )
}
