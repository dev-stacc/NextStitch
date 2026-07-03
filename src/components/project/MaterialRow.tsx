'use client'

import { useState } from 'react'
import { Eye, Package } from 'lucide-react'
import { materialsApi } from '@/src/api'
import type { Material } from '@/src/models'
import DeleteButton from '@/src/components/ui/DeleteButton'
import ImageViewerModal from '@/src/components/ui/ImageViewerModal'
import { extractSourceUrl } from '@/src/lib/material-url'

interface Props {
  material: Material
  projectId: number | string
  onRemoved: (materialId: number) => void
  onTogglePurchase: (material: Material, newPurchased: 0 | 1) => void
  onEdit: (material: Material) => void
}

export default function MaterialRow({
  material,
  projectId,
  onRemoved,
  onTogglePurchase,
  onEdit,
}: Props) {
  const url = extractSourceUrl(material.notes)
  const isPurchased = !!material.purchased
  const [viewingImage, setViewingImage] = useState(false)

  async function handleDelete() {
    try {
      await materialsApi.remove(projectId, material.id)
      onRemoved(material.id)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <>
      {viewingImage && material.image_url && (
        <ImageViewerModal
          images={[material.image_url]}
          onClose={() => setViewingImage(false)}
        />
      )}
      <div
        className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-300 transition-colors ${
          isPurchased ? 'opacity-60' : ''
        }`}
      >
        <input
          type="checkbox"
          className="checkbox checkbox-sm shrink-0"
          checked={isPurchased}
          onChange={() => onTogglePurchase(material, isPurchased ? 0 : 1)}
        />
        <button
          type="button"
          className="w-12 h-12 flex-none rounded overflow-hidden bg-base-200 border border-base-300 cursor-pointer"
          onClick={() => material.image_url && setViewingImage(true)}
        >
          {material.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={material.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/30">
              <Package className="w-5 h-5" />
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`text-sm font-medium truncate block hover:underline ${
                isPurchased ? 'line-through' : ''
              }`}
            >
              {material.name}
            </a>
          ) : (
            <p className={`text-sm font-medium truncate ${isPurchased ? 'line-through' : ''}`}>
              {material.name}
            </p>
          )}
          {material.quantity && (
            <p className="text-xs text-base-content/50 truncate">{material.quantity}</p>
          )}
        </div>
        {material.price != null && (
          <span className="text-xs text-base-content/60 shrink-0">
            ${Number(material.price).toFixed(2)}
          </span>
        )}
        <button
          type="button"
          className="btn btn-xs btn-ghost shrink-0"
          onClick={() => onEdit(material)}
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <DeleteButton onConfirm={handleDelete} />
      </div>
    </>
  )
}
