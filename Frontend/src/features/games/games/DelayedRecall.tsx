import { useEffect, useRef, useState } from "react";
import { CelebrationAnimation } from "../components/CelebrationAnimation";
import { GameResults } from "../components/GameResults";
import { useGameSession } from "../hooks/useGameSession";

// Word lists by level difficulty
const WORD_LISTS: string[][] = [
  ["apple", "chair", "cloud", "table", "water", "light", "happy", "green"], // lv 1-2
  ["river", "storm", "bread", "flame", "music", "stone", "dream", "eagle"], // lv 3-4
  ["thunder", "cabinet", "horizon", "journey", "lantern", "mystery", "pattern", "shelter"], // lv 5-6
  [
    "architect",
    "blueprint",
    "cathedral",
    "discovery",
    "elaborate",
    "framework",
    "glittering",
    "handcrafted",
  ], // 7-10
];

const getWordList = (level: number) => WORD_LISTS[Math.min(Math.floor((level - 1) / 2.5), 3)]!;
const getWordCount = (level: number) => Math.min(3 + Math.floor(level / 2), 8);

type Phase = "study" | "distract" | "recall";

export default function DelayedRecall({ level }: { level: number }) {
  const wordList = getWordList(level);
  const wordCount = getWordCount(level);
  const studyTime = Math.max(3000, 6000 - level * 300);
  const distractTime = Math.max(5000, 8000 - level * 200);

  const [words] = useState<string[]>(() =>
    wordList.sort(() => Math.random() - 0.5).slice(0, wordCount),
  );
  const [phase, setPhase] = useState<Phase>("study");
  const [distractNum, setDistractNum] = useState(1);
  const [input, setInput] = useState("");
  const [recalled, setRecalled] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [synced, setSynced] = useState(false);
  const [offline, setOffline] = useState(false);
  const saved = useRef(false);
  const sessionStart = useRef(Date.now());
  const { submitResult } = useGameSession();

  useEffect(() => {
    sessionStart.current = Date.now();
    const study = setTimeout(() => setPhase("distract"), studyTime);
    return () => clearTimeout(study);
  }, [studyTime]);

  useEffect(() => {
    if (phase !== "distract") return;
    const interval = setInterval(() => setDistractNum((n) => n + 1), 1000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPhase("recall");
    }, distractTime);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase, distractTime]);

  const addWord = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed || recalled.includes(trimmed)) {
      setInput("");
      return;
    }
    setRecalled((r) => [...r, trimmed]);
    setInput("");
  };

  const submitRecall = () => {
    if (submitted) return;
    setSubmitted(true);
    const correct = recalled.filter((w) => words.includes(w)).length;
    const acc = Math.round((correct / wordCount) * 100);
    if (!saved.current) {
      saved.current = true;
      const dur = Math.round((Date.now() - sessionStart.current) / 1000);
      submitResult({
        gameId: "delayed-recall",
        gameType: "delayed_recall",
        score: acc,
        accuracy: acc,
        durationSeconds: Math.max(5, dur),
        level,
        difficulty: String(level),
      }).then((r) => {
        setSynced(r.success);
        setOffline(r.offline);
        setCompleted(true);
      });
    }
  };

  if (completed) {
    const correct = recalled.filter((w) => words.includes(w)).length;
    const acc = Math.round((correct / wordCount) * 100);
    return (
      <>
        <CelebrationAnimation show={acc >= 60} />
        <GameResults
          score={acc}
          accuracy={acc}
          durationSeconds={Math.round((Date.now() - sessionStart.current) / 1000)}
          level={level}
          gameName="Delayed Recall"
          synced={synced}
          offline={offline}
          onPlayAgain={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <div className="space-y-5">
      {phase === "study" && (
        <div className="text-center space-y-4">
          <p className="text-cream/60 text-sm">Memorise these {wordCount} words:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {words.map((w) => (
              <span
                key={w}
                className="px-4 py-2 rounded-xl border border-sun bg-sun/10 font-display text-xl font-bold text-sun"
              >
                {w}
              </span>
            ))}
          </div>
          <p className="text-xs text-cream/40 animate-pulse">
            Study time: moving to distractor task soon…
          </p>
        </div>
      )}

      {phase === "distract" && (
        <div className="text-center space-y-4">
          <p className="text-cream/60 text-sm">Count along: (this is your distractor task)</p>
          <p className="font-display text-7xl font-black text-fire animate-pulse">{distractNum}</p>
          <p className="text-xs text-cream/40 animate-pulse">Remember the words you saw…</p>
        </div>
      )}

      {phase === "recall" && !submitted && (
        <div className="space-y-4">
          <p className="text-cream/60 text-sm text-center">
            Type all the words you remember, one at a time:
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {recalled.map((w) => (
              <span
                key={w}
                className="px-3 py-1.5 rounded-lg border border-tea-confirm bg-tea-confirm/10 text-tea-confirm font-bold text-sm"
              >
                {w}
              </span>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addWord();
              }}
              className="rounded-xl border-2 border-clay bg-ink text-cream font-bold py-2.5 px-4 w-48 focus:border-sun focus:outline-none text-lg"
              placeholder="Type a word…"
              autoFocus
            />
            <button
              onClick={addWord}
              className="px-4 py-2.5 rounded-xl bg-clay text-cream font-bold hover:bg-clay/80 transition"
            >
              Add
            </button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={submitRecall}
              className="px-6 py-3 rounded-xl bg-sun text-ink font-extrabold hover:opacity-90 transition shadow"
            >
              ✓ I'm Done — Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
