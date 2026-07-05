'use client'

import { useRef } from 'react'
import { useBlobUrl } from '@/src/lib/blob-url'
import Modal from '@/src/components/ui/Modal'

interface Props {
  url: string
  title?: string
  showPrint?: boolean
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  pagerText?: string
}

export default function PreviewModal({
  url,
  title,
  showPrint = true,
  onClose,
  onPrev,
  onNext,
  pagerText,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isPDF = url.endsWith('.pdf') || url.startsWith('data:application/pdf')
  const isSVG = url.endsWith('.svg') || url.startsWith('data:image/svg')
  const iframeSrc = useBlobUrl(isPDF || isSVG ? url : null) ?? url

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
        <span className="font-medium truncate">{title ?? ''}</span>
        <div className="flex gap-2">
          {showPrint && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={handlePrint}>
              Print
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-ghost text-lg leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden flex items-center justify-center p-4">
        {isPDF || isSVG ? (
          <iframe ref={iframeRef} src={iframeSrc} className="w-full h-full rounded" title="Pattern preview" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt={title ?? ''} className="max-w-full max-h-full object-contain rounded" />
        )}
        {onPrev && (
          <button
            type="button"
            className="absolute left-5 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/80"
            onClick={onPrev}
          >
            ‹
          </button>
        )}
        {onNext && (
          <button
            type="button"
            className="absolute right-5 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/80"
            onClick={onNext}
          >
            ›
          </button>
        )}
        {pagerText && (
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-base-content/50 text-xs">
            {pagerText}
          </span>
        )}
      </div>
    </Modal>
  )
}
