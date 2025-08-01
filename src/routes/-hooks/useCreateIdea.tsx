import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdeaFn } from "../-fn/createIdeaFn";
import { IdeaWithDetails } from "../-fn/getIdeaFn";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";
import { useSession } from "~/lib/sessionContext";

export function useCreateIdea({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { sessionId } = useSession();

  return useMutation({
    mutationFn: (variables: Parameters<typeof createIdeaFn>[0]) => 
      createIdeaFn({ 
        ...variables, 
        data: { ...variables.data, sessionId } 
      }),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["ideas"] });

      // Snapshot the previous value for fresh ideas
      const previousFreshIdeas = queryClient.getQueryData<IdeaWithDetails[]>([
        "ideas", false
      ]);

      // Create optimistic idea
      const optimisticIdea: IdeaWithDetails = {
        id: crypto.randomUUID(),
        title: variables.data.title,
        description: variables.data.description || "",
        published: false,
        youtubeUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: session?.user?.id || "",
        userImage: session?.user?.image || null,
        userName: session?.user?.name || null,
        upvoteId: null,
        upvoteCount: 0,
        tags: [],
      };

      // Optimistically update fresh ideas list
      queryClient.setQueryData<IdeaWithDetails[]>(["ideas", false], (old) => {
        if (!old) return [optimisticIdea];
        return [optimisticIdea, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousFreshIdeas, optimisticIdea };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFreshIdeas) {
        queryClient.setQueryData(["ideas", false], context.previousFreshIdeas);
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
