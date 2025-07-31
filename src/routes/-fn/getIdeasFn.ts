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
