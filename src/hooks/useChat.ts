import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage, ConnectionConfig, RichContent } from "@/types/chat";

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "demo-1",
    role: "system",
    content: [{ type: "text", text: "Welcome! Configure your endpoint in settings, or explore the demo messages below." }],
    timestamp: new Date(),
  },
  {
    id: "demo-2",
    role: "assistant",
    content: [
      { type: "text", text: "Here's an interactive chart showing quarterly revenue:" },
      {
        type: "chart",
        chartData: {
          type: "area",
          title: "Quarterly Revenue ($M)",
          data: [
            { quarter: "Q1", revenue: 4.2, profit: 1.8 },
            { quarter: "Q2", revenue: 5.1, profit: 2.3 },
            { quarter: "Q3", revenue: 6.8, profit: 3.1 },
            { quarter: "Q4", revenue: 8.2, profit: 4.0 },
          ],
          xKey: "quarter",
          yKeys: ["revenue", "profit"],
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "demo-3",
    role: "assistant",
    content: [
      { type: "text", text: "And a bar chart of user engagement by platform:" },
      {
        type: "chart",
        chartData: {
          type: "bar",
          title: "Users by Platform",
          data: [
            { platform: "Web", users: 12400 },
            { platform: "iOS", users: 8900 },
            { platform: "Android", users: 7600 },
            { platform: "Desktop", users: 3200 },
          ],
          xKey: "platform",
          yKeys: ["users"],
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "demo-4",
    role: "assistant",
    content: [
      { type: "text", text: "I can also render images:" },
      { type: "image", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80", alt: "Data visualization" },
    ],
    timestamp: new Date(),
  },
];

function parseAssistantResponse(data: unknown): RichContent[] {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return parseAssistantResponse(parsed);
    } catch {
      return [{ type: "text", text: data }];
    }
  }

  if (Array.isArray(data)) {
    return data as RichContent[];
  }

  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj.content && Array.isArray(obj.content)) return obj.content as RichContent[];
    if (obj.message && typeof obj.message === "string") return [{ type: "text", text: obj.message }];
    if (obj.text && typeof obj.text === "string") return [{ type: "text", text: obj.text }];
    return [{ type: "text", text: JSON.stringify(data, null, 2) }];
  }

  return [{ type: "text", text: String(data) }];
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<ConnectionConfig>({
    type: "webhook",
    url: "",
    headers: {},
    isConnected: false,
  });
  const wsRef = useRef<WebSocket | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendWebhook = useCallback(
    async (text: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(connection.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(connection.headers || {}) },
          body: JSON.stringify({ message: text, history: messages.map((m) => ({ role: m.role, content: m.content })) }),
        });
        const data = await res.json();
        addMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: parseAssistantResponse(data),
          timestamp: new Date(),
        });
      } catch (err) {
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : "Request failed"}` }],
          timestamp: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [connection, messages, addMessage]
  );

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(connection.url);
    ws.onopen = () => setConnection((c) => ({ ...c, isConnected: true }));
    ws.onclose = () => setConnection((c) => ({ ...c, isConnected: false }));
    ws.onmessage = (event) => {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: parseAssistantResponse(event.data),
        timestamp: new Date(),
      });
    };
    ws.onerror = () => {
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        content: [{ type: "text", text: "WebSocket error occurred." }],
        timestamp: new Date(),
      });
    };
    wsRef.current = ws;
  }, [connection.url, addMessage]);

  const sendMessage = useCallback(
    (text: string) => {
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: [{ type: "text", text }],
        timestamp: new Date(),
      });

      if (!connection.url) return; // demo mode

      if (connection.type === "webhook") {
        sendWebhook(text);
      } else if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message: text }));
      }
    },
    [connection, addMessage, sendWebhook]
  );

  const updateConnection = useCallback(
    (config: ConnectionConfig) => {
      setConnection(config);
      if (config.type === "websocket" && config.url) {
        setTimeout(connectWebSocket, 100);
      }
    },
    [connectWebSocket]
  );

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  return { messages, isLoading, connection, sendMessage, updateConnection };
}
