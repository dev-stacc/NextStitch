'use client'

import type { Pattern } from '@/src/domain'
import { PDF_THUMB_SCALE } from '@/src/lib/image'

interface Props {
  pattern: Pattern
}

function isUpload(pattern: Pattern): boolean {
  return pattern.source === 'upload' || pattern.source === 'generated'
}

export default function PatternThumbnail({ pattern }: Props) {
  const upload = isUpload(pattern)
  const isPDF = pattern.url?.endsWith('.pdf')
  const isSVG = pattern.url?.endsWith('.svg')

  if (upload && !isPDF && !isSVG && pattern.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={pattern.url} alt="" className="w-full h-full object-cover" />
  }
  if (upload && (isPDF || isSVG) && pattern.url) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={pattern.url}
          style={{
            width: 816,
            height: 816,
            transform: `scale(${PDF_THUMB_SCALE})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          title=""
        />
      </div>
    )
  }
  if (!upload && pattern.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={pattern.image_url} alt="" className="w-full h-full object-cover" />
  }
  return <PlaceholderIcon />
}

function PlaceholderIcon() {
  return (
    <div className="w-full h-full flex items-center justify-center text-base-content/30">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
        />
      </svg>
    </div>
  )
}

export function patternIsUpload(pattern: Pattern): boolean {
  return isUpload(pattern)
}
