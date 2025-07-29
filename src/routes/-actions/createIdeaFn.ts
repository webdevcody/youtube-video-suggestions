import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { database } from "~/db";
import { idea, tag, ideaTag } from "~/db/schema";
import { isAuthenticated } from "~/utils/middleware";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { config } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Filter } from "bad-words";
import { createIdeaSchema } from "~/lib/schemas";

const CONFIG_ID = "singleton";
const MAX_OPENAI_TAG_GENERATIONS = 1000;

export const createIdeaFn = createServerFn()
  .validator(createIdeaSchema)
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    // Initialize profanity filter
    const profanityFilter = new Filter();

    // Filter bad words from title and description
    const filteredTitle = profanityFilter.clean(data.title);
    const filteredDescription = data.description
      ? profanityFilter.clean(data.description)
      : null;

    const newIdea = {
      id: crypto.randomUUID(),
      userId: context.userId as string,
      title: filteredTitle,
      description: filteredDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await database.insert(idea).values(newIdea);

    let configRow = await database.query.config.findFirst({
      where: eq(config.id, CONFIG_ID),
    });
    let openaiTagGenerations = configRow
      ? parseInt(configRow.openaiTagGenerations, 10)
      : 0;
    let tags: string[] = [];
    let usedOpenAI = false;
    if (openaiTagGenerations < MAX_OPENAI_TAG_GENERATIONS) {
      try {
        const prompt = `Extract 3-7 short, relevant tags (single words or short phrases, no # or @) for the following idea. Return a JSON object with a 'tags' array.\n\nTitle: ${filteredTitle}\nDescription: ${filteredDescription ?? ""}`;
        const tagSchema = z.object({
          tags: z.array(z.string().min(1).max(32)).min(3).max(7),
        });
        type TagResult = { tags: string[] };
        const result = await generateObject<TagResult>({
          model: openai("gpt-4o-mini"),
          schema: tagSchema,
          prompt,
        });
        tags =
          result.object && Array.isArray(result.object.tags)
            ? result.object.tags.map((tag) => tag.trim().toLowerCase())
            : [];
        usedOpenAI = true;
      } catch (err) {
        tags = [];
      }
    }
    if (usedOpenAI) {
      if (configRow) {
        await database
          .update(config)
          .set({
            openaiTagGenerations: String(openaiTagGenerations + 1),
            updatedAt: new Date(),
          })
          .where(eq(config.id, CONFIG_ID));
      } else {
        await database.insert(config).values({
          id: CONFIG_ID,
          openaiTagGenerations: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (tags.length > 0) {
      const now = new Date();
      const tagRows = tags.map((tagName) => ({
        id: crypto.randomUUID(),
        name: tagName,
        createdAt: now,
        updatedAt: now,
      }));
      // Upsert all tags (ignore if exists)
      await database
        .insert(tag)
        .values(tagRows)
        .onConflictDoNothing({ target: tag.name });

      // Fetch all tag IDs for these names
      const dbTags = await database.query.tag.findMany({
        where: (t, { inArray }) => inArray(t.name, tags),
      });
      // Prepare ideaTag rows
      const ideaTagRows = dbTags.map((t) => ({
        id: crypto.randomUUID(),
        ideaId: newIdea.id,
        tagId: t.id,
        createdAt: now,
        updatedAt: now,
      }));
      // Upsert all ideaTag links (ignore if exists)
      if (ideaTagRows.length > 0) {
        await database
          .insert(ideaTag)
          .values(ideaTagRows)
          .onConflictDoNothing({ target: [ideaTag.ideaId, ideaTag.tagId] });
      }
    }

    return newIdea;
  });
