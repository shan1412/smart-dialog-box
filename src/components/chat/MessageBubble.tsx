import { ChatMessage } from "@/types/chat";
import { RichContentRenderer } from "./RichContentRenderer";
import { Bot, User, Info } from "lucide-react";

const roleConfig = {
  user: { icon: User, bg: "bg-chat-user", label: "You" },
  assistant: { icon: Bot, bg: "bg-chat-assistant", label: "Assistant" },
  system: { icon: Info, bg: "bg-secondary", label: "System" },
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const config = roleConfig[message.role];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 px-4 py-4 ${config.bg} transition-colors`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-accent">{config.label}</span>
          <span className="text-xs font-mono text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="text-sm text-foreground">
          {message.content.map((c, i) => (
            <RichContentRenderer key={i} content={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
