import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTagsFn } from "../-fn/deleteTagsFn";
import { toast } from "sonner";

export function useDeleteTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagsFn,
    onSuccess: (data) => {
      // Invalidate and refetch tags
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // Also invalidate ideas since they contain tag information
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      
      toast.success(`Successfully deleted ${data.count} tag${data.count > 1 ? 's' : ''}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tags");
    },
  });
}