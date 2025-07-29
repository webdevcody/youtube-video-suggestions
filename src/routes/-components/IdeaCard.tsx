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
import { IdeaTag } from "./IdeaTag";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
  const isAdmin = session?.user?.email === "webdevcody@gmail.com";

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Idea
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteIdea({ data: { id: deleteTarget.id } });
                setDeleteTarget(null);
              }}
              className="flex-1"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="relative modern-card group">
        {/* Absolutely positioned action buttons in top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {currentUserId ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label={idea.upvoteId ? "Remove upvote" : "Upvote"}
              onClick={() => {
                if (!currentUserId) return;
                if (idea.upvoteId) {
                  removeUpvote({ data: { ideaId: idea.id } });
                } else {
                  upvoteIdea({ data: { ideaId: idea.id } });
                }
              }}
              className="hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-200"
            >
              <ThumbsUp
                fill={idea.upvoteId ? "currentColor" : "none"}
                className={`w-5 h-5 ${idea.upvoteId ? "text-blue-500" : "text-muted-foreground"}`}
              />
              <span className="text-sm font-medium ml-1">
                {idea.upvoteCount}
              </span>
            </Button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted/50">
              <ThumbsUp className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">{idea.upvoteCount}</span>
            </div>
          )}

          {(idea.userId === currentUserId || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete idea"
              onClick={() =>
                setDeleteTarget({ id: idea.id, title: idea.title })
              }
              className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="pr-24">
          <div className="font-bold leading-tight tracking-tight mb-4 text-2xl gradient-text group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
            {idea.title}
          </div>
          {idea.description && (
            <div className="text-muted-foreground mb-6 leading-relaxed">
              {idea.description}
            </div>
          )}
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {idea.tags.map((tag: { id: string; name: string }) => (
                <IdeaTag
                  key={tag.id}
                  name={tag.name}
                  isSelected={selectedTags.includes(tag.name)}
                  onClick={onTagClick}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Avatar className="size-8 ring-2 ring-border">
            <AvatarImage src={idea?.userImage ?? undefined} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
              {idea?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="text-sm font-medium text-foreground">
              {idea?.userName || "Anonymous"}
            </div>
            <div className="text-xs text-muted-foreground">
              {idea.createdAt
                ? new Date(idea.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown date"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
