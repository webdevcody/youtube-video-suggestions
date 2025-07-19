import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import z from "zod";
import { database } from "~/db";
import { upvote } from "~/db/schema";
import { isAuthenticated } from "~/utils/middleware";

export const upvoteIdeaFn = createServerFn()
  .validator(z.object({ ideaId: z.string() }))
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    const found = await database
      .select({ id: upvote.id })
      .from(upvote)
      .where(
        and(eq(upvote.ideaId, data.ideaId), eq(upvote.userId, context.userId))
      );
    if (!found.length) {
      await database.insert(upvote).values({
        id: crypto.randomUUID(),
        ideaId: data.ideaId,
        userId: context.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return { ideaId: data.ideaId };
  });
