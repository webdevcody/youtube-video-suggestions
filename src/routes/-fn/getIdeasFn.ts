import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { optionalAuthentication } from "~/utils/middleware";
import { IdeaWithDetails } from "./getIdeaFn";
import { eq } from "drizzle-orm";
import { idea } from "~/db/schema";
import z from "zod";

const getIdeasSchema = z.object({
  showPublished: z.boolean().optional().default(false),
});

export const getIdeasFn = createServerFn()
  .validator(getIdeasSchema)
  .middleware([optionalAuthentication])
  .handler(async ({ data, context }) => {
    const ideas = await database.query.idea.findMany({
      where: eq(idea.published, data.showPublished),
      with: {
        upvotes: true,
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        ideaTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    function toIdeaWithDetails(ideas: any[]): IdeaWithDetails[] {
      return ideas.map((idea) => {
        const { upvotes, ideaTags, user, ...rest } = idea;
        return {
          ...rest,
          upvoteCount: upvotes.length,
          tags: ideaTags.map((tag: any) => tag.tag),
          userImage: user.image,
          userName: user.name,
        };
      });
    }

    return toIdeaWithDetails(ideas);
  });
