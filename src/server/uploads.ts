const MAX_IMAGE_BYTES = 20 * 1024 * 1024 // 20 MB
const MAX_PATTERN_BYTES = 50 * 1024 * 1024 // 50 MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_PATTERN_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const

type ValidationResult = { ok: true } | { ok: false; error: string }

export function validateUpload(
  file: File,
  allowedTypes: readonly string[],
  maxBytes: number,
): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || 'unknown'}` }
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)` }
  }
  return { ok: true }
}

export function validateImage(file: File): ValidationResult {
  return validateUpload(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES)
}

export function validatePattern(file: File): ValidationResult {
  return validateUpload(file, ALLOWED_PATTERN_TYPES, MAX_PATTERN_BYTES)
}

export async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer())
  const mime = file.type || 'application/octet-stream'
  return `data:${mime};base64,${buf.toString('base64')}`
}
