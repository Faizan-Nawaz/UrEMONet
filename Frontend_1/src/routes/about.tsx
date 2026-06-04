import { createFileRoute } from "@tanstack/react-router";
import { Brain, Database, Layers, GitMerge } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UrEMONet" },
      { name: "description", content: "About UrEMONet — a multimodal emotion recognition system for Urdu drama clips using video, audio and text fusion." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About UrEMONet</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        A multimodal deep learning system for Urdu emotion recognition — built as a Final Year Project using video, audio and text fusion on Urdu drama clips.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Layers,
            title: "Multimodal Fusion",
            desc: "Combines video frames, speech audio and Urdu text transcriptions using cross-modal projection for accurate emotion prediction.",
          },
          {
            icon: Brain,
            title: "Deep Learning Pipeline",
            desc: "Powered by MTCNN + FaceNet for video, Wav2Vec2-Urdu for audio, and XLM-RoBERTa for text feature extraction.",
          },
          {
            icon: Database,
            title: "Urdu Drama Dataset",
            desc: "Trained on 8,588 annotated video clips extracted from Urdu drama series, covering 5 emotion classes.",
          },
          {
            icon: GitMerge,
            title: "Final Year Project",
            desc: "Built at University of Sialkot to advance emotion recognition research for low-resource Urdu language.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border gradient-hero p-6">
        <h3 className="font-semibold">Emotions detected</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            { l: "Happy 😊", c: "var(--happy)" },
            { l: "Sad 😢", c: "var(--sad)" },
            { l: "Angry 😡", c: "var(--angry)" },
            { l: "Neutral 😐", c: "var(--neutral)" },
            { l: "Love ❤️", c: "var(--fear)" },
          ].map((e) => (
            <span
              key={e.l}
              className="rounded-full px-3 py-1 font-medium"
              style={{ backgroundColor: `color-mix(in oklab, ${e.c} 20%, transparent)`, color: e.c }}
            >
              {e.l}
            </span>
          ))}
        </div>
      </div>

      

    </div>
  );
}