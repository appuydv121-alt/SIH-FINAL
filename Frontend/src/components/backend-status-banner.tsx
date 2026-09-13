import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { checkBackendHealth } from "../api/client";

export function BackendStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const checkStatus = async () => {
    setIsChecking(true);
    const health = await checkBackendHealth();
    setIsOnline(health.ok);
    setStatusMessage(health.message);
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // If online or not checked yet, show nothing (or show subtle badge when online)
  if (isOnline === null || isOnline === true) {
    return null;
  }

  return (
    <aside
      aria-label="Backend status"
      className="w-full bg-fire/20 border-b border-fire/50 text-cream px-4 py-2.5 text-xs sm:text-sm font-medium transition-all"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-fire shrink-0" />
          <span>
            <strong>SmritiSetu Server Offline:</strong> Unable to connect to backend service.{" "}
            <span className="opacity-80">({statusMessage || "Connection refused"})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] opacity-75 hidden sm:inline">
            Ensure backend is running on port 8000
          </span>
          <button
            type="button"
            onClick={checkStatus}
            disabled={isChecking}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-clay text-cream hover:bg-clay text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={isChecking ? "animate-spin text-sun" : "text-sun"} />
            {isChecking ? "Checking…" : "Retry"}
          </button>
        </div>
      </div>
    </aside>
  );
}
