import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { ideaTag, tag } from "~/db/schema";
import { count, desc, eq } from "drizzle-orm";

export const getTagsFn = createServerFn().handler(async () => {
  const tags = await database
    .select({
      name: tag.name,
      count: count(ideaTag.ideaId),
    })
    .from(tag)
    .innerJoin(ideaTag, eq(tag.id, ideaTag.tagId))
    .orderBy(desc(count(ideaTag.ideaId)))
    .groupBy(tag.id);

  return tags;
});
