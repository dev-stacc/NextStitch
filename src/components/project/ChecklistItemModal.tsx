'use client'

import { type FormEvent, useState } from 'react'
import { checklistApi } from '@/src/api'
import type { ChecklistItem } from '@/src/models'
import Modal from '@/src/components/ui/Modal'
import ModalHeader from '@/src/components/ui/ModalHeader'
import Spinner from '@/src/components/ui/Spinner'
import { compressImage } from '@/src/lib/image'
import ChecklistItemPhotos from './ChecklistItemPhotos'

export type ChecklistItemMode = 'view' | 'edit' | 'complete'

interface Props {
  item: ChecklistItem
  projectId: number | string
  mode: ChecklistItemMode
  onSaved: (updated: ChecklistItem) => void
  onClose: () => void
}

interface NewFile {
  file: File
  preview: string
}

export default function ChecklistItemModal({ item, projectId, mode: initialMode, onSaved, onClose }: Props) {
  const [uiMode, setUiMode] = useState<ChecklistItemMode>(initialMode)
  const [title, setTitle] = useState(item.title)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [existingUrls, setExistingUrls] = useState(item.image_urls ?? [])
  const [newFiles, setNewFiles] = useState<NewFile[]>([])
  const [loading, setLoading] = useState(false)

  function handleAddFiles(files: FileList | null) {
    if (!files) return
    const entries = Array.from(files).map((f) => ({ file: f, preview: URL.createObjectURL(f) }))
    setNewFiles((prev) => [...prev, ...entries])
  }

  function removeExisting(url: string) {
    setExistingUrls((prev) => prev.filter((u) => u !== url))
  }

  function removeNew(idx: number) {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const uploaded = await Promise.all(
        newFiles.map(async ({ file }) => {
          const compressed = await compressImage(file)
          return checklistApi.uploadImage(projectId, item.id, compressed)
        }),
      )
      const image_urls = [...existingUrls, ...uploaded.map((u) => u.url)]
      const patched = await checklistApi.update(projectId, item.id, {
        title: title.trim() || item.title,
        notes,
        image_urls,
      })
      if (uiMode === 'complete') {
        const toggled = await checklistApi.toggle(projectId, item.id)
        onSaved({ ...patched, ...toggled })
      } else {
        onSaved(patched)
      }
    } finally {
      setLoading(false)
    }
  }

  const editable = [
    ...existingUrls.map((url) => ({ src: url, onRemove: () => removeExisting(url) })),
    ...newFiles.map(({ preview }, idx) => ({ src: preview, onRemove: () => removeNew(idx) })),
  ]

  const headerTitle =
    uiMode === 'view' ? 'Step' : uiMode === 'complete' ? 'Complete step' : 'Edit step'

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader
          title={headerTitle}
          onClose={onClose}
          onEdit={
            uiMode === 'view' || uiMode === 'complete'
              ? () => setUiMode('edit')
              : undefined
          }
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 overflow-y-auto">
          <div className="form-control">
            <span className="label-text font-medium">Title</span>
            {uiMode === 'edit' ? (
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <p className="text-sm font-medium px-1">{item.title}</p>
            )}
          </div>

          <ChecklistItemPhotos
            mode={uiMode}
            existingUrls={existingUrls}
            editable={editable}
            onAdd={handleAddFiles}
          />

          <div className="form-control">
            <span className="label-text font-medium">Notes</span>
            {uiMode === 'view' ? (
              <p className="text-sm px-1 whitespace-pre-wrap">
                {notes || <span className="text-base-content/40">No notes.</span>}
              </p>
            ) : (
              <textarea
                className="textarea textarea-bordered textarea-sm w-full"
                rows={3}
                placeholder="How did it go?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                autoFocus={uiMode === 'complete'}
              />
            )}
          </div>

          {uiMode !== 'view' && (
            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm w-full"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="xs" />
                ) : uiMode === 'complete' ? (
                  'Mark done'
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}
