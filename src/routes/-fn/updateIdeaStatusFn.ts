import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { idea } from "~/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "~/utils/middleware";
import z from "zod";

const updateIdeaStatusSchema = z.object({
  ideaId: z.string(),
  published: z.boolean(),
  youtubeUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

export const updateIdeaStatusFn = createServerFn()
  .validator(updateIdeaStatusSchema)
  .middleware([isAdmin])
  .handler(async ({ data }) => {
    const updateData: any = {
      published: data.published,
      updatedAt: new Date()
    };

    if (data.youtubeUrl !== undefined) {
      updateData.youtubeUrl = data.youtubeUrl === "" ? null : data.youtubeUrl;
    }

    await database
      .update(idea)
      .set(updateData)
      .where(eq(idea.id, data.ideaId));

    return { success: true };
  });