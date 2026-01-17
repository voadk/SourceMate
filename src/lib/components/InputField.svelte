<script lang="ts">
import type { HTMLInputTypeAttribute } from "svelte/elements";

let {
	name,
	type,
	value = "",
	disabled = false,
}: { name: string; type: HTMLInputTypeAttribute; value?: string; disabled?: boolean } = $props();
const id = $derived(() => name.toLowerCase().replaceAll(" ", "-"));
</script>

<div>
    <label for={id()} class="label">{name}</label>
    <input value={value} type={type} id={id()} name={id()} class={"input input-bordered lg:input-lg w-full "} disabled={disabled}>
</div>