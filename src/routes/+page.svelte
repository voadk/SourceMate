<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { onMount } from "svelte";

    let url = $state("");

    let { data: propData } = $props();

  
</script>

<div class="flex justify-center items-center min-h-screen">
    <div class="">
        <h1 class="font-extrabold text-4xl tracking-tight mb-4">
            Enter a url you want to add!
        </h1>
        <form class="grid grid-cols-3" method="get" action="/source">
            <input
                type="text"
                autocomplete="url"
                name="url"
                class="input input-bordered col-span-2"
                bind:value={url}
                placeholder="https://"
            />
            <button type="submit" class="btn ml-2">Crawl Source</button>
        </form>
    </div>
</div>

<a
    href="https://github.com/Asguho/SourceMate-App/issues/new/choose"
    target="_blank"
    class="btn btn-outline absolute bottom-4 right-4"
    >Report a Bug or Give Feedback!</a
>
