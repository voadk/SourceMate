<script lang="ts">
	import { resolve } from '$app/paths';
	import { getUser, signOut } from '$lib/remote/auth.remote';

	let user = $derived(await getUser());
</script>

<main class="mt-20 flex flex-col items-center gap-2">
	<nav>
		<a class="text-primary hover:underline" href={resolve('/profile')}>Profile</a>
	</nav>
	<h1 class="text-3xl">Welcome to SvelteKit</h1>

	{#if user}
		<p>Your email is {user.email} and your id is {user.id}</p>
		<form {...signOut}>
			<button class="text-primary hover:underline" type="submit">Sign out</button>
		</form>
	{:else}
		<p>
			You not logged in. Press here:
			<a class="text-primary hover:underline" href={resolve('/(auth)/login')}>Login</a>
		</p>
	{/if}
</main>
