'use client'

import type { Pattern } from '@/src/models'
import Modal from '@/src/components/ui/Modal'

interface Props {
  pattern: Pattern
  onClose: () => void
}

export default function PreviewModal({ pattern, onClose }: Props) {
  const isPDF = pattern.url?.endsWith('.pdf')
  const isSVG = pattern.url?.endsWith('.svg')
  const src = pattern.url ?? ''
  const title = pattern.title ?? pattern.pattern_number ?? 'Pattern'

  return (
    <Modal
      onClose={onClose}
      contentClassName="bg-base-100 rounded-xl shadow-2xl flex flex-col w-[80vw] max-w-[900px] h-[85vh]"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300">
        <span className="font-medium truncate">{title}</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => window.open(src, '_blank', 'noopener')}
          >
            Print
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost text-lg leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        {isPDF || isSVG ? (
          <iframe src={src} className="w-full h-full rounded" title="Pattern preview" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt={title} className="max-w-full max-h-full object-contain rounded" />
        )}
      </div>
    </Modal>
  )
}
