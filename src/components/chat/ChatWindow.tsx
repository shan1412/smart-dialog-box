import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ConnectionSettings } from "./ConnectionSettings";
import { ChatHistory } from "./ChatHistory";
import { MessageSquare, Loader2, PanelLeftClose, PanelLeft } from "lucide-react";

export function ChatWindow() {
  const {
    messages, isLoading, connection, sendMessage, updateConnection,
    conversations, activeId, newChat, selectConversation, deleteConversation, renameConversation,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 border-r border-border transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "w-64" : "w-0"
        }`}
      >
        {sidebarOpen && (
          <ChatHistory
            conversations={conversations}
            activeId={activeId}
            onSelect={selectConversation}
            onNew={newChat}
            onDelete={deleteConversation}
            onRename={renameConversation}
          />
        )}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-foreground">Universal Chat</h1>
              <p className="text-xs font-mono text-muted-foreground">
                {connection.url ? `${connection.type} · ${connection.url.substring(0, 35)}…` : "Demo mode"}
              </p>
            </div>
          </div>
          <div className="relative">
            <ConnectionSettings config={connection} onUpdate={updateConnection} />
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-mono text-muted-foreground">Start a new conversation</p>
              </div>
            </div>
          )}
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
    </div>
  );
}
