import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { database } from "~/db";
import { idea } from "~/db/schema";
import { isUserAdmin } from "~/utils/isUserAdmin";
import { isAuthenticated } from "~/utils/middleware";

export const deleteIdeaFn = createServerFn()
  .validator(z.object({ id: z.string() }))
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    const isAdmin = await isUserAdmin();

    const found = await database
      .select({ userId: idea.userId })
      .from(idea)
      .where(eq(idea.id, data.id));

    if (!found.length) {
      throw new Error("Idea not found");
    }

    if (!isAdmin && found[0].userId !== context.userId) {
      throw new Error("Unauthorized");
    }

    await database.delete(idea).where(eq(idea.id, data.id));
    return { id: data.id };
  });
