<script lang="ts">
  import { goto } from "$app/navigation";
  import { BACKEND_URL } from "$lib/constants.js";
  import { SOURCE_SCHEMA } from "$lib/scripts/sourceSchema";
  import type { Source } from "$lib/scripts/sourceSchema";
  import { splitWindowWithUrl } from "$lib/scripts/tauri.js";
  import { copyBibtexToClipboard, writeToWord } from "$lib/scripts/utils";
  import { error } from "@sveltejs/kit";
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  // import BackButton from "$lib/components/BackButton.svelte";

  const { data } = $props();
  const { sourceUrl } = data;
  let source: any = $state(null);
  const newAuthorEntry: Source["source"]["authorObject"]["people"][0] = $state({
    firstName: "",
    middleName: "",
    lastName: "",
  });
  let outputFormat = $state("word");

  async function sourceData() {
    console.log("[+page.svelte] sourceData called with URL:", sourceUrl.href);
    return await fetch(`${BACKEND_URL}/api/source?url=${sourceUrl.href}`, {
      headers: {
        // Authorization: session?.access_token || '',
      },
    })
      .then((res) => {
        console.log(
          "[+page.svelte] Fetch response status:",
          res.status,
          res.ok
        );
        if (res.ok) return res.json();
        console.error("Fetching error", res);
        error(503, {
          message: "Failed to fetch source data",
        });
      })
      .then((data) => {
        console.log("[+page.svelte] Received data:", data);
        const parsed = SOURCE_SCHEMA.parse(data);
        console.log("[+page.svelte] Parsed source data:", parsed);
        return parsed;
      });
  }

  sourceData()
    .then((data) => {
      console.log("[+page.svelte] Setting source state:", data.source);
      source = data.source;
    })
    .catch((error) => {
      console.error("[+page.svelte] Error fetching source data:", error);
      source = {
        title: "",
        authorObject: { people: [], corporate: "" },
        date: "",
      };
    });

  $effect(() => {
    console.log("[+page.svelte] Effect triggered - calling splitWindowWithUrl");
    splitWindowWithUrl(sourceUrl.href);
  });
  onMount(() => {
    return () => {
      invoke("close_external_webview");
    };
  });
  function addNewAuthorIfNeeded() {
    if (
      newAuthorEntry.firstName ||
      newAuthorEntry.middleName ||
      newAuthorEntry.lastName
    ) {
      source?.authorObject.people.push({ ...newAuthorEntry });
      newAuthorEntry.firstName = "";
      newAuthorEntry.middleName = "";
      newAuthorEntry.lastName = "";
    }
  }
</script>

<!-- <BackButton /> -->
<a class="btn btn-circle absolute m-2" href="/">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12" />
  </svg>

</a>


<!-- grid-cols-2 -->
<div class="grid grid-cols-2 min-h-screen">
  <div class="flex justify-center items-center w-full">
    {#if !source}
      <span class="loading loading-spinner mr-4 bg-primary"></span>
      <p>Loading...</p>
    {:else}
      <div class="form-control lg:max-w-[30rem] max-w-64">
        <div>
          <label for="title" class="label">Title</label>
          <input
            class="input input-bordered w-full"
            name="Title"
            type="text"
            id="title"
            bind:value={source.title}
          />
          <label for="">Authors</label>
          <div class="flex gap-2">
            <label class="w-full text-opacity-40 text-sm" for=""
              >First Name</label
            >
            <label class="w-full text-opacity-40 text-sm" for=""
              >Middle Name</label
            >
            <label class="w-full text-opacity-40 text-sm" for=""
              >Last Name</label
            >
          </div>
          <div class="flex flex-col gap-2">
            {#each source.authorObject.people as author}
              <div class="flex gap-2">
                <input
                  class="input input-bordered w-full line-clamp-1"
                  type="text"
                  autocomplete="off"
                  autofill="off"
                  bind:value={author.firstName}
                />
                <input
                  class="input input-bordered w-full line-clamp-1"
                  type="text"
                  autocomplete="off"
                  autofill="off"
                  bind:value={author.middleName}
                />
                <input
                  class="input input-bordered w-full line-clamp-1"
                  type="text"
                  autocomplete="off"
                  autofill="off"
                  bind:value={author.lastName}
                />
              </div>
            {/each}
            <div class="flex gap-2" >
              <input
                class="input input-bordered w-full line-clamp-1"
                type="text"
                autocomplete="off"
                autofill="off"
                bind:value={newAuthorEntry.firstName}
              />
              <input
                class="input input-bordered w-full line-clamp-1"
                type="text"
                autocomplete="off"
                autofill="off"
                bind:value={newAuthorEntry.middleName}
              />
              <input
                class="input input-bordered w-full line-clamp-1"
                type="text"
                autocomplete="off"
                autofill="off"
                bind:value={newAuthorEntry.lastName}
              />
              <button class="btn btn-primary" class:hidden={!(newAuthorEntry.firstName || newAuthorEntry.middleName || newAuthorEntry.lastName)} onclick={addNewAuthorIfNeeded}>+</button>
            </div>
          </div>
          <label class="" for="">Corporate Author</label>
          <input
            class="input input-bordered w-full"
            name="Corporate Author"
            type="text"
            bind:value={source.authorObject.corporate}
          />
          <label class="" for="">Date</label>
          <input
            class="input input-bordered w-full"
            name="Date"
            type="date"
            bind:value={source.date}
          />
          <label class="" for="">Url</label>
          <input
            class="input input-bordered w-full"
            name="Url"
            type="text"
            bind:value={sourceUrl.href}
          />
          <label class="" for="">Sitename</label>
          <input
            class="input input-bordered w-full"
            name="Website"
            type="text"
            disabled={true}
            value={sourceUrl.hostname}
          />
          <label class="" for="">Current Date</label>
          <input
            class="input input-bordered w-full"
            name="Date added"
            type="date"
            disabled={true}
            value={new Date().toISOString().substring(0, 10)}
          />
        </div>
        <div class="flex justify-between items-center mt-8">
          <select bind:value={outputFormat} class="  select select-bordered">
            <option value="word">Word</option>
            <option value="bibtex">Bibtex</option>
          </select>
          <input
            type="button"
            value={outputFormat === "word"
              ? "Add to Word"
              : "Copy Bibtex to Clipboard"}
            class="btn btn-primary"
            onclick={() => {
              if (!source) return;
              if (outputFormat === "word") {
                writeToWord(source, sourceUrl);
                goto(
                  localStorage.getItem("hideWordGuide") ? "/" : "/docs/word"
                );
              } else if (outputFormat === "bibtex") {
                copyBibtexToClipboard(source, sourceUrl);
                goto("/");
              }
            }}
          />
        </div>
      </div>
    {/if}
  </div>
  <div class="bg-gray-200"></div>
</div>
