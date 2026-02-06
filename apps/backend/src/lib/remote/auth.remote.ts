import { resolve } from '$app/paths';
import { form, query } from '$app/server';
import { sessionTable, userTable } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { createJwtCookieAccessors } from '../server/auth/jwt';
import { deleteAuthCookies, sendOTPCode, verifyOTP } from '../server/auth/auth';
import { AUTH_QUERIES } from '../server/auth/queries';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

const [getUserFromCookie, setUserCookie] =
	createJwtCookieAccessors<typeof userTable.$inferSelect>('user');

const [getSessionFromCookie, setSessionCookie] =
	createJwtCookieAccessors<typeof sessionTable.$inferSelect>('session');

const [getVerificationFromCookie, setVerificationCookie] = createJwtCookieAccessors<{
	email: string;
}>('verification');

export const loginWithEmail = form(
	v.object({ email: v.pipe(v.string(), v.email()) }),
	async ({ email }) => {
		await sendOTPCode(email);

		await setVerificationCookie({
			payload: { email },
			expiration: FIVE_MINUTES_IN_SECONDS
		});

		redirect(302, resolve('/otp'));
	}
);

export const verifyOTPForm = form(v.object({ otp: v.number() }), async ({ otp }) => {
	const payload = await getVerificationFromCookie();
	if (!payload) redirect(302, resolve('/login'));
	const { email } = payload;

	if (!verifyOTP(otp, email)) {
		fail(400, { message: 'OTP not valid. Try resending it' });
	}

	let user = await AUTH_QUERIES.getUserByEmail(email);
	if (!user) {
		const userResult = await AUTH_QUERIES.createUser({ email });
		user = userResult.match(
			(u) => u,
			(e) => error(500, e)
		);
	}

	const session = await AUTH_QUERIES.createRefreshSession(user.id);

	await setSessionCookie({
		payload: session,
		expiration: THIRTY_DAYS_IN_SECONDS
	});

	await setUserCookie({
		payload: user,
		expiration: FIVE_MINUTES_IN_SECONDS
	});

	redirect(302, resolve('/'));
});

export const getUser = query(async () => {
	let session = await getSessionFromCookie();
	if (!session) return null;

	let user = await getUserFromCookie();
	if (user) return { ...user, sessionId: session.id };

	user = await AUTH_QUERIES.getUserById(session.userId);
	if (!user) error(500, 'User deleted');

	// await setUserCookie({
	// 	payload: user,
	// 	expiration: FIVE_MINUTES_IN_SECONDS
	// });

	const updatedSessionResult = await AUTH_QUERIES.updateRefreshSession(session.id);
	session = updatedSessionResult.unwrapOr(null);
	if (!session) return null;

	// await setSessionCookie({
	// 	payload: session,
	// 	expiration: THIRTY_DAYS_IN_SECONDS
	// });

	return { ...user, sessionId: session.id };
});

export const getUserOrLogin = query(async () => {
	const user = await getUser();
	if (!user) redirect(302, resolve('/login'));
	return user;
});

export const getAllSessions = query(async () => {
	const user = await getUserOrLogin();
	return await AUTH_QUERIES.getUserSessions(user.id);
});

export const deleteSession = form(v.object({ sessionId: v.number() }), async ({ sessionId }) => {
	const user = await getUserOrLogin();

	if (sessionId === user.sessionId) {
		deleteAuthCookies();
		redirect(302, resolve('/login'));
	}

	const result = await AUTH_QUERIES.deleteSessionById(sessionId, user.id);

	await getAllSessions().refresh();

	return result.match(
		(r) => r,
		(e) => {
			error(500, e);
		}
	);
});

export const signOut = form(deleteAuthCookies);
