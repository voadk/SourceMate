import { DOMParser, type Element, type HTMLDocument} from "@b-fuze/deno-dom";

const parser = new DOMParser();

async function fetchWebsite(url: URL) {
  try {
    const response = await fetch(url);
    const docText = await response.text();
    return {
      docText,
      response: {
        ok: response.ok,
        headers: response.headers,
        status: response.status,
        redirected: response.redirected,
        statusText: response.statusText,
        type: response.type,
        url: response.url,
      },
    };
  } catch (error) {
    console.error("Error fetching website:", error);
    return null;
  }
}
function extractText(docText: string) {
  const doc = parser.parseFromString(docText, "text/html");
  if (!doc) return "";
  for(const scriptNode of doc.querySelectorAll("script")) {
    if (!scriptNode.parentNode) continue;
    scriptNode.parentNode.removeChild(scriptNode);
  }

  return doc.querySelector("body")?.innerText.replace(/\s+/g, " ").replace(/[^ÆØÅæøåa-zA-Z\d\s]/g, "").trim();
}
export async function extractMetaTags(url: URL) {
  try {
    const result: { [key: string]: unknown } = {};

    const { docText, response } = await fetchWebsite(url) || { docText: "", response: {} };

    const doc = parser.parseFromString(docText, "text/html");
    if (!doc) throw new Error("Failed to parse document");

    result.bodyText = extractText(docText);

    result.title = doc.querySelector("title")?.textContent;
    result.datetime = doc.querySelector("time[datetime]")?.getAttribute("datetime");

    for (const metaTag of doc.querySelectorAll("meta")) {
      const name = (metaTag as Element).getAttribute("name") || (metaTag as Element).getAttribute("property");
      const content = (metaTag as Element).getAttribute("content");
      if (name && content) {
        result[name] = content;
      }
    }

    result["json+ld"] = extractJsonLD(doc);

    return { data: result, response, url: new URL(url) };
  } catch (error) {
    console.error("Error extracting meta tags:", error);
  }
}

function extractJsonLD(doc: HTMLDocument) {
  const jsonLD = doc.querySelectorAll("script[type='application/ld+json']");
  const result: { [key: string]: unknown }[] = [];

  for (const script of jsonLD) {
    try {
      const json = JSON.parse(script.textContent);
  
      result.push(json);
    } catch (error) {
      console.error("Error parsing JSON-LD:", error);
    }
  }
  return result;
}
