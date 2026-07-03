'use client'

import { type FormEvent, useState } from 'react'
import type { CreatePatternInput, Pattern } from '@/src/models'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'

interface Props {
  onSave: (input: CreatePatternInput) => Promise<Pattern>
  onDone: () => void
}

export default function ManualSection({ onSave, onDone }: Props) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [pricePaid, setPricePaid] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave({
        source: 'manual',
        title,
        url,
        image_url: null,
        price: price || null,
        price_paid: pricePaid ? parseFloat(pricePaid) : null,
        notes: notes || null,
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
      <h2 className="text-lg font-medium mb-4">Add by link</h2>
      {error && <Alert className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="form-control">
          <span className="label-text font-medium">
            URL <span className="text-error">*</span>
          </span>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Title</span>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Leave blank to auto-detect"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Price</span>
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
            />
          </span>
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Price paid</span>
          <span className="input input-bordered w-full flex items-center gap-2">
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
          </span>
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
        <button type="submit" className="btn btn-primary" disabled={loading || !url.trim()}>
          {loading ? <Spinner size="sm" /> : 'Add to project'}
        </button>
      </form>
    </section>
  )
}
