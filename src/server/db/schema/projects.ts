import { pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  budget: real('budget'),
  status: text('status').notNull().default('to_start'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ProjectRow = typeof projects.$inferSelect
