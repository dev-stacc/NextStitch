'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus } from 'lucide-react'
import { measurementsApi, projectsApi } from '@/src/api'
import type { MeasurementSet, Project } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'
import ProjectFormModal, {
  type ProjectFormValues,
} from '@/src/components/project/ProjectFormModal'
import ProjectFilters, {
  type SortDir,
  type SortField,
  type StatusFilter,
} from '@/src/components/project/ProjectFilters'
import ProjectCard from '@/src/components/project/ProjectCard'
import { filterAndSort } from '@/src/lib/projects'

const emptyForm: ProjectFormValues = { name: '', desc: '', budget: '' }

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const [formValues, setFormValues] = useState<ProjectFormValues>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [globalSets, setGlobalSets] = useState<MeasurementSet[]>([])
  const [selectedGlobalSets, setSelectedGlobalSets] = useState<Set<number>>(new Set())

  useEffect(() => {
    projectsApi
      .list()
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => filterAndSort(projects, search, statusFilter, sortBy, sortDir),
    [projects, search, statusFilter, sortBy, sortDir],
  )

  function openCreate() {
    setFormValues(emptyForm)
    setFormError(null)
    setSelectedGlobalSets(new Set())
    measurementsApi.listGlobal().then(setGlobalSets).catch(() => {})
    dialogRef.current?.showModal()
  }

  function toggleSort(field: SortField) {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  function clearFilters() {
    setSortBy(null)
    setSortDir('asc')
    setStatusFilter('all')
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    try {
      const created = await projectsApi.create({
        name: formValues.name,
        description: formValues.desc,
        budget: formValues.budget !== '' ? parseFloat(formValues.budget) : null,
        global_measurement_set_ids: [...selectedGlobalSets],
      })
      router.push(`/projects/${created.id}`)
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          + New Project
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search projects…"
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ProjectFilters
        sortBy={sortBy}
        sortDir={sortDir}
        statusFilter={statusFilter}
        onToggleSort={toggleSort}
        onStatusFilter={setStatusFilter}
        onClear={clearFilters}
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}
      {error && <Alert>{error}</Alert>}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FolderPlus className="w-10 h-10 text-base-content/30" />
          <p className="text-base-content/60">
            {projects.length === 0
              ? 'No projects yet — start one to plan your next make.'
              : 'No projects match your filters.'}
          </p>
          {projects.length === 0 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              + Create your first project
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <ProjectFormModal
        dialogRef={dialogRef}
        mode="create"
        values={formValues}
        setValues={setFormValues}
        loading={formLoading}
        error={formError}
        onSubmit={handleCreate}
        globalSets={globalSets}
        selectedGlobalSets={selectedGlobalSets}
        setSelectedGlobalSets={setSelectedGlobalSets}
      />
    </div>
  )
}
