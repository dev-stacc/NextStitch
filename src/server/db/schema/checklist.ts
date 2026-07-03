import { integer, jsonb, pgTable, serial, smallint, text } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const checklistItems = pgTable('checklist_items', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  title: text('title').notNull(),
  notes: text('notes').notNull().default(''),
  checked: smallint('checked').notNull().default(0),
  image_urls: jsonb('image_urls').$type<string[]>().notNull().default([]),
})

export type ChecklistItemRow = typeof checklistItems.$inferSelect
