'use client'

import { type FormEvent, useState } from 'react'
import { materialsApi } from '@/src/api'
import type { GrainDirection, Material } from '@/src/domain'
import Modal from '@/src/components/ui/Modal'
import ModalHeader from '@/src/components/ui/ModalHeader'
import Spinner from '@/src/components/ui/Spinner'
import { compressImage } from '@/src/lib/image'
import { extractSourceUrl } from '@/src/lib/material-url'
import FabricFields, { type FabricFieldValues } from './FabricFields'
import MaterialImageField from './MaterialImageField'

interface Props {
  material: Material
  projectId: number | string
  onSaved: (updated: Material) => void
  onClose: () => void
}

export default function EditMaterialModal({ material, projectId, onSaved, onClose }: Props) {
  const sourceUrl = extractSourceUrl(material.notes)
  const isScraped = sourceUrl !== null
  const isPurchased = !!material.purchased

  const [uiMode, setUiMode] = useState<'view' | 'edit'>('view')
  const [name, setName] = useState(material.name)
  const [quantity, setQuantity] = useState(material.quantity ?? '')
  const [price, setPrice] = useState(material.price != null ? String(material.price) : '')
  const [notes, setNotes] = useState(isScraped ? '' : material.notes ?? '')
  const [fabric, setFabric] = useState<FabricFieldValues>({
    careInstructions: material.care_instructions ?? '',
    grainDirection: (material.grain_direction ?? '') as '' | GrainDirection,
    preWash: material.pre_wash ?? 0,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(material.image_url ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  function handleImagePick(file: File | null) {
    if (!file) return
    setImageFile(file)
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      let image_url: string | null = imageFile ? null : imagePreview ? material.image_url : null
      if (imageFile) {
        const compressed = await compressImage(imageFile)
        const uploaded = await materialsApi.uploadImage(projectId, compressed)
        image_url = uploaded.url
      }
      const fabricPayload = {
        care_instructions: fabric.careInstructions || null,
        grain_direction: fabric.grainDirection || null,
        pre_wash: fabric.preWash,
      }
      const body = isScraped
        ? {
            name: material.name,
            quantity,
            notes: material.notes ?? '',
            image_url: material.image_url ?? null,
            price: price ? parseFloat(price) : null,
            ...fabricPayload,
          }
        : {
            name,
            quantity,
            notes,
            image_url,
            price: price ? parseFloat(price) : null,
            ...fabricPayload,
          }
      const updated = await materialsApi.edit(projectId, material.id, body)
      onSaved(updated)
    } catch (err) {
      console.error('Edit failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const isView = uiMode === 'view'

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader
          title={isView ? 'Material' : 'Edit material'}
          onClose={onClose}
          onEdit={isView ? () => setUiMode('edit') : undefined}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 overflow-y-auto">
          {isScraped && sourceUrl && (
            <div className="form-control">
              <span className="label-text font-medium">Source</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm px-1 truncate hover:underline text-primary"
              >
                {material.name}
              </a>
            </div>
          )}

          {!isScraped && (
            <div className="form-control">
              <span className="label-text font-medium">Name</span>
              {isView ? (
                <p className="text-sm px-1">{name || '—'}</p>
              ) : (
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              )}
            </div>
          )}

          <div className="form-control">
            <span className="label-text font-medium">Quantity</span>
            {isView ? (
              <p className="text-sm px-1">{quantity || '—'}</p>
            ) : (
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="e.g. 2.5 yards"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus={isScraped}
              />
            )}
          </div>

          <div className="form-control">
            <span className="label-text font-medium">{isPurchased ? 'Price paid' : 'Price'}</span>
            {isView ? (
              <p className="text-sm px-1">{price ? `$${Number(price).toFixed(2)}` : '—'}</p>
            ) : (
              <span className="input input-bordered input-sm w-full flex items-center gap-2">
                <span className="text-base-content/40 text-sm select-none">$</span>
                <input
                  type="number"
                  className="grow"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </span>
            )}
          </div>

          {!isScraped && (
            <>
              <MaterialImageField
                mode={uiMode}
                preview={imagePreview}
                onChange={handleImagePick}
                onClear={clearImage}
              />
              <div className="form-control">
                <span className="label-text font-medium">Notes</span>
                {isView ? (
                  <p className="text-sm px-1 whitespace-pre-wrap">
                    {notes || <span className="text-base-content/40">—</span>}
                  </p>
                ) : (
                  <textarea
                    className="textarea textarea-bordered textarea-sm w-full"
                    rows={3}
                    placeholder="Colour, weight…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                )}
              </div>
            </>
          )}

          <FabricFields mode={uiMode} values={fabric} onChange={setFabric} />

          {!isView && (
            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full"
                onClick={() => setUiMode('view')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm w-full"
                disabled={loading || (!isScraped && !name.trim())}
              >
                {loading ? <Spinner size="xs" /> : 'Save'}
              </button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}
