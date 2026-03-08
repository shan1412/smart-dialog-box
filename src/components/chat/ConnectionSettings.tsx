import { ConnectionConfig, ConnectionType } from "@/types/chat";
import { Settings, Wifi, WifiOff, Globe, Zap } from "lucide-react";
import { useState } from "react";

interface ConnectionSettingsProps {
  config: ConnectionConfig;
  onUpdate: (config: ConnectionConfig) => void;
}

export function ConnectionSettings({ config, onUpdate }: ConnectionSettingsProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(config.url);
  const [type, setType] = useState<ConnectionType>(config.type);
  const [headersText, setHeadersText] = useState(
    config.headers ? JSON.stringify(config.headers, null, 2) : "{}"
  );

  const handleSave = () => {
    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(headersText);
    } catch {
      // keep empty
    }
    onUpdate({ type, url, headers, isConnected: false });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Connection settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-4 top-14 z-50 w-96 bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-semibold text-foreground text-sm">Connection Settings</h3>
            <div className="flex items-center gap-1.5">
              {config.isConnected ? (
                <><Wifi className="w-3.5 h-3.5 text-accent" /><span className="text-xs text-accent font-mono">Connected</span></>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground font-mono">Disconnected</span></>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground">Transport</label>
            <div className="flex gap-2">
              {(["webhook", "websocket"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                    type === t
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "webhook" ? <Globe className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground">Endpoint URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={type === "webhook" ? "https://api.example.com/chat" : "wss://api.example.com/ws"}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground">Headers (JSON)</label>
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono bg-accent text-accent-foreground hover:opacity-90 transition-all"
            >
              Save & Connect
            </button>
          </div>
        </div>
      )}
    </>
  );
}
