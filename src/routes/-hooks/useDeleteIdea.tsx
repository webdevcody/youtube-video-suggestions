import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdeaFn } from "../-fn/deleteIdeaFn";
import { IdeaWithDetails } from "../-fn/getIdeaFn";
import { toast } from "sonner";

export function useDeleteIdea({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdeaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onMutate: async (variables) => {
      toast.success("Idea deleted!", {
        description: "Your idea has been deleted successfully.",
      });
      onSuccess?.();

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["ideas"] });

      // Snapshot the previous value
      const previousIdeas = queryClient.getQueryData<IdeaWithDetails[]>([
        "ideas",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<IdeaWithDetails[]>(["ideas"], (old) => {
        if (!old) return [];
        return old.filter((idea) => idea.id !== variables.data.id);
      });

      // Return a context object with the snapshotted value
      return { previousIdeas };
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
  });
}
