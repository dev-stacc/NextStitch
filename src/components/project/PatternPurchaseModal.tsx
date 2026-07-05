'use client'

import { type FormEvent, useState } from 'react'
import type { Pattern } from '@/src/models'
import Modal from '@/src/components/ui/Modal'
import PatternThumbnail from './PatternThumbnail'

interface Props {
  pattern: Pattern
  onConfirm: (input: { price_paid: number }) => void
  onClose: () => void
}

function defaultPrice(pattern: Pattern): string {
  if (pattern.price_paid != null) return String(pattern.price_paid)
  if (pattern.price) {
    const n = parseFloat(pattern.price.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) ? String(n) : ''
  }
  return ''
}

export default function PatternPurchaseModal({ pattern, onConfirm, onClose }: Props) {
  const [price, setPrice] = useState(defaultPrice(pattern))

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onConfirm({ price_paid: parseFloat(price) })
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-4">Mark as Purchased</h3>

        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 flex-none rounded overflow-hidden bg-base-200 border border-base-300 shrink-0">
            <PatternThumbnail pattern={pattern} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{pattern.title ?? 'Untitled'}</p>
            {pattern.price && (
              <p className="text-xs text-base-content/50 mt-0.5">Listed: {pattern.price}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <span className="label-text font-medium">
              Price paid <span className="text-error">*</span>
            </span>
            <label className="input input-bordered input-sm w-full flex items-center gap-2">
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
                autoFocus
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!price}>
              Confirm
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
