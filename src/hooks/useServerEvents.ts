import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "~/lib/auth-client";
import { getIdeaFn } from "~/routes/-fn/getIdeaFn";

export function useServerEvents() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("Connecting to SSE for user:", session.user.id);

    const eventSource = new EventSource(
      `/api/events/$?userId=${session.user.id}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received SSE event:", data);

        if (data.type === "tags-generated") {
          console.log(`Tags generated for idea ${data.ideaId}:`, data.tags);

          queryClient.invalidateQueries({ queryKey: ["tags"] });

          queryClient.fetchQuery({
            queryKey: ["idea", data.ideaId],
            queryFn: () => getIdeaFn({ data: { ideaId: data.ideaId } }),
          });
        } else if (data.type === "connected") {
          console.log("SSE connected successfully");
        } else if (data.type === "ping") {
          // Keep-alive ping, no action needed
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [session?.user?.id, queryClient]);
}
