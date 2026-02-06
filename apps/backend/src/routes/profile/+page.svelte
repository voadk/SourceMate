<script lang="ts">
	import { deleteSession, getAllSessions, getUserOrLogin } from '$lib/remote/auth.remote';
	import { UserAgent } from '@std/http';

	const sessions = $derived(await getAllSessions());
	const user = $derived(await getUserOrLogin());

	const formatDate = (issuedAt: Date) =>
		issuedAt.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
</script>

<main class="mx-auto max-w-3xl *:mt-8">
	<section>
		<h1 class="text-4xl">Profile</h1>
		{#each Object.entries(user) as [key, value] (key)}
			<p>
				<strong>{key}:</strong>
				{value}
			</p>
		{/each}
	</section>
	<section>
		<h2 class="text-2xl">Sessions</h2>
		<ul>
			{#each sessions as session (session.id)}
				{@const userAgent = new UserAgent(session.userAgent)}
				<li class="flex justify-between">
					<span>
						{userAgent.os.name}
						{userAgent.os.version} - {userAgent.browser.name} - {formatDate(session.issuedAt)}
					</span>
					{#if session.id === user.sessionId}
						<strong>(current)</strong>
					{/if}
					<span>
						<form {...deleteSession.for(session.id)}>
							<input {...deleteSession.fields.sessionId.as('number')} value={session.id} hidden />
							<button type="submit">❌</button>
						</form>
					</span>
				</li>
			{/each}
		</ul>
	</section>
</main>
