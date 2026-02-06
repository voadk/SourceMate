<script lang="ts">
	import { verifyOTPForm } from '$lib/remote/auth.remote';
</script>

<main class="flex min-h-screen items-center justify-center">
	<form {...verifyOTPForm}>
		<fieldset class="flex flex-col gap-4" disabled={!!verifyOTPForm.pending}>
			<label class="text-sm">
				One Time Password
				<input
					class="block border p-1"
					placeholder="000000"
					autocomplete="off"
					{...verifyOTPForm.fields.otp.as('number')}
				/>
			</label>
			<button type="submit" class="bg-primary">Submit</button>
		</fieldset>
	</form>
</main>
