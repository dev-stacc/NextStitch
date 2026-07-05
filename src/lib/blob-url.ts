import { useEffect, useState } from 'react'

// Browsers (Chromium) block data: URLs in iframes. This hook converts a data
// URL to a blob: URL on the fly so iframes can render PDFs/SVGs normally.
export function useBlobUrl(url: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!url) { setBlobUrl(null); return }
    if (!url.startsWith('data:')) { setBlobUrl(url); return }

    const [header, b64] = url.split(',')
    const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream'
    const bytes = atob(b64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    const blob = new Blob([arr], { type: mime })
    const objectUrl = URL.createObjectURL(blob)
    setBlobUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [url])

  return blobUrl
}
