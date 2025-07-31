import { useQuery } from "@tanstack/react-query";
import { getUpvotesFn } from "../-fn/getUpvotesFn";

export function useGetUpvotes() {
  return useQuery({
    queryKey: ["upvotes"],
    queryFn: () => getUpvotesFn(),
  });
}
