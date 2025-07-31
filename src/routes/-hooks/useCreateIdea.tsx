import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdeaFn } from "../-fn/createIdeaFn";
import { IdeaWithDetails } from "../-fn/getIdeaFn";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";

export function useCreateIdea({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  return useMutation({
    mutationFn: createIdeaFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["ideas"] });

      // Snapshot the previous value
      const previousIdeas = queryClient.getQueryData<IdeaWithDetails[]>([
        "ideas",
      ]);

      // Create optimistic idea
      const optimisticIdea: IdeaWithDetails = {
        id: crypto.randomUUID(),
        title: variables.data.title,
        description: variables.data.description || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: session?.user?.id || "",
        userImage: session?.user?.image || null,
        userName: session?.user?.name || null,
        upvoteId: null,
        upvoteCount: 0,
        tags: [],
      };

      // Optimistically update to the new value
      queryClient.setQueryData<IdeaWithDetails[]>(["ideas"], (old) => {
        if (!old) return [optimisticIdea];
        return [optimisticIdea, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousIdeas, optimisticIdea };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIdeas) {
        queryClient.setQueryData(["ideas"], context.previousIdeas);
      }
      toast.error("Failed to create idea", {
        description: "Please try again.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
    onSuccess: (idea) => {
      toast.success("Idea created!", {
        description: "Your idea has been submitted successfully.",
      });
      onSuccess?.();
    },
  });
}
