import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "~/lib/auth-client";
import { getIdeaFn } from "~/routes/-fn/getIdeaFn";

export function useServerEvents() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const retryCountRef = useRef(0);
  const shouldConnectRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    shouldConnectRef.current = true;
    retryCountRef.current = 0;

    const connectEventSource = () => {
      if (!shouldConnectRef.current) return;

      console.log("Connecting to SSE for user:", session.user.id);

      const eventSource = new EventSource(
        `/api/events/$?userId=${session.user.id}`
      );

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        // Reset retry count on successful connection
        retryCountRef.current = 0;
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
        eventSource.close();

        // Only retry if we should still be connecting and haven't exceeded max retries
        if (shouldConnectRef.current && retryCountRef.current < 5) {
          retryCountRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, retryCountRef.current - 1),
            30000
          ); // Cap at 30 seconds

          console.log(
            `SSE reconnection attempt ${retryCountRef.current}/5 in ${delay}ms`
          );

          timeoutRef.current = setTimeout(() => {
            if (shouldConnectRef.current) {
              connectEventSource();
            }
          }, delay);
        } else if (retryCountRef.current >= 5) {
          console.error("SSE max reconnection attempts reached");
        }
      };

      return eventSource;
    };

    const eventSource = connectEventSource();

    return () => {
      console.log("Closing SSE connection");
      shouldConnectRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (eventSource) {
        eventSource.close();
      }
    };
  }, [session?.user?.id, queryClient]);
}
