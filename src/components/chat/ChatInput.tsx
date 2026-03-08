import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <button
          className="flex-shrink-0 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-sans scrollbar-thin"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex-shrink-0 p-3 rounded-lg bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
