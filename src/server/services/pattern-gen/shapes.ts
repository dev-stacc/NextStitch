import type PDFDocument from 'pdfkit'
import type { Dimensions, Shape } from './types'
import { SEAM_ALLOWANCE_CM } from './types'
import { cmToPt } from './layout'

type Doc = PDFKit.PDFDocument

export interface DrawContext {
  originX: number
  originY: number
  scale: number
}

function toPt(x: number, y: number, ctx: DrawContext): [number, number] {
  return [ctx.originX + x * CM_TO_PT_S * ctx.scale, ctx.originY + y * CM_TO_PT_S * ctx.scale]
}

const CM_TO_PT_S = cmToPt(1)

export function drawCutLine(doc: Doc, shape: Shape, dims: Dimensions, ctx: DrawContext): void {
  if (shape === 'rectangle') {
    const d = dims as { width_cm: number; height_cm: number }
    doc.rect(
      ctx.originX,
      ctx.originY,
      cmToPt(d.width_cm) * ctx.scale,
      cmToPt(d.height_cm) * ctx.scale,
    )
    return
  }
  if (shape === 'trapezoid') {
    const d = dims as { top_cm: number; bottom_cm: number; height_cm: number }
    const dx = (d.bottom_cm - d.top_cm) / 2
    doc
      .moveTo(...toPt(dx, 0, ctx))
      .lineTo(...toPt(dx + d.top_cm, 0, ctx))
      .lineTo(...toPt(d.bottom_cm, d.height_cm, ctx))
      .lineTo(...toPt(0, d.height_cm, ctx))
      .closePath()
    return
  }
  const d = dims as { leg1_cm: number; leg2_cm: number }
  doc
    .moveTo(...toPt(0, 0, ctx))
    .lineTo(...toPt(d.leg1_cm, 0, ctx))
    .lineTo(...toPt(0, d.leg2_cm, ctx))
    .closePath()
}

export function drawSeamLine(doc: Doc, shape: Shape, dims: Dimensions, ctx: DrawContext): void {
  const sa = SEAM_ALLOWANCE_CM
  if (shape === 'rectangle') {
    const d = dims as { width_cm: number; height_cm: number }
    doc.rect(
      ctx.originX + cmToPt(sa) * ctx.scale,
      ctx.originY + cmToPt(sa) * ctx.scale,
      cmToPt(d.width_cm - 2 * sa) * ctx.scale,
      cmToPt(d.height_cm - 2 * sa) * ctx.scale,
    )
    return
  }
  if (shape === 'trapezoid') {
    const d = dims as { top_cm: number; bottom_cm: number; height_cm: number }
    const dx = (d.bottom_cm - d.top_cm) / 2
    doc
      .moveTo(...toPt(dx + sa, sa, ctx))
      .lineTo(...toPt(dx + d.top_cm - sa, sa, ctx))
      .lineTo(...toPt(d.bottom_cm - sa, d.height_cm - sa, ctx))
      .lineTo(...toPt(sa, d.height_cm - sa, ctx))
      .closePath()
    return
  }
  const d = dims as { leg1_cm: number; leg2_cm: number }
  doc
    .moveTo(...toPt(sa, sa, ctx))
    .lineTo(...toPt(d.leg1_cm - sa, sa, ctx))
    .lineTo(...toPt(sa, d.leg2_cm - sa, ctx))
    .closePath()
}
