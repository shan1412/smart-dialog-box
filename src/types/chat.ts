export type MessageRole = "user" | "assistant" | "system";

export type ContentType = "text" | "chart" | "image" | "video" | "pdf" | "question";

export interface ChartData {
  type: "line" | "bar" | "area" | "pie" | "scatter";
  data: Record<string, unknown>[];
  xKey?: string;
  yKeys?: string[];
  title?: string;
}

export interface QuestionOption {
  label: string;
  description?: string;
}

export interface QuestionData {
  question: string;
  options: QuestionOption[];
  multiSelect?: boolean;
  onSubmitLabel?: string;
}

export interface RichContent {
  type: ContentType;
  text?: string;
  chartData?: ChartData;
  questionData?: QuestionData;
  url?: string;
  alt?: string;
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: RichContent[];
  timestamp: Date;
}

export type ConnectionType = "webhook" | "websocket";

export interface ConnectionConfig {
  type: ConnectionType;
  url: string;
  headers?: Record<string, string>;
  isConnected: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
