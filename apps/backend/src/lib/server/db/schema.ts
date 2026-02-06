import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
	id: serial('id').primaryKey(),
	email: varchar().unique().notNull()
});

export const sessionTable = pgTable('session', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	issuedAt: timestamp('issued_at').notNull().defaultNow(),
	userAgent: varchar('user_agent').notNull()
});
