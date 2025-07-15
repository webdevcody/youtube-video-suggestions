import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { database } from "~/db";
import { idea } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { isAuthenticated } from "~/utils/middleware";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  userImage: string | null;
  userName: string | null;
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

export function IdeaCard({ idea }: { idea: Idea }) {
  const queryClient = useQueryClient();

  const { mutate: deleteIdea } = useMutation({
    mutationFn: deleteIdeaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
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
      <Card key={idea.id}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{idea.title}</CardTitle>
            {idea.description && (
              <CardDescription>{idea.description}</CardDescription>
            )}
          </div>
          {idea.userId === currentUserId && (
            <button
              className="ml-2 text-muted-foreground hover:text-destructive"
              aria-label="Delete idea"
              onClick={() =>
                setDeleteTarget({ id: idea.id, title: idea.title })
              }
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
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
        </CardContent>
      </Card>
    </>
  );
}
