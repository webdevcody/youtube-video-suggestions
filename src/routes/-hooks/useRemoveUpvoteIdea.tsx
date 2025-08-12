import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeUpvoteFn } from "../-fn/removeUpvoteFn";
import { Upvote } from "~/db/schema";
import { IdeaWithDetails } from "../-fn/getIdeaFn";

export function useRemoveUpvoteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUpvoteFn,
    onMutate: async (variables) => {
      toast.success("Upvote removed!", {
        description: "You have removed your upvote from this idea.",
      });
      await queryClient.cancelQueries({ queryKey: ["upvotes"] });
      const previousUpvotes = queryClient.getQueryData(["upvotes"]);
      queryClient.setQueryData(["upvotes"], (old: Upvote[] = []) =>
        old.filter((upvote) => upvote.ideaId !== variables.data.ideaId)
      );
      
      // Optimistically update the idea in the ideas list (unpublished)
      queryClient.setQueryData(["ideas", false], (old: IdeaWithDetails[] | undefined) => {
        if (!old) return old;
        return old.map((idea) =>
          idea.id === variables.data.ideaId
            ? { ...idea, upvoteCount: Math.max(0, idea.upvoteCount - 1), upvoteId: null }
            : idea
        );
      });
      
      // Optimistically update the idea in the ideas list (published)
      queryClient.setQueryData(["ideas", true], (old: IdeaWithDetails[] | undefined) => {
        if (!old) return old;
        return old.map((idea) =>
          idea.id === variables.data.ideaId
            ? { ...idea, upvoteCount: Math.max(0, idea.upvoteCount - 1), upvoteId: null }
            : idea
        );
      });
      
      // Update individual idea query
      queryClient.setQueryData(
        ["idea", variables.data.ideaId],
        (old: IdeaWithDetails | undefined) =>
          old ? { ...old, upvoteCount: Math.max(0, old.upvoteCount - 1), upvoteId: null } : old
      );
      
      return { previousUpvotes };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["idea", data.ideaId] });
    },
  });
}
