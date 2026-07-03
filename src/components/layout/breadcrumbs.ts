export type CrumbLink = { label: string; href: string }
export type CrumbTerminal = { label: string; href?: undefined }
export type Crumb = CrumbLink | CrumbTerminal

const STATIC_LABELS: Record<string, string> = {
  '/': 'Home',
  '/projects': 'Projects',
  '/stores': 'Stores',
  '/measurements': 'Measurements',
}

interface Context {
  pathname: string
  crumb: string | null
}

export function buildCrumbs({ pathname, crumb }: Context): Crumb[] {
  const projectMatch = pathname.match(/\/projects\/(\d+)/)
  const projectId = projectMatch?.[1]

  const isAddPattern = /\/projects\/\d+\/patterns\/add/.test(pathname)
  const isAddMaterial = /\/projects\/\d+\/materials\/add/.test(pathname)
  const isAddMeasurements = /\/projects\/\d+\/measurements\/add/.test(pathname)
  const isEditMeasurements = /\/projects\/\d+\/measurements\/\d+\/edit/.test(pathname)
  const isGlobalAdd = pathname === '/measurements/add'
  const isGlobalEdit = /^\/measurements\/\d+\/edit$/.test(pathname)
  const isProjectDetail =
    !!projectId &&
    !isAddPattern &&
    !isAddMaterial &&
    !isAddMeasurements &&
    !isEditMeasurements

  const projectCrumb =
    projectId && crumb
      ? ({ label: crumb, href: `/projects/${projectId}` } as CrumbLink)
      : null

  if (isAddPattern) {
    return dropNull([
      { label: 'Projects', href: '/projects' },
      projectCrumb,
      { label: 'Add Pattern' },
    ])
  }
  if (isAddMaterial) {
    return dropNull([
      { label: 'Projects', href: '/projects' },
      projectCrumb,
      { label: 'Add Material' },
    ])
  }
  if (isAddMeasurements) {
    return dropNull([
      { label: 'Projects', href: '/projects' },
      projectCrumb,
      { label: 'Add Measurements' },
    ])
  }
  if (isEditMeasurements) {
    return dropNull([
      { label: 'Projects', href: '/projects' },
      projectCrumb,
      { label: 'Edit Measurements' },
    ])
  }
  if (isGlobalAdd) {
    return [
      { label: 'Measurements', href: '/measurements' },
      { label: 'Add' },
    ]
  }
  if (isGlobalEdit) {
    return [
      { label: 'Measurements', href: '/measurements' },
      { label: 'Edit' },
    ]
  }
  if (isProjectDetail) {
    return dropNull([
      { label: 'Projects', href: '/projects' },
      crumb ? ({ label: crumb } as CrumbTerminal) : null,
    ])
  }
  return [{ label: STATIC_LABELS[pathname] ?? 'Sewing Assistant' }]
}

function dropNull(crumbs: (Crumb | null)[]): Crumb[] {
  return crumbs.filter((c): c is Crumb => c != null)
}
