import { useState, useMemo } from "react";
import { Conversation } from "@/types/chat";
import { Plus, MessageSquare, Trash2, Pencil, Check, X, Search } from "lucide-react";

interface ChatHistoryProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function ChatHistory({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => typeof m.content === "string" && m.content.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const startRename = (id: string, title: string) => {
    setEditingId(id);
    setEditText(title);
  };

  const confirmRename = () => {
    if (editingId && editText.trim()) {
      onRename(editingId, editText.trim());
    }
    setEditingId(null);
  };

  // Group conversations by date
  const grouped: Record<string, Conversation[]> = {};
  filtered.forEach((c) => {
    const label = formatDate(c.updatedAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(c);
  });

  return (
    <div className="flex flex-col h-full bg-card">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border text-sm font-mono text-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4 text-accent" />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3 space-y-4">
        {Object.entries(grouped).map(([label, convos]) => (
          <div key={label}>
            <p className="px-2 py-1 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <div className="space-y-0.5">
              {convos.map((c) => (
                <div
                  key={c.id}
                  className={`group relative flex items-center rounded-lg cursor-pointer transition-colors ${
                    c.id === activeId
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {editingId === c.id ? (
                    <div className="flex items-center gap-1 w-full px-2 py-2">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button onClick={confirmRename} className="p-1 text-accent hover:text-accent/80">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onSelect(c.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 px-2 py-2 text-left"
                      >
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                        <span className="text-xs font-mono truncate">{c.title}</span>
                      </button>
                      <div className="hidden group-hover:flex items-center gap-0.5 pr-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(c.id, c.title);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
