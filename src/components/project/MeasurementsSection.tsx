'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import type { MeasurementSet } from '@/src/models'
import DeleteButton from '@/src/components/ui/DeleteButton'

interface PreviewInput extends MeasurementSet {
  editUrl: string
}

interface Props {
  projectId: number | string
  projectSets: MeasurementSet[]
  globalSets: MeasurementSet[]
  onPreview: (ms: PreviewInput) => void
  onRemoveProjectSet: (msId: number) => void
  onUnlinkGlobalSet: (globalMsId: number) => void
}

export default function MeasurementsSection({
  projectId,
  projectSets,
  globalSets,
  onPreview,
  onRemoveProjectSet,
  onUnlinkGlobalSet,
}: Props) {
  const empty = globalSets.length === 0 && projectSets.length === 0
  return (
    <div className="bg-base-200 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-lg font-medium">Measurements</h2>
        <Link href={`/projects/${projectId}/measurements/add`} className="btn btn-primary btn-sm">
          + Add
        </Link>
      </div>
      <div>
        {empty ? (
          <p className="text-base-content/40 text-sm px-2">No measurements added yet.</p>
        ) : (
          <div className="space-y-1">
            {globalSets.map((ms) => (
              <Row
                key={`g-${ms.id}`}
                ms={ms}
                shared
                onPreview={() =>
                  onPreview({ ...ms, editUrl: `/measurements/${ms.id}/edit` })
                }
                onDelete={() => onUnlinkGlobalSet(ms.id)}
              />
            ))}
            {projectSets.map((ms) => (
              <Row
                key={ms.id}
                ms={ms}
                shared={false}
                onPreview={() =>
                  onPreview({
                    ...ms,
                    editUrl: `/projects/${projectId}/measurements/${ms.id}/edit`,
                  })
                }
                onDelete={() => onRemoveProjectSet(ms.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface RowProps {
  ms: MeasurementSet
  shared: boolean
  onPreview: () => void
  onDelete: () => void
}

function Row({ ms, shared, onPreview, onDelete }: RowProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-300 transition-colors">
      <span className="flex-1 text-sm font-medium truncate min-w-0">{ms.name}</span>
      {shared && <span className="badge badge-ghost badge-xs shrink-0">Shared</span>}
      <button
        type="button"
        className="btn btn-xs btn-ghost shrink-0"
        onClick={onPreview}
        title="View"
      >
        <Eye className="w-4 h-4" />
      </button>
      <DeleteButton className="shrink-0" onConfirm={onDelete} />
    </div>
  )
}
