import { Trophy, RotateCcw, Home, CloudOff, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../utils/gameMetrics";

interface GameResultsProps {
  score: number;
  accuracy: number;
  durationSeconds: number;
  level: number;
  gameName: string;
  synced: boolean;
  offline: boolean;
  onPlayAgain: () => void;
}

export function GameResults({
  score,
  accuracy,
  durationSeconds,
  level,
  gameName,
  synced,
  offline,
  onPlayAgain,
}: GameResultsProps) {
  const grade =
    score >= 90
      ? "Excellent!"
      : score >= 70
        ? "Great Job!"
        : score >= 50
          ? "Good Effort!"
          : "Keep Practising!";

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 rounded-2xl border border-clay bg-surface p-8 shadow-card flex flex-col items-center text-center max-w-md mx-auto">
      <div className="flex size-20 items-center justify-center rounded-full bg-sun text-ink mb-5 shadow-md">
        <Trophy size={44} />
      </div>

      <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-1">{grade}</h2>
      <p className="text-cream/70 mb-6 text-sm">
        {gameName} · Level {level}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        <div className="rounded-xl border border-clay bg-ink/60 py-4 px-2">
          <p className="text-xs font-bold uppercase text-cream/50 mb-1">Score</p>
          <p className="font-display text-3xl font-bold text-sun">{score}</p>
        </div>
        <div className="rounded-xl border border-clay bg-ink/60 py-4 px-2">
          <p className="text-xs font-bold uppercase text-cream/50 mb-1">Accuracy</p>
          <p className="font-display text-3xl font-bold text-tea-confirm">
            {Math.round(accuracy)}%
          </p>
        </div>
        <div className="rounded-xl border border-clay bg-ink/60 py-4 px-2">
          <p className="text-xs font-bold uppercase text-cream/50 mb-1">Time</p>
          <p className="font-display text-3xl font-bold text-cream">
            {formatDuration(durationSeconds)}
          </p>
        </div>
      </div>

      {/* Sync Status */}
      {offline ? (
        <div className="flex items-center gap-2 rounded-lg border border-fire/40 bg-fire/10 px-4 py-2 text-sm text-cream/80 mb-5 w-full">
          <CloudOff size={16} className="text-fire shrink-0" />
          <span>Result saved locally — will sync when you're back online.</span>
        </div>
      ) : synced ? (
        <div className="flex items-center gap-2 rounded-lg border border-tea-confirm/40 bg-tea-confirm/10 px-4 py-2 text-sm text-cream/80 mb-5 w-full">
          <CheckCircle2 size={16} className="text-tea-confirm shrink-0" />
          <span>Cognitive performance recorded successfully.</span>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          onClick={onPlayAgain}
          variant="cream"
          size="touch"
          className="flex-1 text-base font-extrabold"
        >
          <RotateCcw size={18} className="mr-2" /> Play Again
        </Button>
        <Button
          asChild
          variant="ghost"
          size="touch"
          className="flex-1 border border-clay text-cream hover:bg-clay"
        >
          <Link to="/games">
            <Home size={18} className="mr-2" /> All Games
          </Link>
        </Button>
      </div>
    </div>
  );
}
