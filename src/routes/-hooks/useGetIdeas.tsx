import { useQuery } from "@tanstack/react-query";
import { getIdeasFn } from "../-fn/getIdeasFn";

export function useGetIdeas(showPublished: boolean = false) {
  return useQuery({
    queryKey: ["ideas", showPublished],
    queryFn: () => getIdeasFn({ data: { showPublished } }),
  });
}
