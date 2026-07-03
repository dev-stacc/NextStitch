'use client'

import type { Material } from '@/src/models'
import MaterialRow from './MaterialRow'
import SectionCard from './SectionCard'
import { materialsSpent } from '@/src/lib/project-totals'

interface Props {
  projectId: number | string
  materials: Material[]
  onRemoved: (materialId: number) => void
  onTogglePurchase: (material: Material, newPurchased: 0 | 1) => void
  onEdit: (material: Material) => void
}

export default function MaterialsSection({
  projectId,
  materials,
  onRemoved,
  onTogglePurchase,
  onEdit,
}: Props) {
  const spent = materialsSpent(materials)
  const sorted = [...materials].sort((a, b) => (b.purchased ?? 0) - (a.purchased ?? 0))

  return (
    <SectionCard
      title="Materials"
      addHref={`/projects/${projectId}/materials/add`}
      subtitle={
        spent > 0 ? (
          <p className="text-xs text-base-content/50 mt-0.5">Expenses: ${spent.toFixed(2)}</p>
        ) : null
      }
    >
      {sorted.length > 0 ? (
        <div className="space-y-1">
          {sorted.map((m) => (
            <MaterialRow
              key={m.id}
              material={m}
              projectId={projectId}
              onRemoved={onRemoved}
              onTogglePurchase={onTogglePurchase}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <p className="text-base-content/40 text-sm px-2">No materials added yet.</p>
      )}
    </SectionCard>
  )
}
