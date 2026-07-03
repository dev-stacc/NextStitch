'use client'

import { type ChangeEvent } from 'react'

interface Props {
  mode: 'view' | 'edit'
  preview: string | null
  onChange: (file: File | null) => void
  onClear: () => void
}

export default function MaterialImageField({ mode, preview, onChange, onClear }: Props) {
  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onChange(file)
  }

  if (mode === 'view') {
    return (
      <div className="form-control">
        <span className="label-text font-medium">Image</span>
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="" className="w-16 h-16 object-cover rounded" />
        ) : (
          <p className="text-sm px-1 text-base-content/40">No image.</p>
        )}
      </div>
    )
  }

  return (
    <div className="form-control">
      <span className="label-text font-medium">Image</span>
      {preview ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded" />
          <div className="flex flex-col gap-1">
            <label className="btn btn-ghost btn-xs cursor-pointer">
              Change
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePick}
              />
            </label>
            <button type="button" className="btn btn-ghost btn-xs" onClick={onClear}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file-input file-input-bordered file-input-sm w-full"
          onChange={handlePick}
        />
      )}
    </div>
  )
}
