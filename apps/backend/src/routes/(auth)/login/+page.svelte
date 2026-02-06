<script lang="ts">
	import { loginWithEmail } from '$lib/remote/auth.remote';
</script>

<main class="flex min-h-screen items-center justify-center">
	<form {...loginWithEmail}>
		<fieldset class="flex flex-col gap-4" disabled={!!loginWithEmail.pending}>
			<label class="text-sm" for="email">
				Email
				<input
					class="block border p-1"
					placeholder="test@example.com"
					autocomplete="email"
					{...loginWithEmail.fields.email.as('email')}
				/>
			</label>
			<button type="submit" class="bg-primary">Submit</button>
		</fieldset>
	</form>
</main>
