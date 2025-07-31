import { useQuery } from "@tanstack/react-query";
import { getIdeasFn } from "../-fn/getIdeasFn";

export function useGetIdeas() {
  return useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeasFn,
  });
}
