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
      let closed = false;

      const safeEnqueue = (data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // If enqueue throws because the controller was closed, mark closed and cleanup
          closed = true;
          // @ts-ignore - optional cleanup reference set below
          (controller as any)?._cleanup?.();
        }
      };

      // Initial ping so the client connects
      safeEnqueue(`event: ping\ndata: connected\n\n`);

      const unsubscribe = chatBus.subscribe(sessionId, (event) => {
        safeEnqueue(
          `event: message\ndata: ${JSON.stringify(event.payload)}\n\n`
        );
      });

      const keepAlive = setInterval(() => {
        safeEnqueue(`event: ping\ndata: keepalive\n\n`);
      }, 25000);

      // Teardown
      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      };
      (controller as any)._cleanup = cleanup;

      // Also teardown if the request is aborted (client disconnects)
      try {
        // In Node.js runtime, NextRequest exposes an AbortSignal
        // which fires when the client disconnects
        req.signal.addEventListener("abort", cleanup, { once: true });
      } catch {}
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
