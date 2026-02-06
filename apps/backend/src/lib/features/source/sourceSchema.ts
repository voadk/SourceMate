import { z } from "zod";

export const SOURCE_SCHEMA = z.object({
	source: z.object({
		title: z.string().describe("The title or headline of the source without the author, sitename or category"),
		authorObject: z.object({
			people: z
				.array(
					z.object({
						firstName: z.string(),
						middleName: z.string(),
						lastName: z.string(),
					}),
				)
				.describe("The author of the source"),
			corporate: z
				.string()
				.describe("The organization that authored the source or the name of the organization that published the source."),
		}),
		date: z.string().describe("The date the source was published or last modified in format YYYY-MM-DD. leave empty string if unknown"),
	}),
});
