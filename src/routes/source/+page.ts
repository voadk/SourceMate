import { redirect } from "@sveltejs/kit";
import { SvelteURL } from "svelte/reactivity";
import type { PageLoad } from "./$types";

export const load = (async ({ url }) => {
  const sourceUrlString = url.searchParams.get("url");
  if (!sourceUrlString) {
    redirect(300, "/");
  }
  let sourceUrl: SvelteURL;
  try {
    sourceUrl = new SvelteURL(sourceUrlString);
  } catch (_) {
    redirect(300, "/");
  }

  return { sourceUrl };
}) satisfies PageLoad;
