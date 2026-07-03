'use client'

import { type FormEvent, useState } from 'react'
import { patternsApi } from '@/src/api'
import type { Pattern } from '@/src/domain'
import Modal from '@/src/components/ui/Modal'
import ModalHeader from '@/src/components/ui/ModalHeader'
import Spinner from '@/src/components/ui/Spinner'
import { patternIsUpload } from './PatternThumbnail'

interface Props {
  pattern: Pattern
  projectId: number | string
  onSaved: (updated: Pattern) => void
  onClose: () => void
}

export default function PatternModal({ pattern, projectId, onSaved, onClose }: Props) {
  const [uiMode, setUiMode] = useState<'view' | 'edit'>('view')
  const [title, setTitle] = useState(pattern.title ?? '')
  const [notes, setNotes] = useState(pattern.notes ?? '')
  const [pricePaid, setPricePaid] = useState(
    pattern.price_paid != null ? String(pattern.price_paid) : '',
  )
  const [loading, setLoading] = useState(false)

  const isUpload = patternIsUpload(pattern)
  const isManual = pattern.source === 'manual'
  const sourceLabel = isUpload
    ? 'Upload'
    : isManual
      ? 'Manual link'
      : pattern.source?.replace(/_/g, ' ') ?? '—'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await patternsApi.update(projectId, pattern.id, {
        title: title.trim() || pattern.title || '',
        notes: notes || null,
        price_paid: pricePaid ? parseFloat(pricePaid) : null,
      })
      onSaved(updated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader
          title={uiMode === 'view' ? 'Pattern' : 'Edit pattern'}
          onClose={onClose}
          onEdit={uiMode === 'view' ? () => setUiMode('edit') : undefined}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 overflow-y-auto">
          <FieldTitle mode={uiMode} title={title} setTitle={setTitle} defaultTitle={pattern.title} />
          <FieldSource label={sourceLabel} />
          {pattern.price && (
            <div className="form-control">
              <span className="label-text font-medium">Listed price</span>
              <p className="text-sm px-1">{pattern.price}</p>
            </div>
          )}
          <FieldPricePaid mode={uiMode} value={pricePaid} onChange={setPricePaid} />
          {pattern.url && <FieldLink pattern={pattern} isUpload={isUpload} />}
          <FieldNotes mode={uiMode} notes={notes} setNotes={setNotes} />

          {uiMode === 'edit' && (
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
                disabled={loading}
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

function FieldTitle({
  mode,
  title,
  setTitle,
  defaultTitle,
}: {
  mode: 'view' | 'edit'
  title: string
  setTitle: (v: string) => void
  defaultTitle: string | null
}) {
  return (
    <div className="form-control">
      <span className="label-text font-medium">Title</span>
      {mode === 'view' ? (
        <p className="text-sm px-1">{defaultTitle || '—'}</p>
      ) : (
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      )}
    </div>
  )
}

function FieldSource({ label }: { label: string }) {
  return (
    <div className="form-control">
      <span className="label-text font-medium">Source</span>
      <p className="text-sm px-1 capitalize">{label}</p>
    </div>
  )
}

function FieldPricePaid({
  mode,
  value,
  onChange,
}: {
  mode: 'view' | 'edit'
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="form-control">
      <span className="label-text font-medium">Price paid</span>
      {mode === 'view' ? (
        <p className="text-sm px-1">
          {value ? (
            `$${Number(value).toFixed(2)}`
          ) : (
            <span className="text-base-content/40">—</span>
          )}
        </p>
      ) : (
        <span className="input input-bordered input-sm w-full flex items-center gap-2">
          <span className="text-base-content/40 text-sm select-none">$</span>
          <input
            type="number"
            className="grow"
            placeholder="0.00"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min="0"
            step="0.01"
          />
        </span>
      )}
    </div>
  )
}

function FieldLink({ pattern, isUpload }: { pattern: Pattern; isUpload: boolean }) {
  const href = isUpload ? pattern.url! : pattern.url!
  return (
    <div className="form-control">
      <span className="label-text font-medium">Link</span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm px-1 truncate hover:underline text-primary"
      >
        {isUpload ? 'View file' : pattern.url}
      </a>
    </div>
  )
}

function FieldNotes({
  mode,
  notes,
  setNotes,
}: {
  mode: 'view' | 'edit'
  notes: string
  setNotes: (v: string) => void
}) {
  return (
    <div className="form-control">
      <span className="label-text font-medium">Notes</span>
      {mode === 'view' ? (
        <p className="text-sm px-1 whitespace-pre-wrap">
          {notes || <span className="text-base-content/40">No notes.</span>}
        </p>
      ) : (
        <textarea
          className="textarea textarea-bordered textarea-sm w-full"
          rows={4}
          placeholder="Size range, modifications, difficulty…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      )}
    </div>
  )
}
