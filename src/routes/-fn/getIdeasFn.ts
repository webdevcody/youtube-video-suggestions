import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { optionalAuthentication } from "~/utils/middleware";
import { IdeaWithDetails } from "./getIdeaFn";

export const getIdeasFn = createServerFn()
  .middleware([optionalAuthentication])
  .handler(async ({ context }) => {
    const ideas = await database.query.idea.findMany({
      with: {
        upvotes: true,
        ideaTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    function toIdeaWithDetails(ideas: any[]): IdeaWithDetails[] {
      return ideas.map((idea) => {
        const { upvotes, ideaTags, ...rest } = idea;
        return {
          ...rest,
          upvoteCount: upvotes.length,
          tags: ideaTags.map((tag: any) => tag.tag),
        };
      });
    }

    return toIdeaWithDetails(ideas);
  });
