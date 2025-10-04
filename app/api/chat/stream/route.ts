import { NextRequest } from "next/server";
import chatBus from "@/lib/realtime/chatBus";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("Session ID required", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initial ping so the client connects
      controller.enqueue(encoder.encode(`event: ping\ndata: connected\n\n`));

      const unsubscribe = chatBus.subscribe(sessionId, (event) => {
        controller.enqueue(
          encoder.encode(
            `event: message\ndata: ${JSON.stringify(event.payload)}\n\n`
          )
        );
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: keepalive\n\n`));
      }, 25000);

      // Teardown
      (controller as any)._cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };
    },
    cancel() {
      // @ts-ignore - optional cleanup
      this?._cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

