import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIdeaFn, IdeaWithDetails } from "../-fn/getIdeaFn";

export function useIdea({ ideaData }: { ideaData: IdeaWithDetails }) {
  return useQuery({
    queryKey: ["idea", ideaData.id],
    queryFn: () => getIdeaFn({ data: { ideaId: ideaData.id } }),
    enabled: false,
  });
}
