import type { Dimensions, Shape } from './types'
import { SEAM_ALLOWANCE_CM } from './types'

export const CM_TO_PT = 28.3465
export const A4_WIDTH_PT = 595.28
export const A4_HEIGHT_PT = 841.89

export const MARGIN_CM = 1.5
export const TITLE_H_CM = 2.8
export const MARGIN_PT = MARGIN_CM * CM_TO_PT
export const TITLE_H_PT = TITLE_H_CM * CM_TO_PT

export const cmToPt = (cm: number): number => cm * CM_TO_PT

export function cutDims(shape: Shape, dims: Dimensions): Dimensions {
  const sa2 = 2 * SEAM_ALLOWANCE_CM
  if (shape === 'rectangle') {
    const d = dims as { width_cm: number; height_cm: number }
    return { width_cm: d.width_cm + sa2, height_cm: d.height_cm + sa2 }
  }
  if (shape === 'trapezoid') {
    const d = dims as { top_cm: number; bottom_cm: number; height_cm: number }
    return { top_cm: d.top_cm + sa2, bottom_cm: d.bottom_cm + sa2, height_cm: d.height_cm + sa2 }
  }
  const d = dims as { leg1_cm: number; leg2_cm: number }
  return { leg1_cm: d.leg1_cm + sa2, leg2_cm: d.leg2_cm + sa2 }
}

export function boundingBoxCm(shape: Shape, dims: Dimensions): { w: number; h: number } {
  if (shape === 'rectangle') {
    const d = dims as { width_cm: number; height_cm: number }
    return { w: d.width_cm, h: d.height_cm }
  }
  if (shape === 'trapezoid') {
    const d = dims as { top_cm: number; bottom_cm: number; height_cm: number }
    return { w: Math.max(d.top_cm, d.bottom_cm), h: d.height_cm }
  }
  const d = dims as { leg1_cm: number; leg2_cm: number }
  return { w: d.leg1_cm, h: d.leg2_cm }
}

export function pieceScale(bboxCm: { w: number; h: number }): number {
  const availW = A4_WIDTH_PT - 2 * MARGIN_PT
  const availH = A4_HEIGHT_PT - 2 * MARGIN_PT - TITLE_H_PT
  return Math.min(availW / cmToPt(bboxCm.w), availH / cmToPt(bboxCm.h), 1.0)
}

export function dimensionLabel(shape: Shape, dims: Dimensions): string {
  if (shape === 'rectangle') {
    const d = dims as { width_cm: number; height_cm: number }
    return `${d.width_cm} × ${d.height_cm} cm`
  }
  if (shape === 'trapezoid') {
    const d = dims as { top_cm: number; bottom_cm: number; height_cm: number }
    return `top ${d.top_cm} cm / bottom ${d.bottom_cm} cm / h ${d.height_cm} cm`
  }
  const d = dims as { leg1_cm: number; leg2_cm: number }
  return `${d.leg1_cm} × ${d.leg2_cm} cm`
}
