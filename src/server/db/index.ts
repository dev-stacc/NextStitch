import type { DataStore } from './types'
import { DbState } from './state'
import { MemoryProjects } from './projects'
import { MemoryPatterns } from './patterns'
import { MemoryMaterials } from './materials'
import { MemoryChecklist } from './checklist'
import { MemoryMeasurementSets } from './measurement-sets'
import { MemoryProgressImages } from './progress-images'

function build(): DataStore {
  const state = new DbState()
  return {
    projects: new MemoryProjects(state),
    patterns: new MemoryPatterns(state),
    materials: new MemoryMaterials(state),
    checklist: new MemoryChecklist(state),
    measurementSets: new MemoryMeasurementSets(state),
    progressImages: new MemoryProgressImages(state),
  }
}

const globalKey = Symbol.for('next-stitch.store')
type WithStore = typeof globalThis & { [key: symbol]: DataStore | undefined }

export function getStore(): DataStore {
  const g = globalThis as WithStore
  if (!g[globalKey]) g[globalKey] = build()
  return g[globalKey]!
}

export type { DataStore } from './types'
