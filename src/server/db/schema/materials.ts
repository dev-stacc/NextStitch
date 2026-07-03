import { integer, pgTable, real, serial, smallint, text } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const materials = pgTable('materials', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: text('quantity'),
  price: real('price'),
  image_url: text('image_url'),
  notes: text('notes'),
  care_instructions: text('care_instructions'),
  grain_direction: text('grain_direction'),
  pre_wash: smallint('pre_wash').notNull().default(0),
  purchased: smallint('purchased').notNull().default(0),
})

export type MaterialRow = typeof materials.$inferSelect
