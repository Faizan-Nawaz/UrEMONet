import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Layers, Mic } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UrEMONet — Urdu Multimodal Emotion Recognition" },
      { name: "description", content: "Detect emotions from Urdu drama video clips using video, audio and text fusion." },
      { property: "og:title", content: "UrEMONet — Urdu Multimodal Emotion Recognition" },
      { property: "og:description", content: "AI-powered multimodal Urdu emotion recognition using video, audio and text." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-60" />
      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Multimodal Deep Learning · Final Year Project
        </div>

        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl animate-fade-in">
          <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
            UrEMONet
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in">
          Urdu Multimodal Emotion Recognition — classifying emotions from video, audio and text using deep learning fusion.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/detect"
            className="group inline-flex items-center gap-2 rounded-xl gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            Detect Emotion
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/about"
            className="rounded-xl border border-border bg-card/70 px-7 py-3.5 text-base font-medium backdrop-blur hover:bg-accent transition-colors"
          >
            Learn more
          </Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "3 Modalities",
              desc: "Fuses video frames, speech audio and Urdu text transcriptions for accurate emotion prediction.",
            },
            {
              icon: Brain,
              title: "Deep Learning",
              desc: "Powered by MTCNN, FaceNet, Wav2Vec2 and XLM-RoBERTa with cross-modal fusion.",
            },
            {
              icon: Mic,
              title: "Urdu Focused",
              desc: "Built specifically for Urdu drama clips — 8,588 annotated clips across 5 emotion classes.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card/80 p-6 text-left shadow-soft backdrop-blur transition-transform hover:-translate-y-1"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}