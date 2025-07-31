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
      queryClient.setQueryData(["upvotes"], (old: Upvote[]) => [
        ...old,
        variables.data,
      ]);
      queryClient.setQueryData(["ideas"], (old: IdeaWithDetails[]) =>
        old.map((idea) =>
          idea.id === variables.data.ideaId
            ? { ...idea, upvoteCount: idea.upvoteCount + 1 }
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
