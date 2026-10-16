"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const PwaRegister: React.FC = () => {
  const { setIsGetAppOpen } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).__pwa_install_prompt = e;
      setDeferredPrompt(e);
      window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: e }));
      // If not dismissed previously in this session
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if running in standalone mode (already installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setIsGetAppOpen(true);
      setShowInstallPrompt(false);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] Install prompt outcome:", outcome);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-18 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1E1743] border border-indigo-400/40 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white text-[#241B52] flex items-center justify-center shrink-0 shadow-md p-1">
            <img
              src="/images/sidebar-logo.png"
              alt="MedGo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
              <span>Install MedGo App</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 text-[9px] font-bold">
                PWA / Android
              </span>
            </h4>
            <p className="text-[11px] text-indigo-200/90 truncate mt-0.5">
              1-click MPO order cutting & fast offline catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss install prompt"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
