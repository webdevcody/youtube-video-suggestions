import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { eq } from "drizzle-orm";
import { optionalAuthentication } from "~/utils/middleware";
import z from "zod";
import { Upvote, upvote } from "~/db/schema";

export const getUpvotesFn = createServerFn()
  .middleware([optionalAuthentication])
  .handler(async ({ context }): Promise<Upvote[]> => {
    if (!context?.userId) {
      return [];
    }

    const upvotes = await database.query.upvote.findMany({
      where: eq(upvote.userId, context.userId),
    });

    return upvotes;
  });
