import type PDFDocument from 'pdfkit'
import { A4_HEIGHT_PT, A4_WIDTH_PT, MARGIN_PT } from './layout'

type Doc = PDFKit.PDFDocument

export function drawCoverPage(doc: Doc, title: string, instructions: readonly string[]): void {
  doc.save().font('Helvetica-Bold').fontSize(18).fillColor('#000000')
  doc.text(title, MARGIN_PT, MARGIN_PT, { lineBreak: false })
  doc.restore()

  doc.moveTo(MARGIN_PT, MARGIN_PT + 30)
    .lineTo(A4_WIDTH_PT - MARGIN_PT, MARGIN_PT + 30)
    .lineWidth(0.5)
    .strokeColor('#b3b3b3')
    .stroke()
  doc.strokeColor('#000000')

  if (instructions.length === 0) return

  doc.save().font('Helvetica-Bold').fontSize(10).fillColor('#000000')
  doc.text('Sewing Instructions', MARGIN_PT, MARGIN_PT + 48, { lineBreak: false })
  doc.restore()

  const textWidth = A4_WIDTH_PT - 2 * MARGIN_PT - 18
  let y = MARGIN_PT + 68
  const bottomLimit = A4_HEIGHT_PT - MARGIN_PT - 30

  for (let i = 0; i < instructions.length; i++) {
    const step = instructions[i]
    doc.save().font('Helvetica').fontSize(9)
    const height = doc.heightOfString(step, { width: textWidth })
    doc.restore()
    if (y + height > bottomLimit) break

    doc.save().font('Helvetica-Bold').fontSize(9).fillColor('#000000')
    doc.text(`${i + 1}.`, MARGIN_PT, y, { lineBreak: false })
    doc.restore()

    doc.save().font('Helvetica').fontSize(9).fillColor('#000000')
    doc.text(step, MARGIN_PT + 18, y, { width: textWidth, height })
    doc.restore()

    y += height + 6
  }
}
