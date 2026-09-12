import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  Pill,
  Volume2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import profilePhoto from "@/assets/profile-lalita.jpg";
import memoryPhotos from "@/assets/memory-triptych.jpg";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/navigation-header";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useMedications } from "@/hooks/use-medications";
import { useGames } from "@/hooks/use-games";
import { formatApiError } from "@/api/client";
import { voiceApi } from "@/api/voice.api";
import { translationApi } from "@/api/translation.api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home | CuCove" },
      {
        name: "description",
        content:
          "Lalita's accessible daily home for memory games, medicine, personal memories, and routines.",
      },
      { property: "og:title", content: "Home | CuCove" },
      {
        property: "og:description",
        content: "A warm daily companion for memory games, medicine, and routines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const { todayTasks, completeTask, isLoading: tasksLoading } = useTasks();
  const { todayLogs, todaySchedules, updateLogStatus, isLoading: medsLoading } = useMedications();
  const { summary: gameSummary } = useGames();

  // Auto-login as Lalita (Patient) if not logged in to give instant friendly access
  useEffect(() => {
    if (!isAuthenticated) {
      demoLogin("patient").catch(() => {});
    }
  }, [isAuthenticated, demoLogin]);

  // Next scheduled medication
  const nextScheduledLog = todayLogs.find((l) => l.status === "scheduled") || todayLogs[0];
  const matchingSchedule = nextScheduledLog
    ? todaySchedules.find((s) => s.id === nextScheduledLog.schedule_id)
    : todaySchedules[0];

  const isMedicineTaken = nextScheduledLog ? nextScheduledLog.status === "taken" : false;

  // Real Progress Calculation
  const totalTasksCount = todayTasks.length;
  const completedTasksCount = todayTasks.filter((t) => t.status === "completed").length;
  const totalMedsCount = todayLogs.length || 1;
  const completedMedsCount = todayLogs.filter((l) => l.status === "taken").length;

  const totalItems = totalTasksCount + totalMedsCount;
  const completedItems = completedTasksCount + completedMedsCount;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Today's formatted date string
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const handleToggleMedicine = async () => {
    if (!nextScheduledLog) {
      toast.info("No active medication log found for today.");
      return;
    }
    const newStatus = isMedicineTaken ? "scheduled" : "taken";
    try {
      await updateLogStatus({
        logId: nextScheduledLog.id,
        status: newStatus,
        notes: newStatus === "taken" ? "Confirmed taken by patient on home screen" : undefined,
      });
      toast.success(
        newStatus === "taken"
          ? "Great job! Medicine marked as taken."
          : "Medicine marked as scheduled.",
      );
    } catch (err: unknown) {
      toast.error(formatApiError(err, "Failed to update medication status"));
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (err: unknown) {
      toast.error(formatApiError(err, "Failed to update task"));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Central Accessible Navigation Header */}
      <NavigationHeader progress={progress} />

      <main className="flex-1 mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12 w-full">
        {/* Reassuring Greeting */}
        <p className="text-xl font-extrabold uppercase tracking-wider text-sun">{todayFormatted}</p>
        <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-cream sm:text-7xl">
          Good morning, {user?.name?.split(" ")[0] || "Lalita"} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-3 text-2xl text-cream/80 max-w-2xl">
          Here is your day. Take it one gentle step at a time.
        </p>

        {/* Cognitive Games Highlight Card */}
        <section className="mt-10" aria-labelledby="games-title">
          <Link
            to="/games"
            className="group grid min-h-96 overflow-hidden rounded-2xl bg-sun text-ink shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-active active:translate-y-0 lg:grid-cols-[1.05fr_.95fr]"
          >
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <div className="flex items-center gap-3 text-xl font-extrabold uppercase">
                <Brain size={32} aria-hidden="true" /> Cognitive Games
              </div>
              <p className="mt-6 text-xl font-bold uppercase tracking-wider">
                TODAY’S BRAIN CHALLENGE
              </p>
              <h2 id="games-title" className="mt-2 font-display text-5xl font-bold sm:text-6xl">
                Memory Match
              </h2>
              <p className="mt-4 max-w-xl text-xl leading-relaxed opacity-90">
                {gameSummary?.total_sessions
                  ? `You've completed ${gameSummary.total_sessions} game sessions with an average accuracy of ${Math.round(gameSummary.average_accuracy)}%. Find matching pairs today!`
                  : "Find the matching card pairs. A calming activity to stimulate recall and keep your memory sharp."}
              </p>
              <span className="mt-8 inline-flex min-h-16 w-fit items-center gap-3 rounded-xl bg-ink px-8 text-xl font-extrabold text-cream shadow-md transition group-hover:bg-surface">
                PLAY NOW <ArrowRight size={24} aria-hidden="true" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-ink/10 p-7 sm:p-10 items-center">
              {["☕", "🌼", "🔑", "☕"].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="flex min-h-32 items-center justify-center rounded-2xl border-4 border-ink/15 bg-cream text-6xl shadow-md transition-transform group-hover:animate-gentle-float"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </Link>
        </section>

        {/* 2-Column Grid: Medication Card & Memories Card */}
        <div className="mt-8 grid gap-7 lg:grid-cols-2">
          {/* Real Backend Medication Card */}
          <article
            className={`relative flex min-h-96 flex-col justify-between rounded-2xl p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-active sm:p-10 ${
              isMedicineTaken ? "bg-tea-confirm text-cream" : "bg-fire text-ink"
            }`}
          >
            <Link
              to="/medication"
              className="absolute inset-0 rounded-2xl z-0"
              aria-label="Open detailed medication page"
            />

            <div className="relative z-10 pointer-events-none flex items-center justify-between">
              <div className="flex items-center gap-3 text-xl font-extrabold uppercase">
                <Pill size={32} aria-hidden="true" /> Medication
              </div>
              <span className="text-sm font-bold opacity-80 uppercase tracking-wider">
                {isMedicineTaken ? "Completed" : "Due Today"}
              </span>
            </div>

            {isMedicineTaken ? (
              <div className="relative z-10 pointer-events-none flex flex-1 flex-col items-center justify-center text-center py-6">
                <span className="flex size-24 items-center justify-center rounded-full bg-cream text-tea-confirm shadow-inner">
                  <Check size={58} strokeWidth={3} aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-5xl font-bold">Taken</h2>
                <p className="mt-2 text-xl max-w-sm">
                  {matchingSchedule?.medicine_name || "Medicine"} is taken. You are right on track!
                </p>
              </div>
            ) : (
              <div className="relative z-10 pointer-events-none flex flex-1 flex-col justify-end py-6">
                <p className="font-display text-6xl font-bold sm:text-7xl">
                  {matchingSchedule?.scheduled_time
                    ? matchingSchedule.scheduled_time.slice(0, 5)
                    : "10:00 AM"}
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  {matchingSchedule?.medicine_name || "Donepezil"} Due
                </h2>
                <p className="mt-2 text-xl opacity-90">
                  {matchingSchedule?.dosage || "5mg - 1 tablet"} · Take with warm water after
                  breakfast
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="cream"
              size="touch"
              className="relative z-20 mt-4 w-full text-xl font-extrabold"
              onClick={handleToggleMedicine}
            >
              {isMedicineTaken ? (
                <>
                  <RefreshCw size={20} className="mr-2" /> MARK AS NOT TAKEN
                </>
              ) : (
                <>
                  TAKE MEDICINE <ArrowRight size={24} aria-hidden="true" />
                </>
              )}
            </Button>
          </article>

          {/* Memories Card */}
          <Link
            to="/memories"
            className="group min-h-96 overflow-hidden rounded-2xl bg-surface text-cream shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-active flex flex-col justify-between"
          >
            <div className="p-7 pb-4 sm:p-10 sm:pb-5">
              <div className="flex items-center gap-3 text-xl font-extrabold uppercase text-sun">
                <Brain size={32} aria-hidden="true" /> My Memories
              </div>
              <h2 className="mt-4 font-display text-4xl font-bold">
                The people and places you love
              </h2>
            </div>
            <img
              src={memoryPhotos}
              alt="Family members and familiar hillside home"
              loading="lazy"
              width={1536}
              height={768}
              className="h-44 w-full object-cover"
            />
            <div className="flex min-h-20 items-center justify-between px-7 text-xl font-extrabold text-sun sm:px-10 border-t border-clay/50">
              <span>EXPLORE MEMORIES</span>
              <ArrowRight
                className="transition-transform group-hover:translate-x-2"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>

        {/* Real Backend Daily Routine Section */}
        <section
          className="mt-8 rounded-2xl bg-surface p-7 shadow-card sm:p-10 border border-clay"
          aria-labelledby="routine-title"
        >
          <div className="flex flex-wrap items-end justify-between gap-5 pb-4 border-b border-clay/60">
            <div>
              <div className="flex items-center gap-3 text-xl font-extrabold uppercase text-sun">
                <CalendarDays size={32} aria-hidden="true" /> Your day
              </div>
              <h2 id="routine-title" className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                Today’s Routine
              </h2>
            </div>
            <Link
              to="/routine"
              className="flex min-h-14 items-center gap-2 rounded-xl px-4 text-lg font-extrabold text-sun hover:bg-clay transition"
            >
              VIEW FULL SCHEDULE <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tasksLoading ? (
              <p className="col-span-full py-8 text-center text-cream/70 text-lg">
                Loading today’s schedule…
              </p>
            ) : todayTasks.length === 0 ? (
              <p className="col-span-full py-8 text-center text-cream/70 text-lg">
                No routine activities scheduled yet for today.
              </p>
            ) : (
              todayTasks.map((task) => {
                const isDone = task.status === "completed";
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    aria-pressed={isDone}
                    className={`min-h-28 h-auto whitespace-normal rounded-xl border-2 p-4 text-left transition duration-200 ${
                      isDone
                        ? "border-tea-confirm bg-tea-confirm text-cream shadow-sm"
                        : "border-clay bg-ink text-cream hover:border-sun/60"
                    }`}
                  >
                    <span className="flex w-full items-start gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          isDone
                            ? "border-cream bg-cream text-tea-confirm"
                            : "border-cream/80 text-cream"
                        }`}
                      >
                        {isDone ? (
                          <Check size={22} strokeWidth={3} />
                        ) : (
                          <span className="size-2 rounded-full bg-cream" />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-lg font-bold truncate ${isDone ? "line-through opacity-85" : ""}`}
                        >
                          {task.title}
                        </span>
                        <span className="mt-1 block text-sm opacity-80 font-medium">
                          {task.scheduled_time.slice(0, 5)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
