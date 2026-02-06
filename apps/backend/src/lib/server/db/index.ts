import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import * as schema from './schema';
import { DATABASE_URL } from '$env/static/private';
import type { PgTable } from 'drizzle-orm/pg-core';
import { getFirstOrNull } from '$lib/helpers/error';

if (!DATABASE_URL) throw 'Database Url not set';

const client = new SQL(DATABASE_URL);

export const db = drizzle({ client, schema });

db.getEntryById = (table: PgTable, id: number) => {
	return db.select().from(table).where(eq(table.id, id)).limit(1).then(getFirstOrNull);
};
