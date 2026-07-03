export async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer())
  const mime = file.type || 'application/octet-stream'
  return `data:${mime};base64,${buf.toString('base64')}`
}
