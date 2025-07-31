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
      queryClient.setQueryData(["upvotes"], (old: Upvote[]) =>
        old.filter((upvote) => upvote.ideaId !== variables.data.ideaId)
      );
      queryClient.setQueryData(["ideas"], (old: IdeaWithDetails[]) =>
        old.map((idea) =>
          idea.id === variables.data.ideaId
            ? { ...idea, upvoteCount: idea.upvoteCount - 1 }
            : idea
        )
      );
      return { previousUpvotes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
    },
  });
}
