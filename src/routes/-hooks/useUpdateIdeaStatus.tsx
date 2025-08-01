import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdeaStatusFn } from "../-fn/updateIdeaStatusFn";

export function useUpdateIdeaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIdeaStatusFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}