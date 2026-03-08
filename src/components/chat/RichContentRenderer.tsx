import { useState } from "react";
import { RichContent, ChartData, QuestionData } from "@/types/chat";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Check } from "lucide-react";

const CHART_COLORS = [
  "hsl(185, 80%, 50%)", "hsl(280, 70%, 60%)", "hsl(45, 90%, 55%)",
  "hsl(140, 60%, 50%)", "hsl(10, 80%, 60%)", "hsl(220, 70%, 60%)",
];

function InteractiveQuestion({ questionData, onAnswer }: { questionData: QuestionData; onAnswer?: (selected: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (label: string) => {
    if (submitted) return;
    if (questionData.multiSelect) {
      setSelected((prev) =>
        prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
      );
    } else {
      setSelected([label]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
    onAnswer?.(selected);
  };

  return (
    <div className="w-full rounded-lg bg-secondary/50 border border-border p-4 my-2 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-mono font-semibold text-foreground">{questionData.question}</p>
        <span className="text-xs text-muted-foreground font-mono">
          {questionData.multiSelect ? "Select multiple" : "Select one answer"}
        </span>
      </div>
      <div className="space-y-2">
        {questionData.options.map((opt) => {
          const isSelected = selected.includes(opt.label);
          return (
            <button
              key={opt.label}
              onClick={() => toggle(opt.label)}
              disabled={submitted}
              className={`w-full text-left rounded-md border p-3 transition-all ${
                isSelected
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border bg-background hover:border-muted-foreground/50"
              } ${submitted ? "opacity-70 cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "border-accent bg-accent" : "border-muted-foreground/40"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  {opt.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {questionData.onSubmitLabel || "Submit"}
        </button>
      ) : (
        <p className="text-xs text-muted-foreground font-mono">
          ✓ Answered: {selected.join(", ")}
        </p>
      )}
    </div>
  );
}

function InteractiveChart({ chartData }: { chartData: ChartData }) {
  const { type, data, xKey = "name", yKeys = [], title } = chartData;
  const keys = yKeys.length > 0 ? yKeys : Object.keys(data[0] || {}).filter(k => k !== xKey);

  return (
    <div className="w-full rounded-lg bg-secondary/50 p-4 my-2">
      {title && <p className="text-sm font-mono font-semibold text-foreground mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis dataKey={xKey} stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <YAxis stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 20%, 90%)" }} />
            <Legend />
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        ) : type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis dataKey={xKey} stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <YAxis stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 20%, 90%)" }} />
            <Legend />
            {keys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : type === "area" ? (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis dataKey={xKey} stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <YAxis stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 20%, 90%)" }} />
            <Legend />
            {keys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.2} />
            ))}
          </AreaChart>
        ) : type === "scatter" ? (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis dataKey={xKey} stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <YAxis dataKey={keys[0]} stroke="hsl(215, 15%, 50%)" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 20%, 90%)" }} />
            <Scatter data={data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        ) : (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 20%, 90%)" }} />
            <Legend />
            <Pie data={data} dataKey={keys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function RichContentRenderer({ content }: { content: RichContent }) {
  switch (content.type) {
    case "text":
      return <p className="whitespace-pre-wrap leading-relaxed">{content.text}</p>;

    case "chart":
      return content.chartData ? <InteractiveChart chartData={content.chartData} /> : null;

    case "question":
      return content.questionData ? <InteractiveQuestion questionData={content.questionData} /> : null;

    case "image":
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-border">
          <img src={content.url} alt={content.alt || "Image"} className="max-w-full max-h-96 object-contain" loading="lazy" />
        </div>
      );

    case "video":
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-border">
          <video src={content.url} controls className="max-w-full max-h-96" preload="metadata">
            Your browser does not support video.
          </video>
        </div>
      );

    case "pdf":
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-border">
          <iframe src={content.url} className="w-full h-96" title="PDF Document" />
        </div>
      );

    default:
      return null;
  }
}
