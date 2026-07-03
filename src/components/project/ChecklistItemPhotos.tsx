'use client'

interface Image {
  src: string
  onRemove?: () => void
}

interface Props {
  mode: 'view' | 'edit' | 'complete'
  existingUrls: string[]
  editable: Image[]
  onAdd: (files: FileList | null) => void
}

export default function ChecklistItemPhotos({ mode, existingUrls, editable, onAdd }: Props) {
  if (mode === 'view') {
    return (
      <div className="form-control">
        <span className="label-text font-medium">Photos</span>
        {existingUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((url, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded" />
            ))}
          </div>
        ) : (
          <p className="text-sm px-1 text-base-content/40">No photos.</p>
        )}
      </div>
    )
  }

  return (
    <div className="form-control">
      <span className="label-text font-medium">Photos</span>
      {editable.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {editable.map(({ src, onRemove }, i) => (
            <div key={i} className="relative w-16 h-16 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover rounded" />
              {onRemove && (
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-base-100 rounded-full w-4 h-4 flex items-center justify-center text-xs shadow leading-none"
                  onClick={onRemove}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <label className="btn btn-ghost btn-sm w-full border border-dashed border-base-300 cursor-pointer">
        + Add photo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => onAdd(e.target.files)}
        />
      </label>
    </div>
  )
}
