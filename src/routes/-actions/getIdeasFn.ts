import { createServerFn } from "@tanstack/react-start";
import { eq, and, sql } from "drizzle-orm";
import { idea, user, upvote, ideaTag, tag } from "~/db/schema";
import { database } from "~/db";
import { optionalAuthentication } from "~/utils/middleware";

export const getIdeasFn = createServerFn()
  .middleware([optionalAuthentication])
  .handler(async ({ context }) => {
    const currentUserId = context?.userId;
    // TODO: make a whole dedicated video to analyze and talk about his query
    // Single query: fetch ideas, user info, upvote info, and tags (as array)
    const ideas = await database
      .select({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
        userId: idea.userId,
        userImage: user.image,
        userName: user.name,
        upvoteId: upvote.id,
        upvoteCount:
          sql`(SELECT count(*) FROM upvote WHERE upvote.idea_id = ${idea.id})`.mapWith(
            Number
          ),
        tags: sql`COALESCE(array_agg(DISTINCT jsonb_build_object('id', tag.id, 'name', tag.name)) FILTER (WHERE tag.id IS NOT NULL), '{}')`.mapWith(
          (v) => (typeof v === "string" ? JSON.parse(v) : v)
        ),
      })
      .from(idea)
      .leftJoin(user, eq(idea.userId, user.id))
      .leftJoin(
        upvote,
        and(eq(upvote.ideaId, idea.id), eq(upvote.userId, currentUserId ?? ""))
      )
      .leftJoin(ideaTag, eq(idea.id, ideaTag.ideaId))
      .leftJoin(tag, eq(ideaTag.tagId, tag.id))
      .groupBy(idea.id, user.id, upvote.id)
      .orderBy(
        sql`(SELECT count(*) FROM upvote WHERE upvote.idea_id = ${idea.id}) DESC`
      );
    return ideas;
  });
