import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { database } from "~/db";
import { idea, tag, ideaTag } from "~/db/schema";
import { isAuthenticated } from "~/utils/middleware";
import { config } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Filter } from "bad-words";
import { createIdeaSchema } from "~/lib/schemas";
import { serverEvents } from "~/lib/eventEmitter";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const CONFIG_ID = "singleton";
const MAX_OPENAI_TAG_GENERATIONS = 1000;

// Background function to generate and assign tags using OpenAI
async function generateTagsInBackground(
  ideaId: string,
  userId: string,
  title: string,
  description: string | null
) {
  try {
    // Check OpenAI usage limits
    let configRow = await database.query.config.findFirst({
      where: eq(config.id, CONFIG_ID),
    });
    let openaiTagGenerations = configRow
      ? parseInt(configRow.openaiTagGenerations, 10)
      : 0;

    if (openaiTagGenerations >= MAX_OPENAI_TAG_GENERATIONS) {
      console.log(
        `OpenAI tag generation limit reached: ${openaiTagGenerations}/${MAX_OPENAI_TAG_GENERATIONS}`
      );
      return;
    }

    let tags: string[] = [];
    let usedOpenAI = false;

    try {
      const tagSchema = z.object({
        tags: z.array(z.string().min(1).max(32)),
      });

      const completion = await openai.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Extract the tags for the idea." },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description ?? ""}`,
          },
        ],
        response_format: zodResponseFormat(tagSchema, "tags"),
      });

      tags = completion.choices[0].message.parsed?.tags ?? [];

      usedOpenAI = true;
    } catch (err) {
      console.error("Error generating tags with OpenAI:", err);
      tags = [];
    }

    // Update config table to track usage
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

    // Insert tags and link them to the idea
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
        ideaId: ideaId,
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

      // Emit event to notify the UI that tags are ready
      serverEvents.emit("tags-generated", {
        type: "tags-generated",
        ideaId,
        userId,
        tags: dbTags.map((tag) => ({ id: tag.id, name: tag.name })),
      });

      console.log(
        `Generated and assigned ${tags.length} tags for idea ${ideaId}:`,
        tags
      );
    }
  } catch (error) {
    console.error("Error in background tag generation:", error);
  }
}

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

    // Generate tags in the background without waiting
    generateTagsInBackground(
      newIdea.id,
      context.userId as string,
      filteredTitle,
      filteredDescription
    ).catch((error) =>
      console.error("Background tag generation failed:", error)
    );

    return newIdea;
  });
