"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, PhoneCall } from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; text: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hi! I’m Mirchi, your spice assistant. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, open]);

  const send = async () => {
    if (!input.trim()) return;
    const prompt = input.trim();
    setMsgs((m) => [...m, { role: "user", text: prompt }]);
    setInput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => ({}));
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: data?.text ?? "Sorry, I didn’t catch that.",
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: "The chat is busy. Please try again." },
      ]);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 rounded-xl border bg-background shadow-lg dark:bg-neutral-950">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="font-semibold">Live Chat</div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={ref} className="h-72 overflow-auto p-3 space-y-2">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded px-3 py-2 text-sm ${
                  m.role === "assistant"
                    ? "bg-neutral-100 dark:bg-neutral-900"
                    : "bg-primary text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="border-t p-2">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded border bg-transparent px-3 py-2 text-sm"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                onClick={send}
                className="h-9 w-9 inline-flex items-center justify-center rounded bg-primary text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <a
                href={`https://wa.me/923001234567?text=${encodeURIComponent(
                  "Hello Dehli Mirch! I need help."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                WhatsApp Support
              </a>
              <a
                href="tel:+923001234567"
                className="text-xs inline-flex items-center gap-1 underline"
              >
                <PhoneCall className="h-3.5 w-3.5" /> Call us
              </a>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-white shadow-lg inline-flex items-center justify-center"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
