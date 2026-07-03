import type { DataStore } from '../types'
import { getDb } from '../client'
import { NeonProjects } from './projects'
import { NeonPatterns } from './patterns'
import { NeonMaterials } from './materials'
import { NeonChecklist } from './checklist'
import { NeonMeasurementSets } from './measurement-sets'
import { NeonProgressImages } from './progress-images'

export function buildNeonStore(): DataStore {
  const db = getDb()
  return {
    projects: new NeonProjects(db),
    patterns: new NeonPatterns(db),
    materials: new NeonMaterials(db),
    checklist: new NeonChecklist(db),
    measurementSets: new NeonMeasurementSets(db),
    progressImages: new NeonProgressImages(db),
  }
}
