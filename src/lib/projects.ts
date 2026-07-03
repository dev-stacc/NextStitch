import type { Project } from '@/src/domain'
import type { SortDir, SortField, StatusFilter } from '@/src/components/project/ProjectFilters'

export function filterAndSort(
  projects: Project[],
  search: string,
  statusFilter: StatusFilter,
  sortBy: SortField | null,
  sortDir: SortDir,
): Project[] {
  const q = search.toLowerCase().trim()
  let result = projects.filter((p) => {
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || (p.status ?? 'to_start') === statusFilter
    return matchesSearch && matchesStatus
  })
  if (sortBy) result = [...result].sort(comparator(sortBy, sortDir))
  return result
}

function comparator(field: SortField, dir: SortDir): (a: Project, b: Project) => number {
  const sign = dir === 'asc' ? 1 : -1
  switch (field) {
    case 'title':
      return (a, b) => sign * a.name.localeCompare(b.name)
    case 'budget':
      return (a, b) => sign * ((a.budget ?? -Infinity) - (b.budget ?? -Infinity))
    case 'date':
      return (a, b) =>
        sign * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }
}
