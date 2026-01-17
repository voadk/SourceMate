import type { Source } from "$lib/scripts/sourceSchema";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
	ignoreAttributes: false,
});
const builder = new XMLBuilder({
	ignoreAttributes: false,
});

export async function writeToWord(source: Source["source"], sourceUrl: URL) {
	let json;
	try {
		json = parser.parse(await readTextFile("AppData\\Roaming\\Microsoft\\Bibliography\\Sources.xml", { baseDir: BaseDirectory.Home }));
	} catch (error) {
		json = {};
	}
	if (!json["b:Sources"]?.["b:Source"]) {
		console.log("No Bibliography found. Initializing with empty array");
		json = {
			"?xml": {
				"@_version": "1.0",
			},
			"b:Sources": {
				"b:Source": [],
				"@_SelectedStyle": "",
				"@_xmlns:b": "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
				"@_xmlns": "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
			},
		};
	}

	if (!Array.isArray(json?.["b:Sources"]?.["b:Source"])) {
		json["b:Sources"]["b:Source"] = [json["b:Sources"]["b:Source"]];
	}

	json?.["b:Sources"]?.["b:Source"].push(source2WordXml(source, sourceUrl));

	await writeTextFile("AppData\\Roaming\\Microsoft\\Bibliography\\Sources.xml", builder.build(json), { baseDir: BaseDirectory.Home });
}

export async function copyBibtexToClipboard(source: Source["source"], sourceUrl: URL) { 
	const bibtex = source2Bibtex(source, sourceUrl);
	await navigator.clipboard.writeText(bibtex);
}
function source2Bibtex(data: Source["source"], url: URL) {
  // Extract authors
  const authors = data.authorObject.people
    .map(person => {
      // Combine names, handling potential missing middle names
      const middleName = person.middleName ? ` ${person.middleName}` : '';
      return `${person.lastName}, ${person.firstName}${middleName}`;
    })
    .join(' and ');

  // Generate a unique citation key (you might want to customize this)
  const citationKey = `${data.authorObject.people[0]?.lastName || 'Unknown'}${new Date(data.date).getFullYear()}`;

  // Create BibTeX entry
  const bibtexEntry = `@misc{${citationKey},
  author = {${authors}},
  title = {${data.title}},
  url = {${url.href}},
  year = {${new Date(data.date).getFullYear()}},
  date = {${data.date}}${data.authorObject.corporate ? `,
  organization = {${data.authorObject.corporate}}` : ''}
}`;

  return bibtexEntry;
}


function source2WordXml(data: Source["source"], url: URL) {
	const guid = crypto.randomUUID().toUpperCase();
	const date = new Date();
	console.log(data.date);

	return {
		"b:Tag": guid,
		"b:SourceType": "DocumentFromInternetSite",
		"b:Guid": `{${guid}}`,
		"b:Author": {
			"b:Author": {
				...(data.authorObject.corporate && { "b:Corporate": data.authorObject.corporate }),
				...(data.authorObject.people && {
					"b:NameList": {
						"b:Person": data.authorObject.people.map((person) => ({
							"b:First": person.firstName,
							"b:Middle": person.middleName,
							"b:Last": person.lastName,
						})),
					},
				}),
			},
			// data.authorObject.people
			// 	? {
			// 			"b:NameList": {
			// 				"b:Person": data.authorObject.people.map((person) => ({
			// 					"b:First": person.firstName,
			// 					"b:Middle": person.middleName,
			// 					"b:Last": person.lastName,
			// 				})),
			// 			},
			// 		}
			// 	: data.authorObject.corporate
			// 		? { "b:Corporate": data.authorObject.corporate }
			// 		: {},
		},
		"b:Title": data.title,
		"b:InternetSiteTitle": url.hostname,
		"b:Year": data.date.slice(0, 4),
		"b:Month": data.date.slice(5, 7),
		"b:Day": data.date.slice(8, 10),
		"b:URL": url.href,
		"b:YearAccessed": date.getFullYear(),
		"b:MonthAccessed": date.getMonth() + 1,
		"b:DayAccessed": date.getDate(),
	};
}
