import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearHistory, getHistory, HistoryEntry } from "@/lib/emotion";
import { Clock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — UrEMONet" },
      { name: "description", content: "View your previously analyzed Urdu texts and detected emotions." },
    ],
  }),
  component: History,
});

const COLORS: Record<string, string> = {
  Happy: "var(--happy)",
  Sad: "var(--sad)",
  Angry: "var(--angry)",
  Neutral: "var(--neutral)",
  Fear: "var(--fear)",
};

function History() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const onClear = () => {
    clearHistory();
    setItems([]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">History</h1>
          <p className="mt-2 text-muted-foreground">Your recent emotion analyses.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No history yet.</p>
            <Link to="/detect" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Try detecting an emotion →
            </Link>
          </div>
        ) : (
          items.map((e) => {
            const color = COLORS[e.emotion] || "var(--neutral)";
            return (
              <div
                key={e.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 animate-fade-in"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
                    style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)` }}
                  >
                    {e.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-urdu text-lg leading-loose break-words">{e.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span
                        className="rounded-full px-2.5 py-0.5 font-semibold"
                        style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
                      >
                        {e.emotion} · {e.confidence}%
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(e.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
