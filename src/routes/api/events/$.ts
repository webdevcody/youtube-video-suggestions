import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverEvents, type ServerEvent } from "~/lib/eventEmitter";

export const ServerRoute = createServerFileRoute("/api/events/$").methods({
  GET: ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection messages
        const connectMessage = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
        controller.enqueue(new TextEncoder().encode(connectMessage));

        // Listen for events for this specific user
        const handleEvent = (event: ServerEvent) => {
          if (event.userId === userId) {
            const message = `data: ${JSON.stringify(event)}\n\n`;
            try {
              controller.enqueue(new TextEncoder().encode(message));
            } catch (error) {
              console.error("Error sending SSE message:", error);
            }
          }
        };

        serverEvents.on("tags-generated", handleEvent);

        // Keep alive ping every 30 seconds
        const pingInterval = setInterval(() => {
          try {
            const pingMessage = `data: ${JSON.stringify({ type: "ping" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(pingMessage));
          } catch (e) {
            clearInterval(pingInterval);
            controller.close();
          }
        }, 30000);

        // Cleanup on disconnect
        const cleanup = () => {
          serverEvents.off("tags-generated", handleEvent);
          clearInterval(pingInterval);
          try {
            controller.close();
          } catch (e) {
            // Controller already closed
          }
        };

        request.signal?.addEventListener("abort", cleanup);

        // Additional cleanup for when the stream ends
        return cleanup;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  },
});
