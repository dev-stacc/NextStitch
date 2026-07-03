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
} from '@/src/domain'

export interface ProjectsRepo {
  list(): Promise<Project[]>
  get(id: number): Promise<ProjectDetail | null>
  create(input: CreateProjectInput): Promise<Project>
  update(id: number, input: UpdateProjectInput): Promise<Project | null>
  setStatus(id: number, status: ProjectStatus): Promise<boolean>
  remove(id: number): Promise<boolean>
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
  listGlobal(): Promise<MeasurementSet[]>
  createGlobal(input: UpsertMeasurementSetInput): Promise<MeasurementSet>
  updateGlobal(msId: number, input: UpsertMeasurementSetInput): Promise<MeasurementSet | null>
  removeGlobal(msId: number): Promise<boolean>

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
