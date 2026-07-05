'use client'

import { useRef } from 'react'
import type { Pattern } from '@/src/models'
import { useBlobUrl } from '@/src/lib/blob-url'
import Modal from '@/src/components/ui/Modal'

interface Props {
  pattern: Pattern
  onClose: () => void
}

export default function PreviewModal({ pattern, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isPDF = pattern.url?.endsWith('.pdf') || pattern.url?.startsWith('data:application/pdf')
  const isSVG = pattern.url?.endsWith('.svg') || pattern.url?.startsWith('data:image/svg')
  const src = pattern.url ?? ''
  const iframeSrc = useBlobUrl(isPDF || isSVG ? src : null) ?? src
  const title = pattern.title ?? pattern.pattern_number ?? 'Pattern'

  function handlePrint() {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print()
    } else {
      window.open(iframeSrc, '_blank', 'noopener')
    }
  }

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
            onClick={handlePrint}
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
          <iframe ref={iframeRef} src={iframeSrc} className="w-full h-full rounded" title="Pattern preview" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt={title} className="max-w-full max-h-full object-contain rounded" />
        )}
      </div>
    </Modal>
  )
}
