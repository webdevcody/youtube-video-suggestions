import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import z from "zod";
import { database } from "~/db";
import { upvote } from "~/db/schema";
import { isAuthenticated } from "~/utils/middleware";

export const removeUpvoteFn = createServerFn()
  .validator(z.object({ ideaId: z.string() }))
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    await database
      .delete(upvote)
      .where(
        and(eq(upvote.ideaId, data.ideaId), eq(upvote.userId, context.userId))
      );
    return { ideaId: data.ideaId };
  });
