import { integer, pgTable, real, serial, smallint, text } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const patterns = pgTable('patterns', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  source: text('source').notNull(),
  title: text('title'),
  pattern_number: text('pattern_number'),
  url: text('url'),
  image_url: text('image_url'),
  price: text('price'),
  price_paid: real('price_paid'),
  purchased: smallint('purchased').notNull().default(0),
  notes: text('notes'),
})

export type PatternRow = typeof patterns.$inferSelect
