export type Emotion = "Happy" | "Sad" | "Angry" | "Neutral" | "Fear";

export interface EmotionResult {
  emotion: Emotion;
  confidence: number;
  emoji: string;
  colorVar: string;
  urduLabel: string;
}

const META: Record<Emotion, Omit<EmotionResult, "emotion" | "confidence">> = {
  Happy: { emoji: "😊", colorVar: "var(--happy)", urduLabel: "خوش" },
  Sad: { emoji: "😢", colorVar: "var(--sad)", urduLabel: "اداس" },
  Angry: { emoji: "😡", colorVar: "var(--angry)", urduLabel: "غصہ" },
  Neutral: { emoji: "😐", colorVar: "var(--neutral)", urduLabel: "غیر جانبدار" },
  Fear: { emoji: "😨", colorVar: "var(--fear)", urduLabel: "خوف" },
};

const KEYWORDS: Record<Emotion, string[]> = {
  Happy: ["khush", "خوش", "happy", "mazay", "مزے", "shukar", "شکر", "muskura", "مسکرا"],
  Sad: ["udaas", "اداس", "ghum", "غم", "ro", "رو", "dukh", "دکھ", "tanha", "تنہا"],
  Angry: ["gussa", "غصہ", "naraz", "ناراض", "nafrat", "نفرت", "pareshan", "پریشان"],
  Fear: ["dar", "ڈر", "khauf", "خوف", "ghabra", "گھبرا"],
  Neutral: [],
};

export function detectEmotion(text: string): EmotionResult {
  const lower = text.toLowerCase();
  let matched: Emotion = "Neutral";
  for (const e of Object.keys(KEYWORDS) as Emotion[]) {
    if (KEYWORDS[e].some((k) => lower.includes(k.toLowerCase()))) {
      matched = e;
      break;
    }
  }
  if (matched === "Neutral" && text.trim().length > 0) {
    const pool: Emotion[] = ["Happy", "Sad", "Angry", "Neutral", "Fear"];
    matched = pool[Math.floor(Math.random() * pool.length)];
  }
  const confidence = Math.round(70 + Math.random() * 28);
  return { emotion: matched, confidence, ...META[matched] };
}

export const SAMPLES = [
  "میں بہت خوش ہوں آج",
  "مجھے بہت غصہ آرہا ہے",
  "میں بہت اداس ہوں",
  "مجھے ڈر لگ رہا ہے",
];

export interface HistoryEntry {
  id: string;
  text: string;
  emotion: Emotion;
  confidence: number;
  emoji: string;
  timestamp: number;
}

const KEY = "uremonet_history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry) {
  const all = [entry, ...getHistory()].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
