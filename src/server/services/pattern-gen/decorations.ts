import type PDFDocument from 'pdfkit'
import type { Grain } from './types'
import { A4_HEIGHT_PT, A4_WIDTH_PT, CM_TO_PT, MARGIN_PT, TITLE_H_PT, cmToPt } from './layout'

type Doc = PDFKit.PDFDocument

function textAt(
  doc: Doc,
  text: string,
  x: number,
  y: number,
  opts: { font?: string; size?: number; color?: string; align?: 'left' | 'center' } = {},
): void {
  const font = opts.font ?? 'Helvetica'
  const size = opts.size ?? 8
  const color = opts.color ?? '#000000'
  doc.save().font(font).fontSize(size).fillColor(color)
  const w = doc.widthOfString(text)
  const drawX = opts.align === 'center' ? x - w / 2 : x
  doc.text(text, drawX, y, { lineBreak: false })
  doc.restore()
}

export function titleBlock(doc: Doc, title: string, subtitle: string): void {
  textAt(doc, title, MARGIN_PT, MARGIN_PT, { font: 'Helvetica-Bold', size: 13 })
  textAt(doc, subtitle, MARGIN_PT, MARGIN_PT + 15, { size: 9 })
  doc.moveTo(MARGIN_PT, MARGIN_PT + TITLE_H_PT)
    .lineTo(A4_WIDTH_PT - MARGIN_PT, MARGIN_PT + TITLE_H_PT)
    .lineWidth(0.5)
    .strokeColor('#b3b3b3')
    .stroke()
  doc.strokeColor('#000000')
}

export function foldMarker(
  doc: Doc,
  originX: number,
  originY: number,
  widthPt: number,
  heightPt: number,
): void {
  const foldX = originX + widthPt / 2
  doc.save().dash(8, { space: 4 }).lineWidth(0.8).strokeColor('#3366cc')
  doc.moveTo(foldX, originY).lineTo(foldX, originY + heightPt).stroke()
  doc.undash().strokeColor('#000000').restore()
  textAt(doc, 'FOLD', foldX, originY - 12, { size: 7, color: '#3366cc', align: 'center' })
}

export function grainArrow(
  doc: Doc,
  grain: Grain,
  originX: number,
  originY: number,
  widthPt: number,
  heightPt: number,
  scale: number,
): void {
  const arr = 0.22 * CM_TO_PT * scale
  let cx: number, cy: number, ex: number, ey: number
  if (grain === 'bias') {
    cx = originX + widthPt * 0.2
    cy = originY + heightPt * 0.2
    ex = originX + widthPt * 0.8
    ey = originY + heightPt * 0.8
  } else if (grain === 'cross') {
    cx = originX + widthPt * 0.2
    cy = originY + heightPt / 2
    ex = originX + widthPt * 0.8
    ey = originY + heightPt / 2
  } else {
    cx = originX + widthPt / 2
    cy = originY + heightPt * 0.18
    ex = originX + widthPt / 2
    ey = originY + heightPt * 0.82
  }

  doc.save().lineWidth(0.8).strokeColor('#000000')
  doc.moveTo(cx, cy).lineTo(ex, ey).stroke()

  const angle = Math.atan2(ey - cy, ex - cx)
  for (const [tipX, tipY, direction] of [
    [ex, ey, 1],
    [cx, cy, -1],
  ] as const) {
    for (const side of [-1, 1] as const) {
      const ax = tipX + direction * arr * 1.8 * Math.cos(angle) + side * arr * 0.5 * Math.sin(angle)
      const ay = tipY + direction * arr * 1.8 * Math.sin(angle) - side * arr * 0.5 * Math.cos(angle)
      doc.moveTo(tipX, tipY).lineTo(ax, ay).stroke()
    }
  }
  doc.restore()

  const label = grain === 'straight' ? 'GRAIN' : `${grain.toUpperCase()} GRAIN`
  textAt(doc, label, (cx + ex) / 2, (cy + ey) / 2 - 4, { size: 7, align: 'center' })
}

export function scaleBar(doc: Doc, scale: number): void {
  const bar = 10 * CM_TO_PT * scale
  const x = MARGIN_PT
  const y = A4_HEIGHT_PT - MARGIN_PT - 18
  doc.save().lineWidth(0.6).strokeColor('#000000')
  doc.moveTo(x, y).lineTo(x + bar, y).stroke()
  for (const tickX of [x, x + bar / 2, x + bar]) {
    doc.moveTo(tickX, y - 2).lineTo(tickX, y + 2).stroke()
  }
  doc.restore()
  textAt(doc, '10 cm (reference)', x + bar / 2, y + 4, { size: 7, align: 'center' })
  if (scale < 0.99) {
    const pct = Math.round(100 / scale)
    textAt(doc, `Print at ${pct}% for full size`, x + bar / 2, y + 12, {
      font: 'Helvetica-Oblique',
      size: 7,
      align: 'center',
    })
  }
}

export function centeredCaption(
  doc: Doc,
  text: string,
  cx: number,
  y: number,
  opts: { font?: string; size?: number; color?: string } = {},
): void {
  textAt(doc, text, cx, y, { ...opts, align: 'center' })
}

export { cmToPt }
