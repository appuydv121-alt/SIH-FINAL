import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  House,
  Bell,
  Check,
  User as UserIcon,
  LogOut,
  Brain,
  Pill,
  CalendarDays,
  Heart,
  BarChart3,
  Stethoscope,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useNotifications } from "../hooks/use-notifications";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import profilePhoto from "@/assets/profile-lalita.jpg";

interface NavigationHeaderProps {
  progress?: number;
}

export function NavigationHeader({ progress }: NavigationHeaderProps) {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: "patient" | "caretaker" | "doctor") => {
    setShowRoleMenu(false);
    await demoLogin(role);
    if (role === "patient") {
      navigate({ to: "/" });
    } else if (role === "caretaker") {
      navigate({ to: "/caregiver" });
    } else if (role === "doctor") {
      navigate({ to: "/doctor" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="border-b border-clay bg-surface text-cream sticky top-0 z-40 shadow-md">
      <nav
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8"
        aria-label="Main navigation"
      >
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 rounded-lg text-cream">
            <span className="flex size-11 items-center justify-center rounded-lg bg-sun text-ink shadow-sm">
              <House size={24} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">CuCove</span>
          </Link>

          {/* Role pill indicator */}
          {isAuthenticated && user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-clay bg-ink/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sun hover:border-sun transition"
                title="Click to switch demo role"
              >
                <span className="size-2 rounded-full bg-tea-confirm animate-pulse" />
                {user.role} view
                <span className="text-cream/50 text-[10px]">▼</span>
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-clay bg-surface p-2 shadow-card z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="px-3 py-1.5 text-xs font-bold text-cream/70 uppercase">
                    Switch Test Role:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("patient")}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      user.role === "patient" ? "bg-sun text-ink" : "text-cream hover:bg-clay"
                    }`}
                  >
                    <UserIcon size={16} /> Patient (Lalita)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("caretaker")}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      user.role === "caretaker" ? "bg-sun text-ink" : "text-cream hover:bg-clay"
                    }`}
                  >
                    <Users size={16} /> Caretaker (Rahul)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("doctor")}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      user.role === "doctor" ? "bg-sun text-ink" : "text-cream hover:bg-clay"
                    }`}
                  >
                    <Stethoscope size={16} /> Doctor (Dr. Sharma)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Navigation Links for Patients / Caregivers */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 text-sm font-bold">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 transition text-cream hover:text-sun hover:bg-clay/50"
              activeProps={{ className: "text-sun bg-clay" }}
            >
              Home
            </Link>
            <Link
              to="/games"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition text-cream hover:text-sun hover:bg-clay/50"
              activeProps={{ className: "text-sun bg-clay" }}
            >
              <Brain size={16} /> Games
            </Link>
            <Link
              to="/medication"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition text-cream hover:text-sun hover:bg-clay/50"
              activeProps={{ className: "text-sun bg-clay" }}
            >
              <Pill size={16} /> Medicine
            </Link>
            <Link
              to="/routine"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition text-cream hover:text-sun hover:bg-clay/50"
              activeProps={{ className: "text-sun bg-clay" }}
            >
              <CalendarDays size={16} /> Routine
            </Link>
            <Link
              to="/memories"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition text-cream hover:text-sun hover:bg-clay/50"
              activeProps={{ className: "text-sun bg-clay" }}
            >
              <Heart size={16} /> Memories
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition text-cream hover:text-sun hover:bg-clay/50"
              activeProps={{ className: "text-sun bg-clay" }}
            >
              <BarChart3 size={16} /> AI Analytics
            </Link>

            {user?.role === "caretaker" && (
              <Link
                to="/caregiver"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-tea-confirm/30 text-cream hover:bg-tea-confirm transition border border-tea-confirm"
              >
                <Users size={16} /> Caregiver Hub
              </Link>
            )}

            {user?.role === "doctor" && (
              <Link
                to="/doctor"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-tea-confirm/30 text-cream hover:bg-tea-confirm transition border border-tea-confirm"
              >
                <Stethoscope size={16} /> Doctor Portal
              </Link>
            )}
          </div>
        )}

        {/* Right side: Progress, Notification bell, User info */}
        <div className="flex items-center gap-4">
          {progress !== undefined && (
            <div className="hidden sm:block w-36 md:w-48">
              <div className="mb-1 flex justify-between text-xs font-bold text-cream">
                <span>Today</span>
                <span>{progress}%</span>
              </div>
              <Progress
                value={progress}
                aria-label={`${progress}% complete`}
                className="h-2 bg-clay [&>div]:bg-sun"
              />
            </div>
          )}

          {/* Notifications button */}
          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                className="relative flex size-10 items-center justify-center rounded-lg border border-clay bg-ink text-cream hover:border-sun transition"
                aria-label="View notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-fire text-[11px] font-extrabold text-cream">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-clay bg-surface p-4 shadow-card z-50 text-cream">
                  <div className="flex items-center justify-between pb-3 border-b border-clay">
                    <h3 className="font-display font-bold text-lg">Notifications</h3>
                    <span className="text-xs text-sun font-semibold">
                      {notifications.length} alerts
                    </span>
                  </div>
                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-sm text-cream/70">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-lg border text-sm transition flex items-start justify-between gap-3 ${
                            n.status === "read"
                              ? "border-clay/50 bg-ink/40 text-cream/70"
                              : "border-sun/60 bg-ink text-cream shadow-sm"
                          }`}
                        >
                          <div>
                            <p className="font-bold">{n.title}</p>
                            <p className="mt-1 text-xs opacity-90">{n.message}</p>
                          </div>
                          {n.status !== "read" && (
                            <button
                              type="button"
                              onClick={() => markAsRead(n.id)}
                              className="size-7 shrink-0 flex items-center justify-center rounded bg-tea-confirm text-cream hover:bg-tea-confirm/80 transition"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-sm font-bold text-cream">{user.name}</span>
              <img
                src={profilePhoto}
                alt={user.name}
                className="size-10 rounded-full border-2 border-sun object-cover"
              />
              <button
                type="button"
                onClick={handleLogout}
                className="flex size-10 items-center justify-center rounded-lg border border-clay bg-ink text-cream hover:bg-fire/80 transition"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="cream" size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
