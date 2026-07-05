import PDFDocument from 'pdfkit'
import type { PatternSpec } from './types'
import { drawCoverPage } from './cover-page'
import { drawPiecePage } from './piece-page'

export async function renderPatternPdf(spec: PatternSpec): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
  const chunks: Buffer[] = []
  doc.on('data', (c) => chunks.push(c as Buffer))
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))))

  drawCoverPage(doc, spec.title, spec.instructions)
  for (const piece of spec.pieces) {
    doc.addPage({ size: 'A4', margin: 0 })
    drawPiecePage(doc, piece)
  }
  doc.end()
  return done
}
