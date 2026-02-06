import { and, desc, eq } from 'drizzle-orm';
import { ResultAsync } from 'neverthrow';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { sessionTable, userTable } from '$lib/server/db/schema';
import { getFirstOrNull, getFirstOrThrow } from '$lib/helpers/error';

export class AUTH_QUERIES {
	static async getUserByEmail(email: string) {
		return await db.select().from(userTable).where(eq(userTable.email, email)).then(getFirstOrNull);
	}

	static async createUser(user: typeof userTable.$inferInsert) {
		return await ResultAsync.fromPromise(
			db.insert(userTable).values(user).returning().then(getFirstOrThrow),
			(e) => {
				console.error('failed to create user:', e);
				return `Failed to create user`;
			}
		);
	}

	static async updateRefreshSession(sessionId: number) {
		return await ResultAsync.fromPromise(
			db
				.update(sessionTable)
				.set({ issuedAt: new Date() })
				.where(eq(sessionTable.id, sessionId))
				.returning()
				.then(getFirstOrThrow),
			(e) => {
				console.error('failed to update session:', e);
				return `Failed to update refresh session`;
			}
		);
	}

	static async getUserById(userId: number) {
		return await db.select().from(userTable).where(eq(userTable.id, userId)).then(getFirstOrNull);
	}

	static async createRefreshSession(userId: number) {
		return await db
			.insert(sessionTable)
			.values({
				userId: userId,
				userAgent: getRequestEvent().request.headers.get('user-agent') || 'unknown'
			})
			.returning()
			.then(getFirstOrThrow);
	}

	static async getUserSessions(userId: number) {
		return await db
			.select()
			.from(sessionTable)
			.where(eq(sessionTable.userId, userId))
			.orderBy(desc(sessionTable.issuedAt));
	}

	static async deleteSessionById(sessionId: number, userId: number) {
		return ResultAsync.fromPromise(
			db
				.delete(sessionTable)
				.where(and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId))),
			(e) => {
				console.error('failed to delete session:', e);
				return `Failed to delete session`;
			}
		);
	}
}
