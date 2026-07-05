import type PDFDocument from 'pdfkit'
import type { PatternPiece } from './types'
import { SEAM_ALLOWANCE_CM } from './types'
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  MARGIN_PT,
  TITLE_H_PT,
  boundingBoxCm,
  cmToPt,
  cutDims,
  dimensionLabel,
  pieceScale,
} from './layout'
import { drawCutLine, drawSeamLine } from './shapes'
import {
  centeredCaption,
  foldMarker,
  grainArrow,
  scaleBar,
  titleBlock,
} from './decorations'

type Doc = PDFKit.PDFDocument

export function drawPiecePage(doc: Doc, piece: PatternPiece): void {
  const availW = A4_WIDTH_PT - 2 * MARGIN_PT
  const availH = A4_HEIGHT_PT - 2 * MARGIN_PT - TITLE_H_PT

  const cut = cutDims(piece.shape, piece.dimensions)
  const bbox = boundingBoxCm(piece.shape, cut)
  const scale = pieceScale(bbox)
  const widthPt = cmToPt(bbox.w) * scale
  const heightPt = cmToPt(bbox.h) * scale

  const originX = MARGIN_PT + (availW - widthPt) / 2
  const originY = MARGIN_PT + TITLE_H_PT + (availH - heightPt) / 2

  const foldNote = piece.on_fold ? '  |  Cut on fold' : ''
  const subtitle = `Cut × ${piece.cut_count}${foldNote}  |  SA ${SEAM_ALLOWANCE_CM} cm included`
  titleBlock(doc, piece.name.toUpperCase(), subtitle)

  doc.save().strokeColor('#000000').lineWidth(1.2)
  drawCutLine(doc, piece.shape, cut, { originX, originY, scale })
  doc.stroke().restore()

  doc.save().dash(4, { space: 3 }).lineWidth(0.6).strokeColor('#595959')
  drawSeamLine(doc, piece.shape, cut, { originX, originY, scale })
  doc.stroke().undash().restore()

  if (piece.on_fold) foldMarker(doc, originX, originY, widthPt, heightPt)

  grainArrow(doc, piece.grain, originX, originY, widthPt, heightPt, scale)

  const captionY = originY + heightPt + 4
  const notes = piece.notes?.trim()
  if (notes) {
    centeredCaption(doc, notes, originX + widthPt / 2, captionY, {
      font: 'Helvetica-Oblique',
      color: '#666666',
    })
  }
  const dimText = `Finished: ${dimensionLabel(piece.shape, piece.dimensions)}`
  centeredCaption(doc, dimText, originX + widthPt / 2, captionY + (notes ? 12 : 0))

  scaleBar(doc, scale)
}
