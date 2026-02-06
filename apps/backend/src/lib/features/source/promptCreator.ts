import { extractMetaTags } from "./metaScraper";

export async function createPrompt(url: URL) {
  const { data } = await extractMetaTags(url) || {};
  if (!data) return null;
  return filterObj(removeDuplicateProp(flattenObj(data)));
}

const flattenObj = (ob: { [key: string]: unknown }) => {
  const result: { [key: string]: string } = {};
  for (const i in ob) {
    if (Array.isArray(ob[i])) {
      ob[i] = Object.assign({}, ob[i]);
    }
    if (typeof ob[i] === "object") {
      if (!ob[i]) continue;
      const temp = flattenObj(ob[i] as { [key: string]: unknown });
      for (const j in temp) {
        result[`${i}.${j}`] = temp[j];
      }
    } else {
      if (!ob[i]) continue;
      result[i] = ob[i].toString();
    }
  }
  return result;
};

function filterObj(obj: { [key: string]: string }) {
  const result: { [key: string]: string } = {};
  for (const key in obj) {
    const LCkey = key.toLowerCase().trim();
    if (key === "bodyText") {
      result[key] = obj[key].slice(0, 1000);
      continue;
    }
    if (key === "title") {
      result[key] = obj[key].slice(0, 250);
      continue;
    }

    if (!obj[key]) continue;
    if (obj[key].match(/(https|http)?:\/\/\S+/)) continue;
    if ((Number(obj[key]))) continue;

    if (LCkey === "robots") continue;
    if (LCkey === "viewport") continue;
    if (LCkey === "twitter:card") continue;
    if (LCkey === "theme-color") continue;
    if (LCkey === "color-scheme") continue;
    if (LCkey === "generator") continue;
    if (LCkey === "referrer") continue;
    if (LCkey === "handheldfriendly") continue;
    if (LCkey.includes("type")) continue;
    if (LCkey.includes("image")) continue;
    if (LCkey.includes("app")) continue;
    if (LCkey.includes("copyright")) continue;
    if (LCkey.includes("keyword")) continue;
    if (LCkey.includes("format")) continue;
    if (LCkey.includes("google")) continue;
    if (LCkey.includes("language")) continue;
    if (LCkey.includes("locale")) continue;
    if (LCkey.includes("query-input")) continue;
    if (LCkey.includes("foundingdate")) continue;
    if (LCkey.includes(".ispartof.")) continue;
    if (LCkey.includes("isaccessibleforfree")) continue;
    result[key] = obj[key].slice(0, 100);
  }
  return result;
}

function removeDuplicateProp(obj: { [key: string]: string }) {
  const temp: { [key: string]: string } = {};
  for (const key in obj) {
    temp[obj[key].toLowerCase().replace(/[^a-z\d]/g, "")] ??= key;
  }
  const result: { [key: string]: string } = {};
  for (const key in temp) {
    if (key) {
      result[temp[key]] = obj[temp[key]];
    }
  }
  return result;
}