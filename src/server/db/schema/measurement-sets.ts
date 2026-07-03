import { integer, jsonb, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { projects } from './projects'

export const globalMeasurementSets = pgTable('global_measurement_sets', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  measurements: jsonb('measurements')
    .$type<Record<string, number | null>>()
    .notNull()
    .default({}),
})

export const projectMeasurementSets = pgTable('project_measurement_sets', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  measurements: jsonb('measurements')
    .$type<Record<string, number | null>>()
    .notNull()
    .default({}),
})

export const projectGlobalMeasurementSets = pgTable(
  'project_global_measurement_sets',
  {
    project_id: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    global_ms_id: integer('global_ms_id')
      .notNull()
      .references(() => globalMeasurementSets.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.project_id, t.global_ms_id] })],
)

export type GlobalMeasurementSetRow = typeof globalMeasurementSets.$inferSelect
export type ProjectMeasurementSetRow = typeof projectMeasurementSets.$inferSelect
