import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIdeaFn, IdeaWithDetails } from "../-fn/getIdeaFn";

export function useIdea({ ideaData }: { ideaData: IdeaWithDetails }) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["idea", ideaData.id],
    queryFn: () => getIdeaFn({ data: { ideaId: ideaData.id } }),
    initialData: ideaData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
