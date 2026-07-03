import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const progressImages = pgTable('progress_images', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  position: integer('position').notNull().default(0),
})

export type ProgressImageRow = typeof progressImages.$inferSelect
