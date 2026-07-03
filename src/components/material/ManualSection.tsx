'use client'

import { type FormEvent, useState } from 'react'
import { materialsApi } from '@/src/api'
import type { CreateMaterialInput, GrainDirection, Material } from '@/src/domain'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'
import { GRAIN_DIRECTION_OPTIONS } from '@/src/lib/constants'

interface Props {
  projectId: number | string
  onSave: (input: CreateMaterialInput) => Promise<Material>
  onDone: () => void
}

export default function ManualSection({ projectId, onSave, onDone }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [care, setCare] = useState('')
  const [grain, setGrain] = useState<'' | GrainDirection>('')
  const [preWash, setPreWash] = useState<0 | 1>(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let image_url: string | null = null
      if (imageFile) {
        const uploaded = await materialsApi.uploadImage(projectId, imageFile)
        image_url = uploaded.url
      }
      await onSave({
        name,
        quantity,
        notes,
        price: parseFloat(price),
        image_url,
        care_instructions: care || null,
        grain_direction: grain || null,
        pre_wash: preWash,
      })
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      {error && <Alert className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="form-control">
          <span className="label-text font-medium">
            Name <span className="text-error">*</span>
          </span>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. Cotton muslin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">
            Quantity <span className="text-error">*</span>
          </span>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. 2.5 yards"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">
            Price <span className="text-error">*</span>
          </span>
          <span className="input input-bordered w-full flex items-center gap-2">
            <span className="text-base-content/40 text-sm select-none">$</span>
            <input
              type="number"
              className="grow"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </span>
        </label>
        <div className="form-control">
          <span className="label-text font-medium">Image</span>
          {imagePreview ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearImage}>
                Remove
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="file-input file-input-bordered w-full"
              onChange={handleImagePick}
            />
          )}
        </div>
        <label className="form-control">
          <span className="label-text font-medium">Notes</span>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Colour, weight, source URL…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Care instructions</span>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. Machine wash cold, lay flat to dry"
            value={care}
            onChange={(e) => setCare(e.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Grain direction</span>
          <select
            className="select select-bordered w-full"
            value={grain}
            onChange={(e) => setGrain(e.target.value as '' | GrainDirection)}
          >
            {GRAIN_DIRECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!!preWash}
            onChange={(e) => setPreWash(e.target.checked ? 1 : 0)}
          />
          <span className="label-text">Pre-washed</span>
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !name.trim() || !quantity.trim() || !price}
        >
          {loading ? <Spinner size="sm" /> : 'Add to project'}
        </button>
      </form>
    </section>
  )
}
