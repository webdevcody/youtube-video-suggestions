import { createServerFn } from "@tanstack/react-start";
import { eq, and, sql } from "drizzle-orm";
import { idea, user, upvote, ideaTag, tag } from "~/db/schema";
import { database } from "~/db";
import { optionalAuthentication } from "~/utils/middleware";

// Define the return type for the optimized query
type IdeaWithDetails = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userImage: string | null;
  userName: string | null;
  upvoteId: string | null;
  upvoteCount: number;
  tags: Array<{ id: string; name: string }>;
};

export const getIdeasFn = createServerFn()
  .middleware([optionalAuthentication])
  .handler(async ({ context }): Promise<IdeaWithDetails[]> => {
    const currentUserId = context?.userId;

    const ideas = await database.execute(sql`
      WITH idea_upvote_counts AS (
        SELECT 
          idea_id,
          COUNT(*) as upvote_count
        FROM upvote 
        GROUP BY idea_id
      ),
      user_upvotes AS (
        SELECT 
          idea_id,
          id as upvote_id
        FROM upvote 
        WHERE user_id = ${currentUserId ?? ""}
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
        GROUP BY it.idea_id
      )
      SELECT 
        i.id,
        i.title,
        i.description,
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
      ORDER BY COALESCE(iuc.upvote_count, 0) DESC
    `);

    return ideas.rows as IdeaWithDetails[];
  });
