"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function OfflineStatusBar() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
        isOnline
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
          : "bg-amber-50 text-amber-800 border border-amber-300"
      }`}
      title={
        isOnline
          ? "You are connected to the internet. Materials are automatically cached locally."
          : "You are offline. All study materials, flashcards, quizzes, and local AI answers are stored on this device."
      }
    >
      {isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">Online &bull; Offline Ready</span>
          <span className="sm:hidden">Online</span>
        </>
      ) : (
        <>
          <WifiOff size={13} className="text-amber-700" />
          <span>Offline Study Mode</span>
        </>
      )}
    </div>
  );
}

