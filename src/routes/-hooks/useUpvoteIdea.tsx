import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upvoteIdeaFn } from "../-fn/upvoteIdeaFn";
import { toast } from "sonner";
import { Upvote } from "~/db/schema";
import { IdeaWithDetails } from "../-fn/getIdeaFn";

export function useUpvoteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upvoteIdeaFn,
    onMutate: async (variables) => {
      toast.success("Upvoted!", {
        description: "You have upvoted this idea.",
      });
      await queryClient.cancelQueries({ queryKey: ["upvotes"] });
      const previousUpvotes = queryClient.getQueryData(["upvotes"]);
      const newUpvote = {
        id: crypto.randomUUID(),
        ideaId: variables.data.ideaId,
        userId: "", // This will be filled by the server
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      queryClient.setQueryData(["upvotes"], (old: Upvote[] = []) => [
        ...old,
        newUpvote,
      ]);
      
      // Optimistically update the idea in the ideas list (unpublished)
      queryClient.setQueryData(["ideas", false], (old: IdeaWithDetails[] | undefined) => {
        if (!old) return old;
        return old.map((idea) =>
          idea.id === variables.data.ideaId
            ? { ...idea, upvoteCount: idea.upvoteCount + 1, upvoteId: newUpvote.id }
            : idea
        );
      });
      
      // Optimistically update the idea in the ideas list (published)
      queryClient.setQueryData(["ideas", true], (old: IdeaWithDetails[] | undefined) => {
        if (!old) return old;
        return old.map((idea) =>
          idea.id === variables.data.ideaId
            ? { ...idea, upvoteCount: idea.upvoteCount + 1, upvoteId: newUpvote.id }
            : idea
        );
      });
      
      // Update individual idea query
      queryClient.setQueryData(
        ["idea", variables.data.ideaId],
        (old: IdeaWithDetails | undefined) =>
          old ? { ...old, upvoteCount: old.upvoteCount + 1, upvoteId: newUpvote.id } : old
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
