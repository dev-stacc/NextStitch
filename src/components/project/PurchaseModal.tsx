'use client'

import { type FormEvent, useState } from 'react'
import { Package } from 'lucide-react'
import type { Material } from '@/src/domain'
import Modal from '@/src/components/ui/Modal'
import { extractSourceUrl } from '@/src/lib/material-url'

interface Props {
  material: Material
  onConfirm: (input: { price: number; quantity: string }) => void
  onClose: () => void
}

export default function PurchaseModal({ material, onConfirm, onClose }: Props) {
  const url = extractSourceUrl(material.notes)
  const [qty, setQty] = useState(material.quantity ?? '')
  const [price, setPrice] = useState(material.price != null ? String(material.price) : '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onConfirm({ price: parseFloat(price), quantity: qty })
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-4">Mark as Purchased</h3>

        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 flex-none rounded overflow-hidden bg-base-200 border border-base-300 shrink-0">
            {material.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={material.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/30">
                <Package className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-sm truncate block hover:underline"
              >
                {material.name}
              </a>
            ) : (
              <p className="font-medium text-sm truncate">{material.name}</p>
            )}
            {material.notes && !url && (
              <p className="text-xs text-base-content/50 mt-0.5 line-clamp-2">{material.notes}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <span className="label-text font-medium">
              Quantity <span className="text-error">*</span>
            </span>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="e.g. 2.5 yards"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="form-control">
            <span className="label-text font-medium">
              Price paid <span className="text-error">*</span>
            </span>
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
                required
              />
            </span>
          </label>
          <div className="flex justify-end gap-2 mt-1">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!qty.trim() || !price}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
