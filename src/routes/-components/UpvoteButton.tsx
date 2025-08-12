import { ThumbsUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { IdeaWithDetails } from "../-fn/getIdeaFn";
import { useRemoveUpvoteIdea } from "../-hooks/useRemoveUpvoteIdea";
import { useUpvoteIdea } from "../-hooks/useUpvoteIdea";
import { useGetUpvotes } from "../-hooks/useGetUpvotes";
import { memo, useCallback, useMemo } from "react";

function UpvoteButtonComponent({
  ideaData,
  currentUserId,
}: {
  ideaData: IdeaWithDetails;
  currentUserId: string | undefined;
}) {
  const { mutate: removeUpvote } = useRemoveUpvoteIdea();
  const { mutate: upvoteIdea } = useUpvoteIdea();
  const { data: upvotes } = useGetUpvotes();

  // Memoize the upvote check to avoid recalculating on every render
  const isUpvoted = useMemo(() => {
    return upvotes?.some((upvote) => upvote.ideaId === ideaData.id) ?? false;
  }, [upvotes, ideaData.id]);

  // Memoize the click handler to prevent recreating function on every render
  const handleClick = useCallback(() => {
    if (!currentUserId) return;
    if (isUpvoted) {
      removeUpvote({ data: { ideaId: ideaData.id } });
    } else {
      upvoteIdea({ data: { ideaId: ideaData.id } });
    }
  }, [currentUserId, isUpvoted, ideaData.id, removeUpvote, upvoteIdea]);

  return currentUserId ? (
    <Button
      variant="ghost"
      size="sm"
      aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
      onClick={handleClick}
      className="hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-200"
    >
      <ThumbsUp
        fill={isUpvoted ? "currentColor" : "none"}
        className={`w-5 h-5 ${isUpvoted ? "text-blue-500" : "text-muted-foreground"}`}
      />
      <span className="text-sm font-medium ml-1">{ideaData.upvoteCount}</span>
    </Button>
  ) : (
    <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted/50">
      <ThumbsUp className="w-5 h-5 text-muted-foreground" />
      <span className="text-sm font-medium">{ideaData.upvoteCount}</span>
    </div>
  );
}

// Memoize the UpvoteButton but allow re-renders when upvoteCount changes
export const UpvoteButton = memo(UpvoteButtonComponent);

UpvoteButton.displayName = "UpvoteButton";
