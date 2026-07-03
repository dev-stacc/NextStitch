'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { measurementsApi, patternsApi, projectsApi } from '@/src/api'
import type { Material, MeasurementSet, Pattern, ProjectStatus } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import MeasurementSetModal from '@/src/components/measurement/MeasurementSetModal'
import ChecklistSection from '@/src/components/project/ChecklistSection'
import EditMaterialModal from '@/src/components/project/EditMaterialModal'
import MaterialsSection from '@/src/components/project/MaterialsSection'
import MeasurementsSection from '@/src/components/project/MeasurementsSection'
import PatternPurchaseModal from '@/src/components/project/PatternPurchaseModal'
import PatternsSection from '@/src/components/project/PatternsSection'
import PreviewModal from '@/src/components/project/PreviewModal'
import ProgressPhotos from '@/src/components/project/ProgressPhotos'
import ProjectFormModal, {
  type ProjectFormValues,
} from '@/src/components/project/ProjectFormModal'
import ProjectHeader from '@/src/components/project/ProjectHeader'
import PurchaseModal from '@/src/components/project/PurchaseModal'
import { useCrumb } from '@/src/hooks/useCrumb'
import { useProject } from '@/src/hooks/useProject'
import { useMaterialPurchase } from '@/src/hooks/useMaterialPurchase'
import { usePatternPurchase } from '@/src/hooks/usePatternPurchase'

export default function ProjectDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { project, loading, error, setProject } = useProject(id)
  useCrumb(project?.name)

  const [previewPattern, setPreviewPattern] = useState<Pattern | null>(null)
  const [previewMs, setPreviewMs] =
    useState<(MeasurementSet & { editUrl: string }) | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  const editDialogRef = useRef<HTMLDialogElement | null>(null)
  const [editValues, setEditValues] = useState<ProjectFormValues>({ name: '', desc: '', budget: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const material = useMaterialPurchase(id, (updated) =>
    setProject(project ? { ...project, materials: project.materials.map((m) => (m.id === updated.id ? updated : m)) } : null),
  )
  const pattern = usePatternPurchase(id, (updated) =>
    setProject(project ? { ...project, patterns: project.patterns.map((p) => (p.id === updated.id ? updated : p)) } : null),
  )

  useEffect(() => {
    if (!project) return
    setEditValues({
      name: project.name,
      desc: project.description ?? '',
      budget: project.budget != null ? String(project.budget) : '',
    })
  }, [project])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="h-8 w-64 bg-base-300 rounded animate-pulse" />
        <div className="h-4 w-96 bg-base-300 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:flex-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-base-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  if (error) {
    return <Alert className="max-w-lg mx-auto mt-8">{error}</Alert>
  }
  if (!project) return null

  function removePattern(patternId: number) {
    setProject({ ...project!, patterns: project!.patterns.filter((p) => p.id !== patternId) })
  }
  function updatePattern(updated: Pattern) {
    setProject({
      ...project!,
      patterns: project!.patterns.map((p) => (p.id === updated.id ? updated : p)),
    })
  }
  function removeMaterial(materialId: number) {
    setProject({
      ...project!,
      materials: project!.materials.filter((m) => m.id !== materialId),
    })
  }
  function saveMaterial(updated: Material) {
    setProject({
      ...project!,
      materials: project!.materials.map((m) => (m.id === updated.id ? updated : m)),
    })
    setEditingMaterial(null)
  }

  async function handleStatusChange(status: ProjectStatus) {
    try {
      await projectsApi.setStatus(id, status)
      setProject({ ...project!, status })
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  async function handleDeleteProject() {
    try {
      await projectsApi.remove(id)
      router.push('/projects')
    } catch {
      /* keep user on page */
    }
  }

  function openEdit() {
    setEditError(null)
    editDialogRef.current?.showModal()
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEditLoading(true)
    setEditError(null)
    try {
      const updated = await projectsApi.update(id, {
        name: editValues.name,
        description: editValues.desc,
        budget: editValues.budget !== '' ? parseFloat(editValues.budget) : null,
      })
      setProject({
        ...project!,
        name: updated.name,
        description: updated.description,
        budget: updated.budget,
      })
      editDialogRef.current?.close()
    } catch (err) {
      setEditError((err as Error).message)
    } finally {
      setEditLoading(false)
    }
  }

  async function removeProjectMs(msId: number) {
    try {
      await measurementsApi.removeForProject(id, msId)
      setProject({
        ...project!,
        measurement_sets: project!.measurement_sets.filter((m) => m.id !== msId),
      })
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }
  async function unlinkGlobalMs(globalMsId: number) {
    try {
      await measurementsApi.unlinkGlobalFromProject(id, globalMsId)
      setProject({
        ...project!,
        global_measurement_sets: project!.global_measurement_sets.filter(
          (m) => m.id !== globalMsId,
        ),
      })
    } catch (err) {
      console.error('Unlink failed:', err)
    }
  }

  return (
    <>
      {previewPattern && (
        <PreviewModal pattern={previewPattern} onClose={() => setPreviewPattern(null)} />
      )}
      {previewMs && (
        <MeasurementSetModal ms={previewMs} onClose={() => setPreviewMs(null)} />
      )}
      {material.pending && (
        <PurchaseModal
          material={material.pending}
          onConfirm={material.confirm}
          onClose={material.cancel}
        />
      )}
      {pattern.pending && (
        <PatternPurchaseModal
          pattern={pattern.pending}
          onConfirm={pattern.confirm}
          onClose={pattern.cancel}
        />
      )}
      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          projectId={id}
          onSaved={saveMaterial}
          onClose={() => setEditingMaterial(null)}
        />
      )}

      <ProjectFormModal
        dialogRef={editDialogRef}
        mode="edit"
        values={editValues}
        setValues={setEditValues}
        loading={editLoading}
        error={editError}
        onSubmit={handleUpdate}
      />

      <div className="flex flex-col md:h-full gap-4 w-full">
        <ProjectHeader
          project={project}
          onEdit={openEdit}
          onDelete={handleDeleteProject}
          onStatusChange={handleStatusChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:flex-1 md:min-h-0">
          <PatternsSection
            projectId={id}
            patterns={project.patterns}
            onOpenPreview={setPreviewPattern}
            onRemoved={removePattern}
            onUpdated={updatePattern}
            onTogglePurchase={pattern.toggle}
          />
          <MaterialsSection
            projectId={id}
            materials={project.materials}
            onRemoved={removeMaterial}
            onTogglePurchase={material.toggle}
            onEdit={setEditingMaterial}
          />
          <div className="bg-base-200 rounded-xl p-4 flex flex-col md:min-h-0 md:overflow-hidden">
            <ChecklistSection projectId={id} initialItems={project.checklist} />
          </div>
          <MeasurementsSection
            projectId={id}
            projectSets={project.measurement_sets}
            globalSets={project.global_measurement_sets}
            onPreview={setPreviewMs}
            onRemoveProjectSet={removeProjectMs}
            onUnlinkGlobalSet={unlinkGlobalMs}
          />
        </div>

        <div className="bg-base-200 rounded-xl p-4 flex flex-col shrink-0 md:h-52">
          <ProgressPhotos projectId={id} initialImages={project.progress_images} />
        </div>
      </div>
    </>
  )
}

