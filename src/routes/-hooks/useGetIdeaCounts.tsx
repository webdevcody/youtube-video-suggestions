import { useQuery } from "@tanstack/react-query";
import { getIdeasFn } from "../-fn/getIdeasFn";

export function useGetIdeaCounts() {
  const { data: freshIdeas } = useQuery({
    queryKey: ["ideas", false],
    queryFn: () => getIdeasFn({ data: { showPublished: false } }),
  });

  const { data: publishedIdeas } = useQuery({
    queryKey: ["ideas", true],
    queryFn: () => getIdeasFn({ data: { showPublished: true } }),
  });

  return {
    freshCount: freshIdeas?.length ?? 0,
    publishedCount: publishedIdeas?.length ?? 0,
  };
}