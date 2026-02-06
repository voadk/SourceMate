import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import type { z } from "zod";
import { createPrompt } from "./promptCreator";
import { OPENROUTER_API_KEY } from "$env/static/private";
import { SOURCE_SCHEMA } from "./sourceSchema";

//https://www.nytimes.com/2023/09/08/us/politics/gop-migrants-blue-cities.html
//https://www.theguardian.com/environment/2023/sep/08/un-report-calls-for-phasing-out-of-fossil-fuels-as-paris-climate-goals-being-missed
//https://videnskab.dk/krop-sundhed/hvor-laenge-virker-koffein/

// different between gpt-4o-mini and gpt.4o
// "https://videnskab.dk/krop-sundhed/hvor-laenge-virker-koffein/"

type SourceInfo = z.infer<typeof SOURCE_SCHEMA>;

const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });

export async function getSourceInfo(url: URL): Promise<SourceInfo> {
	const prompt = `Find the information in this scrapped document:  ${JSON.stringify(
		await createPrompt(url),
	).slice(0, 5000)}`;

	const generateObjectArguments = {
		model: openrouter("openai/gpt-4o-mini"),
		schema: SOURCE_SCHEMA,
		prompt: prompt,
		maxTokens: 1000,
		temperature: 0,
		seed: 0,
		system:
			"You are a assistent helping to organize unformatted text from scraped web sources. Be very precise and dont include facts not precented in the scraped material.",
	};

	const generateObjectResult = await generateObject(generateObjectArguments);
	return generateObjectResult.object;
}
