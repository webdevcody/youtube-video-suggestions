import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq, and, sql } from "drizzle-orm";
import { idea, user, upvote } from "~/db/schema";
import { database } from "~/db";
import { isAuthenticated, optionalAuthentication } from "~/utils/middleware";
import { SubmitIdeaForm } from "./-submit-idea-form";
import { IdeaCard } from "./-idea-card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: Home,
});

export const fetchIdeasFn = createServerFn()
  .middleware([optionalAuthentication])
  .handler(async ({ context }) => {
    const currentUserId = context?.userId;
    // TODO: verify this query is performant and correct
    return await database
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
      })
      .from(idea)
      .leftJoin(user, eq(idea.userId, user.id))
      .leftJoin(
        upvote,
        and(eq(upvote.ideaId, idea.id), eq(upvote.userId, currentUserId ?? ""))
      )
      .orderBy(
        sql`(SELECT count(*) FROM upvote WHERE upvote.idea_id = ${idea.id}) DESC`
      );
  });

function IdeasSkeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg bg-card">
          <div className="flex flex-row items-center justify-between p-4 border-b">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-5 w-5 ml-2" />
          </div>
          <div className="p-4 flex gap-2 items-center">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Home() {
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeasFn,
  });

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-12">
      <div>
        <h3 className="text-2xl font-bold mb-4">Ideas</h3>
        {isLoading && <IdeasSkeleton />}
        {!ideas || ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">No ideas yet</h4>
              <p className="text-muted-foreground mb-4">
                Create or upload your first idea suggestion below!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>

      <hr />

      <SubmitIdeaForm />
    </div>
  );
}
