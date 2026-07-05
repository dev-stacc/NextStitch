import { describe, expect, it } from 'vitest'
import { renderPatternPdf, type PatternSpec } from '@/src/server/services/pattern-gen'

const RECTANGLE_SPEC: PatternSpec = {
  title: 'Simple A-line skirt',
  instructions: ['Pre-wash fabric', 'Cut two rectangles', 'Sew side seams', 'Hem the bottom'],
  pieces: [
    {
      name: 'Front panel',
      shape: 'rectangle',
      dimensions: { width_cm: 50, height_cm: 65 },
      cut_count: 1,
      on_fold: true,
      grain: 'straight',
      notes: 'Place on fold',
    },
  ],
}

const MIXED_SPEC: PatternSpec = {
  title: 'Trapezoid + triangle test',
  instructions: [],
  pieces: [
    {
      name: 'Trapezoid panel',
      shape: 'trapezoid',
      dimensions: { top_cm: 30, bottom_cm: 60, height_cm: 80 },
      cut_count: 2,
      on_fold: false,
      grain: 'bias',
      notes: null,
    },
    {
      name: 'Triangle gusset',
      shape: 'right_triangle',
      dimensions: { leg1_cm: 20, leg2_cm: 30 },
      cut_count: 4,
      on_fold: false,
      grain: 'cross',
    },
  ],
}

describe('renderPatternPdf', () => {
  it('produces a PDF buffer starting with the PDF magic header', async () => {
    const buf = await renderPatternPdf(RECTANGLE_SPEC)
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(1024)
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
  })

  it('adds one page per piece plus the cover', async () => {
    const buf = await renderPatternPdf(MIXED_SPEC)
    const source = buf.toString('binary')
    // Each page emits a "/Type /Page" object (not "/Pages", which is the parent).
    const pageObjects = source.match(/\/Type\s*\/Page(?![s])/g) ?? []
    expect(pageObjects.length).toBe(3)
  })

  it('handles all three shape types without throwing', async () => {
    await expect(
      renderPatternPdf({
        title: 'All shapes',
        instructions: [],
        pieces: [
          {
            name: 'A',
            shape: 'rectangle',
            dimensions: { width_cm: 10, height_cm: 12 },
            cut_count: 1,
            on_fold: false,
            grain: 'straight',
          },
          {
            name: 'B',
            shape: 'trapezoid',
            dimensions: { top_cm: 10, bottom_cm: 20, height_cm: 15 },
            cut_count: 1,
            on_fold: false,
            grain: 'straight',
          },
          {
            name: 'C',
            shape: 'right_triangle',
            dimensions: { leg1_cm: 12, leg2_cm: 18 },
            cut_count: 1,
            on_fold: false,
            grain: 'straight',
          },
        ],
      }),
    ).resolves.toBeInstanceOf(Buffer)
  })
})
