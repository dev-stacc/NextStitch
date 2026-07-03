import type {
  ChecklistItem,
  CreateChecklistItemInput,
  CreateMaterialInput,
  CreatePatternInput,
  CreateProjectInput,
  Material,
  MeasurementSet,
  Pattern,
  Project,
  ProjectDetail,
  ProjectImage,
  ProjectStatus,
  UpdateChecklistItemInput,
  UpdateMaterialInput,
  UpdatePatternInput,
  UpdateProjectInput,
  UpsertMeasurementSetInput,
} from '@/src/models'

// Every project- or global-set method takes the current user's id. Ownership
// is enforced at the repo boundary: unknown projects for that user return null.
// Child resources (patterns/materials/checklist/…) don't take userId — the
// route handler must resolve the project first via projects.get(userId, id).

export interface ProjectsRepo {
  list(userId: string): Promise<Project[]>
  get(userId: string, id: number): Promise<ProjectDetail | null>
  create(userId: string, input: CreateProjectInput): Promise<Project>
  update(userId: string, id: number, input: UpdateProjectInput): Promise<Project | null>
  setStatus(userId: string, id: number, status: ProjectStatus): Promise<boolean>
  remove(userId: string, id: number): Promise<boolean>
}

export interface PatternsRepo {
  create(projectId: number, input: CreatePatternInput): Promise<Pattern | null>
  update(projectId: number, patternId: number, input: UpdatePatternInput): Promise<Pattern | null>
  remove(projectId: number, patternId: number): Promise<boolean>
}

export interface MaterialsRepo {
  create(projectId: number, input: CreateMaterialInput): Promise<Material | null>
  update(projectId: number, materialId: number, input: UpdateMaterialInput): Promise<Material | null>
  remove(projectId: number, materialId: number): Promise<boolean>
}

export interface ChecklistRepo {
  list(projectId: number): Promise<ChecklistItem[]>
  create(projectId: number, input: CreateChecklistItemInput): Promise<ChecklistItem | null>
  update(
    projectId: number,
    itemId: number,
    input: UpdateChecklistItemInput,
  ): Promise<ChecklistItem | null>
  toggle(projectId: number, itemId: number): Promise<ChecklistItem | null>
  remove(projectId: number, itemId: number): Promise<boolean>
  reorder(projectId: number, ids: number[]): Promise<boolean>
}

export interface MeasurementSetsRepo {
  listGlobal(userId: string): Promise<MeasurementSet[]>
  createGlobal(userId: string, input: UpsertMeasurementSetInput): Promise<MeasurementSet>
  updateGlobal(
    userId: string,
    msId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null>
  removeGlobal(userId: string, msId: number): Promise<boolean>

  listForProject(projectId: number): Promise<MeasurementSet[]>
  createForProject(
    projectId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null>
  updateForProject(
    projectId: number,
    msId: number,
    input: UpsertMeasurementSetInput,
  ): Promise<MeasurementSet | null>
  removeForProject(projectId: number, msId: number): Promise<boolean>
  unlinkGlobal(projectId: number, globalMsId: number): Promise<boolean>
}

export interface ProgressImagesRepo {
  add(projectId: number, url: string): Promise<ProjectImage | null>
  remove(projectId: number, imageId: number): Promise<boolean>
}

export interface DataStore {
  projects: ProjectsRepo
  patterns: PatternsRepo
  materials: MaterialsRepo
  checklist: ChecklistRepo
  measurementSets: MeasurementSetsRepo
  progressImages: ProgressImagesRepo
}
