import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { NavigationHeader } from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { HowToPlay } from "./HowToPlay";
import { LevelSelector } from "./LevelSelector";
import type { GameMetadata } from "../types/game.types";
import { GAME_INSTRUCTIONS } from "../data/gameInstructions";
import { useLanguage } from "@/context/LanguageContext";

interface GameShellProps {
  game: GameMetadata;
  children: ReactNode;
  /** Current level (1-based) */
  level: number;
  showLevelSelector?: boolean;
}

export function GameShell({ game, children, level, showLevelSelector = true }: GameShellProps) {
  const instructions = GAME_INSTRUCTIONS[game.id];
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavigationHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10 space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="cream" size="touch">
            <Link to="/games">
              <ArrowLeft size={18} className="mr-2" /> {t("common:allGames")}
            </Link>
          </Button>

          {showLevelSelector && <LevelSelector gameId={game.id} maxLevel={game.maxLevel} />}
        </div>

        {/* Game Header */}
        <div className="rounded-2xl border border-clay bg-surface p-5 sm:p-7 shadow-card flex items-center gap-5">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-sun/20 text-4xl shrink-0">
            {game.icon}
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">{game.name}</h1>
            <p className="text-cream/70 text-sm mt-1 max-w-lg">{game.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {game.cognitiveDomains.slice(0, 3).map((d) => (
                <span
                  key={d}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-clay bg-clay/30 text-cream/70 font-semibold capitalize"
                >
                  {d.replace(/_/g, " ")}
                </span>
              ))}
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-sun/40 bg-sun/10 text-sun font-semibold">
                {t("games:level", { level, maxLevel: game.maxLevel })}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {instructions && (
          <HowToPlay
            title={instructions.title}
            instructions={instructions.instructions}
            {...(instructions.tips ? { tips: instructions.tips } : {})}
          />
        )}

        {/* Game Area */}
        <div className="rounded-2xl border border-clay bg-surface shadow-card overflow-hidden">
          <div className="p-4 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
