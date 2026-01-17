<script lang="ts">
  import { splitWindowWithUrl } from '$lib/scripts/tauri';

  let { url, buttonText = 'View Side-by-Side', class: className = 'btn btn-secondary' }: { 
    url: string; 
    buttonText?: string; 
    class?: string;
  } = $props();

  let error: string | null = $state(null);
  let isLoading = $state(false);
  let isSplit = $state(false);

  async function handleSplit() {
    if (isSplit) return;
    
    isLoading = true;
    error = null;

    try {
      await splitWindowWithUrl(url);
      isSplit = true;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error('Failed to split window:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex flex-col items-end gap-2">
  <button 
    class={className}
    onclick={handleSplit}
    disabled={isLoading || isSplit}
  >
    {#if isLoading}
      <span class="loading loading-spinner loading-sm"></span>
      Splitting...
    {:else if isSplit}
      ✓ Split View Active
    {:else}
      {buttonText}
    {/if}
  </button>

  {#if error}
    <div class="alert alert-error alert-sm max-w-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm">{error}</span>
    </div>
  {/if}
</div>
