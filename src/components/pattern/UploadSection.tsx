'use client'

import { type FormEvent, useState } from 'react'
import { patternsApi } from '@/src/api'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'
import { compressImage } from '@/src/lib/image'

interface Props {
  projectId: number | string
  onDone: () => void
}

export default function UploadSection({ projectId, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [pricePaid, setPricePaid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const toUpload = file.type.startsWith('image/') ? await compressImage(file) : file
      await patternsApi.upload(projectId, {
        file: toUpload,
        title,
        notes,
        price_paid: pricePaid || undefined,
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
      <h2 className="text-lg font-medium mb-4">Upload PDF or image</h2>
      {error && <Alert className="mb-4">{error}</Alert>}
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <label className="form-control">
          <span className="label-text font-medium">
            File (PDF, JPG, PNG, WebP) <span className="text-error">*</span>
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Title</span>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Leave blank to use filename"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Notes</span>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Size range, modifications, difficulty…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <div className="form-control">
          <span className="label-text font-medium">Price paid</span>
          <label className="input input-bordered w-full flex items-center gap-2">
            <span className="text-base-content/40 text-sm select-none">$</span>
            <input
              type="number"
              className="grow"
              placeholder="0.00"
              value={pricePaid}
              onChange={(e) => setPricePaid(e.target.value)}
              min="0"
              step="0.01"
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !file}>
          {loading ? <Spinner size="sm" /> : 'Upload & add to project'}
        </button>
      </form>
    </section>
  )
}
