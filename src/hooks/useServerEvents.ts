import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "~/lib/auth-client";
import { getIdeaFn } from "~/routes/-fn/getIdeaFn";
import { useSession } from "~/lib/sessionContext";

// Global state for new ideas notification
let newIdeasAvailable = false;
let newIdeasCallbacks: (() => void)[] = [];

// Event handler types for better type safety
type SSEEvent = {
  type: string;
  [key: string]: any;
};

type EventHandler = (event: SSEEvent, queryClient: ReturnType<typeof useQueryClient>, currentSessionId?: string) => void;

// Event handlers map - add new handlers here for easy extension
const eventHandlers: Record<string, EventHandler> = {
  "tags-generated": (event, queryClient) => {
    console.log(`Tags generated for idea ${event.ideaId}:`, event.tags);
    
    queryClient.invalidateQueries({ queryKey: ["tags"] });
    
    queryClient.fetchQuery({
      queryKey: ["idea", event.ideaId],
      queryFn: () => getIdeaFn({ data: { ideaId: event.ideaId } }),
    });
  },
  
  "connected": () => {
    console.log("SSE connected successfully");
  },
  
  "ping": () => {
    // Keep-alive ping, no action needed
  },

  "idea-created": (event, _queryClient, currentSessionId) => {
    console.log(`New idea created: ${event.ideaId} by session: ${event.sessionId}`);
    // Only show notification if the event is from a different session
    if (event.sessionId !== currentSessionId) {
      // Set global flag that ideas are updated
      newIdeasAvailable = true;
      // Notify all registered callbacks
      newIdeasCallbacks.forEach(callback => callback());
    }
  },

  "idea-deleted": (event, _queryClient, currentSessionId) => {
    console.log(`Idea deleted: ${event.ideaId} by session: ${event.sessionId}`);
    // Only show notification if the event is from a different session
    if (event.sessionId !== currentSessionId) {
      // Set global flag that ideas are updated
      newIdeasAvailable = true;
      // Notify all registered callbacks
      newIdeasCallbacks.forEach(callback => callback());
    }
  },
  
  // Add new event handlers here:
  // "idea-updated": (event, queryClient) => {
  //   queryClient.invalidateQueries({ queryKey: ["ideas"] });
  // },
  // "vote-changed": (event, queryClient) => {
  //   queryClient.invalidateQueries({ queryKey: ["idea", event.ideaId] });
  // },
};

// Functions to manage new ideas notification state
export function getNewIdeasAvailable(): boolean {
  return newIdeasAvailable;
}

export function clearNewIdeasAvailable(): void {
  newIdeasAvailable = false;
}

export function subscribeToNewIdeas(callback: () => void): () => void {
  newIdeasCallbacks.push(callback);
  // Return unsubscribe function
  return () => {
    const index = newIdeasCallbacks.indexOf(callback);
    if (index > -1) {
      newIdeasCallbacks.splice(index, 1);
    }
  };
}

export function useServerEvents() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { sessionId } = useSession();
  const retryCountRef = useRef(0);
  const shouldConnectRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    shouldConnectRef.current = true;
    retryCountRef.current = 0;

    const connectEventSource = () => {
      if (!shouldConnectRef.current) return;

      console.log("Connecting to SSE");

      const eventSource = new EventSource(`/api/events/$`);

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        // Reset retry count on successful connection
        retryCountRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log("Received SSE event:", data);

          // Use the event handler pattern for extensible event processing
          const handler = eventHandlers[data.type];
          if (handler) {
            handler(data, queryClient, sessionId);
          } else {
            console.warn(`Unhandled SSE event type: ${data.type}`);
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
