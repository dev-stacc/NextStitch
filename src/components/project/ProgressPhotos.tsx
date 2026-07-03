'use client'

import { type ChangeEvent, useEffect, useState } from 'react'
import { progressImagesApi } from '@/src/api'
import type { ProjectImage } from '@/src/domain'
import DeleteButton from '@/src/components/ui/DeleteButton'
import ImageViewerModal from '@/src/components/ui/ImageViewerModal'
import Spinner from '@/src/components/ui/Spinner'
import { compressImage } from '@/src/lib/image'

interface Props {
  projectId: number | string
  initialImages: ProjectImage[]
}

export default function ProgressPhotos({ projectId, initialImages }: Props) {
  const [images, setImages] = useState<ProjectImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [viewing, setViewing] = useState<number | null>(null)

  useEffect(() => setImages(initialImages), [initialImages])

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file)
          return progressImagesApi.upload(projectId, compressed)
        }),
      )
      setImages((prev) => [...prev, ...uploaded])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(imageId: number) {
    await progressImagesApi.remove(projectId, imageId)
    setImages((prev) => prev.filter((i) => i.id !== imageId))
  }

  const urls = images.map((img) => img.url)

  return (
    <>
      {viewing !== null && (
        <ImageViewerModal images={urls} startIndex={viewing} onClose={() => setViewing(null)} />
      )}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-lg font-medium">Progress photos</h2>
        <label className={`btn btn-primary btn-sm ${uploading ? 'btn-disabled' : ''}`}>
          {uploading ? <Spinner size="xs" /> : '+ Add'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </label>
      </div>
      <div className="flex-1 min-h-0 flex items-stretch overflow-x-auto gap-3 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {images.length === 0 && !uploading && (
          <p className="text-base-content/40 text-sm self-center">No progress photos yet.</p>
        )}
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative shrink-0 h-full aspect-square rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => setViewing(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <DeleteButton
              onConfirm={() => handleDelete(img.id)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </>
  )
}
