import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { getFirstOrNull } from './error';

export const getEntryById = (table: PgTable, id: number) => {
	return db.select().from(table).where(eq(table.id, id)).limit(1).then(getFirstOrNull);
};

export const CreateEntry = <T extends PgTable>(table: PgTable, data: PgTable) => {
	return db.insert();
};

export const deleteById = () => {};
