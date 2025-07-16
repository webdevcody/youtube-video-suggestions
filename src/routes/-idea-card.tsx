import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { database } from "~/db";
import { idea } from "~/db/schema";
import { upvote } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { isAuthenticated } from "~/utils/middleware";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  userImage: string | null;
  userName: string | null;
  upvoteId: string | null;
  upvoteCount: number; // <-- add this
};

export const deleteIdeaFn = createServerFn()
  .validator(z.object({ id: z.string() }))
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    // Only allow deleting if the user owns the idea
    const found = await database
      .select({ userId: idea.userId })
      .from(idea)
      .where(eq(idea.id, data.id));
    if (!found.length || found[0].userId !== context.userId) {
      throw new Error("Unauthorized");
    }
    await database.delete(idea).where(eq(idea.id, data.id));
    return { id: data.id };
  });

export const upvoteIdeaFn = createServerFn()
  .validator(z.object({ ideaId: z.string() }))
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    // Only add if not already upvoted
    const found = await database
      .select({ id: upvote.id })
      .from(upvote)
      .where(
        and(eq(upvote.ideaId, data.ideaId), eq(upvote.userId, context.userId))
      );
    if (!found.length) {
      await database.insert(upvote).values({
        id: crypto.randomUUID(),
        ideaId: data.ideaId,
        userId: context.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return { ideaId: data.ideaId };
  });

export const removeUpvoteFn = createServerFn()
  .validator(z.object({ ideaId: z.string() }))
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    await database
      .delete(upvote)
      .where(
        and(eq(upvote.ideaId, data.ideaId), eq(upvote.userId, context.userId))
      );
    return { ideaId: data.ideaId };
  });

export function IdeaCard({ idea }: { idea: Idea }) {
  const queryClient = useQueryClient();

  const { mutate: deleteIdea } = useMutation({
    mutationFn: deleteIdeaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });

  const { mutate: upvoteIdea } = useMutation({
    mutationFn: upvoteIdeaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Upvoted!", {
        description: "You have upvoted this idea.",
      });
    },
  });

  const { mutate: removeUpvote } = useMutation({
    mutationFn: removeUpvoteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Removed upvote!", {
        description: "You have removed your upvote from this idea.",
      });
    },
  });

  // Get current user id from session
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Track which idea is being deleted and modal open state
  const [deleteTarget, setDeleteTarget] = useState<null | {
    id: string;
    title: string;
  }>(null);

  return (
    <>
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="bg-destructive text-white rounded px-4 py-2 font-semibold"
              onClick={() => {
                if (deleteTarget) deleteIdea({ data: { id: deleteTarget.id } });
                setDeleteTarget(null);
              }}
            >
              Delete
            </button>
            <DialogClose asChild>
              <button className="rounded px-4 py-2 font-semibold border">
                Cancel
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="border rounded-lg bg-card">
        <div className="flex flex-row items-center justify-between p-4 border-b">
          <div>
            <div className="font-semibold leading-none tracking-tight mb-2">
              {idea.title}
            </div>
            {idea.description && (
              <div className="text-sm text-muted-foreground">
                {idea.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              aria-label={idea.upvoteId ? "Remove upvote" : "Upvote"}
              onClick={() => {
                if (!currentUserId) return;
                if (idea.upvoteId) {
                  removeUpvote({ data: { ideaId: idea.id } });
                } else {
                  upvoteIdea({ data: { ideaId: idea.id } });
                }
              }}
            >
              <ThumbsUp
                fill={idea.upvoteId ? "currentColor" : "none"}
                className="w-5 h-5"
              />
            </Button>
            <span className="text-sm font-medium">{idea.upvoteCount}</span>
            {idea.userId === currentUserId && (
              <Button
                variant="ghost"
                aria-label="Delete idea"
                onClick={() =>
                  setDeleteTarget({ id: idea.id, title: idea.title })
                }
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-4 flex gap-2 items-center">
          <Avatar className="size-6">
            <AvatarImage src={idea?.userImage ?? undefined} />
            <AvatarFallback>{idea?.userName}</AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            Created:{" "}
            {idea.createdAt
              ? new Date(idea.createdAt).toLocaleString()
              : "Unknown"}
          </div>
        </div>
      </div>
    </>
  );
}
