import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverEvents, type ServerEvent } from "~/lib/eventEmitter";

export const ServerRoute = createServerFileRoute("/api/events/$").methods({
  GET: ({ request }) => {

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection messages
        const connectMessage = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
        controller.enqueue(new TextEncoder().encode(connectMessage));

        // Listen for events and broadcast to all connections
        const handleEvent = (event: ServerEvent) => {
          const message = `data: ${JSON.stringify(event)}\n\n`;
          try {
            controller.enqueue(new TextEncoder().encode(message));
          } catch (error) {
            console.error("Error sending SSE message:", error);
          }
        };

        serverEvents.on("tags-generated", handleEvent);
        serverEvents.on("idea-created", handleEvent);
        serverEvents.on("idea-deleted", handleEvent);

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
          serverEvents.off("idea-created", handleEvent);
          serverEvents.off("idea-deleted", handleEvent);
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
