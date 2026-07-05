export function compressImage(
  file: File,
  maxPx = 1920,
  quality = 0.82,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas 2D unavailable'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        try {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression failed'))
              resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
            },
            'image/jpeg',
            quality,
          )
        } catch (e) {
          // canvas.toBlob throws SecurityError when the browser blocks canvas
          // fingerprinting (e.g. Firefox privacy.resistFingerprinting). Fall
          // back to the original file so the upload still works.
          if (e instanceof DOMException && e.name === 'SecurityError') {
            resolve(file)
          } else {
            reject(e)
          }
        }
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export const PDF_THUMB_SCALE = 48 / 816
