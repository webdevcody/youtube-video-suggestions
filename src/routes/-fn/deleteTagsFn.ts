import { createServerFn } from "@tanstack/react-start";
import { inArray } from "drizzle-orm";
import z from "zod";
import { database } from "~/db";
import { tag, ideaTag } from "~/db/schema";
import { isUserAdmin } from "~/utils/isUserAdmin";
import { isAuthenticated } from "~/utils/middleware";

export const deleteTagsFn = createServerFn()
  .validator(z.object({ tagNames: z.array(z.string()).min(1) }))
  .middleware([isAuthenticated])
  .handler(async ({ data }) => {
    const isAdmin = await isUserAdmin();
    
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get tag IDs from names
    const tagRecords = await database
      .select({ id: tag.id, name: tag.name })
      .from(tag)
      .where(inArray(tag.name, data.tagNames));

    if (tagRecords.length === 0) {
      throw new Error("No tags found to delete");
    }

    const tagIds = tagRecords.map(t => t.id);

    // Delete associated idea-tag relationships first (cascade should handle this, but being explicit)
    await database
      .delete(ideaTag)
      .where(inArray(ideaTag.tagId, tagIds));

    // Delete the tags
    await database
      .delete(tag)
      .where(inArray(tag.id, tagIds));

    return { 
      deletedTags: tagRecords.map(t => t.name),
      count: tagRecords.length 
    };
  });