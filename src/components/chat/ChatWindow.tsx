import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ConnectionSettings } from "./ConnectionSettings";
import { MessageSquare, Loader2 } from "lucide-react";

export function ChatWindow() {
  const { messages, isLoading, connection, sendMessage, updateConnection } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold text-foreground">Universal Chat</h1>
            <p className="text-xs font-mono text-muted-foreground">
              {connection.url ? `${connection.type} · ${connection.url.substring(0, 40)}...` : "Demo mode · Configure endpoint in settings"}
            </p>
          </div>
        </div>
        <div className="relative">
          <ConnectionSettings config={connection} onUpdate={updateConnection} />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-4 bg-chat-assistant">
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            </div>
            <span className="text-sm text-muted-foreground font-mono">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
