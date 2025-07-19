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
import { Trash2 } from "lucide-react";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { upvoteIdeaFn } from "../-actions/upvoteIdeaFn";
import { removeUpvoteFn } from "../-actions/removeUpvoteFn";
import { deleteIdeaFn } from "../-actions/deleteIdeaFn";

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
  upvoteCount: number;
  tags: { id: string; name: string }[];
};

interface IdeaCardProps {
  idea: Idea;
  onTagClick: (tagName: string) => void;
  selectedTags: string[];
}

export function IdeaCard({ idea, onTagClick, selectedTags }: IdeaCardProps) {
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
              Delete {deleteTarget?.id}
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
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {idea.tags.map((tag: { id: string; name: string }) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onTagClick(tag.name)}
                      className={`inline-block px-2 py-0.5 rounded-full text-xs border transition-colors hover:scale-105 ${
                        isSelected
                          ? "bg-primary/20 text-primary border-primary/40 shadow-sm"
                          : "bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted-foreground/10 hover:border-muted-foreground/40"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentUserId ? (
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
                <span className="text-sm font-medium">{idea.upvoteCount}</span>
              </Button>
            ) : (
              <>
                <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">{idea.upvoteCount}</span>
              </>
            )}

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
