import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq, and, sql, inArray } from "drizzle-orm";
import { idea, user, upvote, ideaTag, tag } from "~/db/schema";
import { database } from "~/db";
import { optionalAuthentication } from "~/utils/middleware";
import { IdeaCard } from "./-idea-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IdeaFormHooked } from "./-submit-idea-form";
import React from "react";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

export const fetchIdeasFn = createServerFn()
  .middleware([optionalAuthentication])
  .handler(async ({ context }) => {
    const currentUserId = context?.userId;
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

  const [open, setOpen] = React.useState(false);

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-12">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Video Suggestions</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="h-4 w-4" /> Submit Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a new idea</DialogTitle>
              </DialogHeader>
              <IdeaFormHooked onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
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
          <div className="grid gap-4 mb-8">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
