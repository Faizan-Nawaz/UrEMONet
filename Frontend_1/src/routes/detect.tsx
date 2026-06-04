import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { addHistory, EmotionResult } from "@/lib/emotion";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Detect Emotion — UrEMONet" },
      { name: "description", content: "Upload video and detect emotional tone using multimodal AI." },
    ],
  }),
  component: Detect,
});

function Detect() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);

  const onVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideo(file);
    setVideoURL(URL.createObjectURL(file));
    setResult(null);
  };

  // placeholder for your multimodal pipeline
  const processVideo = async (): Promise<EmotionResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          emotion: "Happy",
          confidence: 87,
          emoji: "😊",
          urduLabel: "خوشی",
          colorVar: "#22c55e",
        });
      }, 2000);
    });
  };

  const onDetect = async () => {
    if (!video) return;

    setLoading(true);
    setResult(null);

    const r = await processVideo();

    setResult(r);
    setLoading(false);

    addHistory({
      id: crypto.randomUUID(),
      text: video.name,
      emotion: r.emotion,
      confidence: r.confidence,
      emoji: r.emoji,
      timestamp: Date.now(),
    });
  };

  const onClear = () => {
    setVideo(null);
    setVideoURL(null);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Emotion Detection
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a video and let multimodal AI analyze emotion.
        </p>
      </div>

      {/* Upload Box */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-8 text-center hover:bg-accent transition">
          <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">Click to upload video</span>
          <span className="text-xs text-muted-foreground mt-1">
            MP4, WEBM supported
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onVideoSelect}
          />
        </label>

        {videoURL && (
          <video
            src={videoURL}
            controls
            className="mt-5 w-full rounded-2xl border border-border"
          />
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onDetect}
            disabled={loading || !video}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl gradient-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Analyzing video..." : "Detect Emotion"}
          </button>

          <button
            onClick={onClear}
            className="grid place-items-center rounded-xl border border-border bg-secondary px-4 hover:bg-accent transition"
            aria-label="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">
            Processing multimodal signals...
          </span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          className="mt-6 overflow-hidden rounded-3xl border bg-card p-7 shadow-soft"
          style={{ borderColor: result.colorVar }}
        >
          <div className="flex items-center gap-5">
            <div
              className="grid h-20 w-20 place-items-center rounded-2xl text-5xl"
              style={{
                backgroundColor: `color-mix(in oklab, ${result.colorVar} 18%, transparent)`,
              }}
            >
              {result.emoji}
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground">
                Detected emotion
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-3xl font-bold"
                  style={{ color: result.colorVar }}
                >
                  {result.emotion}
                </span>
                <span className="font-urdu text-xl text-muted-foreground">
                  {result.urduLabel}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="text-2xl font-bold">{result.confidence}%</div>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${result.confidence}%`,
                backgroundColor: result.colorVar,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}