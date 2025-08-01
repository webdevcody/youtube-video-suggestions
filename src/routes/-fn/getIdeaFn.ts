import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { sql } from "drizzle-orm";
import { optionalAuthentication } from "~/utils/middleware";
import z from "zod";
import { Idea } from "~/db/schema";

export type IdeaWithDetails = Idea & {
  upvoteId: string | null;
  upvoteCount: number;
  userName: string | null;
  userImage: string | null;
  tags: Array<{ id: string; name: string }> | null;
};

const getIdeaSchema = z.object({
  ideaId: z.string(),
});

export const getIdeaFn = createServerFn()
  .validator(getIdeaSchema)
  .middleware([optionalAuthentication])
  .handler(async ({ data, context }): Promise<IdeaWithDetails | null> => {
    const currentUserId = context?.userId;

    const ideas = await database.execute(sql`
      WITH idea_upvote_counts AS (
        SELECT 
          idea_id,
          COUNT(*) as upvote_count
        FROM upvote 
        WHERE idea_id = ${data.ideaId}
        GROUP BY idea_id
      ),
      user_upvotes AS (
        SELECT 
          idea_id,
          id as upvote_id
        FROM upvote 
        WHERE user_id = ${currentUserId ?? ""} AND idea_id = ${data.ideaId}
      ),
      idea_tags_agg AS (
        SELECT 
          it.idea_id,
          array_agg(
            DISTINCT jsonb_build_object(
              'id', t.id, 
              'name', t.name
            )
          ) as tags
        FROM idea_tag it
        LEFT JOIN tag t ON it.tag_id = t.id
        WHERE it.idea_id = ${data.ideaId}
        GROUP BY it.idea_id
      )
      SELECT 
        i.id,
        i.title,
        i.description,
        i.published,
        i.youtube_url as "youtubeUrl",
        i.created_at as "createdAt",
        i.updated_at as "updatedAt",
        i.user_id as "userId",
        u.image as "userImage",
        u.name as "userName",
        uu.upvote_id as "upvoteId",
        COALESCE(iuc.upvote_count, 0) as "upvoteCount",
        COALESCE(ita.tags, '{}'::jsonb[]) as tags
      FROM idea i
      LEFT JOIN "user" u ON i.user_id = u.id
      LEFT JOIN idea_upvote_counts iuc ON i.id = iuc.idea_id
      LEFT JOIN user_upvotes uu ON i.id = uu.idea_id
      LEFT JOIN idea_tags_agg ita ON i.id = ita.idea_id
      WHERE i.id = ${data.ideaId}
    `);

    const idea = ideas.rows[0] as IdeaWithDetails | undefined;

    if (!idea) {
      return null;
    }

    idea.createdAt = idea.createdAt ? new Date(idea.createdAt) : null;
    idea.updatedAt = idea.updatedAt ? new Date(idea.updatedAt) : null;

    return idea;
  });
