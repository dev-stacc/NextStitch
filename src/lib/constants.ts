import type { ProjectStatus, PatternSource, GrainDirection } from '@/src/models'

export const MEASUREMENTS: ReadonlyArray<readonly [string, string]> = [
  ['ankle', 'Ankle circumference'],
  ['biceps', 'Biceps circumference'],
  ['bustFront', 'Bust front'],
  ['bustPointToUnderbust', 'Bust point to underbust'],
  ['bustSpan', 'Bust span'],
  ['chest', 'Chest circumference'],
  ['crossSeam', 'Cross seam'],
  ['crossSeamFront', 'Cross seam front'],
  ['crotchDepth', 'Crotch depth'],
  ['head', 'Head circumference'],
  ['heel', 'Heel circumference'],
  ['highBust', 'High bust'],
  ['highBustFront', 'High bust front'],
  ['hips', 'Hips circumference'],
  ['hpsToBust', 'HPS to bust'],
  ['hpsToWaistBack', 'HPS to waist back'],
  ['hpsToWaistFront', 'HPS to waist front'],
  ['inseam', 'Inseam'],
  ['knee', 'Knee circumference'],
  ['neck', 'Neck circumference'],
  ['seat', 'Seat circumference'],
  ['seatBack', 'Seat back'],
  ['shoulderSlope', 'Shoulder slope'],
  ['shoulderToElbow', 'Shoulder to elbow'],
  ['shoulderToShoulder', 'Shoulder to shoulder'],
  ['shoulderToWrist', 'Shoulder to wrist'],
  ['underbust', 'Underbust'],
  ['upperLeg', 'Upper leg circumference'],
  ['waist', 'Waist circumference'],
  ['waistBack', 'Waist back'],
  ['waistToArmpit', 'Waist to armpit'],
  ['waistToFloor', 'Waist to floor'],
  ['waistToHips', 'Waist to hips'],
  ['waistToKnee', 'Waist to knee'],
  ['waistToSeat', 'Waist to seat'],
  ['waistToUnderbust', 'Waist to underbust'],
  ['waistToUpperLeg', 'Waist to upper leg'],
  ['wrist', 'Wrist circumference'],
]

export interface StatusOption {
  value: ProjectStatus
  label: string
  dot: string
  badge: string
}

export const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: 'to_start', label: 'To Start', dot: 'bg-base-content/50', badge: 'badge-ghost text-base-content/50' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-success', badge: 'badge-success' },
  { value: 'on_hold', label: 'On Hold', dot: 'bg-warning', badge: 'badge-warning' },
  { value: 'completed', label: 'Completed', dot: 'bg-info', badge: 'badge-info' },
]

export const PATTERN_SOURCES: readonly PatternSource[] = [
  'simplicity',
  'mood',
  'black_snail',
  'truly_victorian',
  'laughing_moon',
]

export const MATERIAL_SOURCES: readonly string[] = [
  'fabricville',
  'tonitex',
  'spool_of_thread',
  'fine_fabrics_canada',
  'the_fabric_club',
  'cleanersupply',
]

export interface GrainDirectionOption {
  value: '' | GrainDirection
  label: string
}

export const GRAIN_DIRECTION_OPTIONS: readonly GrainDirectionOption[] = [
  { value: '', label: '— not specified —' },
  { value: 'straight', label: 'Straight grain' },
  { value: 'bias', label: 'Bias cut' },
  { value: 'cross', label: 'Cross grain' },
]

export const GRAIN_LABELS: Record<GrainDirection, string> = {
  straight: 'Straight grain',
  bias: 'Bias cut',
  cross: 'Cross grain',
}
