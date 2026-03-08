import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage, ConnectionConfig, RichContent, Conversation } from "@/types/chat";

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
  {
    id: "demo-5",
    role: "assistant",
    content: [
      { type: "text", text: "And interactive questions/forms:" },
      {
        type: "question",
        questionData: {
          question: "What types of content should admin be able to upload?",
          options: [
            { label: "Projects", description: "Project showcase with images, title, description" },
            { label: "Blogs/Articles", description: "Text-based content with images" },
            { label: "Video Tutorials", description: "Video uploads or YouTube/Vimeo embeds" },
            { label: "All of the above", description: "Full content management for all types" },
          ],
          multiSelect: false,
        },
      },
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
  if (Array.isArray(data)) return data as RichContent[];
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj.content && Array.isArray(obj.content)) return obj.content as RichContent[];
    if (obj.message && typeof obj.message === "string") return [{ type: "text", text: obj.message }];
    if (obj.text && typeof obj.text === "string") return [{ type: "text", text: obj.text }];
    return [{ type: "text", text: JSON.stringify(data, null, 2) }];
  }
  return [{ type: "text", text: String(data) }];
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem("chat-conversations");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((c: Conversation) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem("chat-conversations", JSON.stringify(convos));
}

function createNewConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Chat";
  const text = firstUser.content.find((c) => c.type === "text")?.text || "";
  return text.length > 40 ? text.substring(0, 40) + "…" : text || "New Chat";
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    return loaded.length > 0 ? loaded : [{ ...createNewConversation(), messages: DEMO_MESSAGES }];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    const loaded = loadConversations();
    return loaded.length > 0 ? loaded[0].id : conversations[0].id;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<ConnectionConfig>({
    type: "webhook",
    url: "",
    headers: {},
    isConnected: false,
  });
  const wsRef = useRef<WebSocket | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];
  const messages = activeConversation?.messages || [];

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const updateActiveMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const newMessages = updater(c.messages);
          return {
            ...c,
            messages: newMessages,
            title: deriveTitle(newMessages),
            updatedAt: new Date(),
          };
        })
      );
    },
    [activeId]
  );

  const addMessage = useCallback(
    (msg: ChatMessage) => {
      updateActiveMessages((prev) => [...prev, msg]);
    },
    [updateActiveMessages]
  );

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
      if (!connection.url) return;
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

  const newChat = useCallback(() => {
    const convo = createNewConversation();
    setConversations((prev) => [convo, ...prev]);
    setActiveId(convo.id);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const fresh = createNewConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (activeId === id) setActiveId(filtered[0].id);
        return filtered;
      });
    },
    [activeId]
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }, []);

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  return {
    messages,
    isLoading,
    connection,
    sendMessage,
    updateConnection,
    conversations,
    activeId,
    newChat,
    selectConversation,
    deleteConversation,
    renameConversation,
  };
}
