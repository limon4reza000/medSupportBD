"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const OfflineIndicator: React.FC = () => {
  const { isOnline, setIsOnline, offlineQueueCount, syncOfflineQueue } = useApp();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      syncOfflineQueue();
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline, syncOfflineQueue]);

  // When back online, show brief toast
  if (showRestoredNotice && isOnline) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 duration-300">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#4F46E5] text-white shadow-xl text-xs font-bold border border-indigo-400">
          <CheckCircle2 className="w-4 h-4 text-indigo-200" />
          <span>Connection restored! Central sync complete.</span>
        </div>
      </div>
    );
  }

  // When offline
  if (!isOnline) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300 max-w-[92vw] sm:max-w-md w-full">
        <div className="bg-amber-600/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500/80 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <span>Offline Mode Active</span>
                {offlineQueueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                    {offlineQueueCount} queued
                  </span>
                )}
              </div>
              <div className="text-[11px] text-amber-100 truncate">
                Serving cached 41k catalog. Orders store locally.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (navigator.onLine) {
                setIsOnline(true);
                syncOfflineQueue();
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white text-amber-900 font-bold text-[11px] hover:bg-amber-50 transition-colors shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
            title="Check connection and synchronize"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
