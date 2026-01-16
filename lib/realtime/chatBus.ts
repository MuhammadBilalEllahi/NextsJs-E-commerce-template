import { EventEmitter } from "events";

import { CHAT_BUS_EVENT_PREFIX } from "../cacheConstants";
import { ChatEvent } from "@/types/types";

class ChatBus extends EventEmitter {
  public emitMessage(sessionId: string, payload: any) {
    this.emit(`${CHAT_BUS_EVENT_PREFIX}${sessionId}`, { sessionId, payload } as ChatEvent);
  }

  public subscribe(sessionId: string, listener: (e: ChatEvent) => void) {
    const eventName = `${CHAT_BUS_EVENT_PREFIX}${sessionId}`;
    this.on(eventName, listener);
    return () => this.off(eventName, listener);
  }
}

// Singleton instance across the app
// eslint-disable-next-line import/no-anonymous-default-export
const chatBus: ChatBus = (global as any).__CHAT_BUS__ || new ChatBus();
(global as any).__CHAT_BUS__ = chatBus;

export default chatBus;














