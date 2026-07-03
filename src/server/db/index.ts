import type { DataStore } from './types'
import { DbState } from './state'
import { MemoryProjects } from './projects'
import { MemoryPatterns } from './patterns'
import { MemoryMaterials } from './materials'
import { MemoryChecklist } from './checklist'
import { MemoryMeasurementSets } from './measurement-sets'
import { MemoryProgressImages } from './progress-images'
import { buildNeonStore } from './neon'

function buildMemoryStore(): DataStore {
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
  if (g[globalKey]) return g[globalKey]!
  g[globalKey] = process.env.DATABASE_URL ? buildNeonStore() : buildMemoryStore()
  return g[globalKey]!
}

// Test-only: force the singleton to a fresh memory-backed store.
// Handlers stay untouched — they just see a clean DataStore per test.
export function resetStoreForTests(): DataStore {
  const g = globalThis as WithStore
  const fresh = buildMemoryStore()
  g[globalKey] = fresh
  return fresh
}

export type { DataStore } from './types'
