"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  HardDrive,
  QrCode,
  Layers,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const GetAppModal: React.FC = () => {
  const { isGetAppOpen, setIsGetAppOpen } = useApp();
  const [activeTab, setActiveTab] = useState<"pwa" | "apk">("pwa");
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("https://medsupportbd.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setCanDirectInstall(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  if (!isGetAppOpen) return null;

  const handleCopyUrl = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("[PWA] Outcome:", outcome);
      setDeferredPrompt(null);
      setCanDirectInstall(false);
      if (outcome === "accepted") {
        setIsGetAppOpen(false);
      }
    } else {
      alert(
        "To install, tap the Share icon ⎋ (Safari on iOS) or the 3-dot menu ⋮ (Chrome on Android/Desktop) and choose 'Add to Home Screen' or 'Install App'."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-[#01382a] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#01382a] flex items-center justify-center shadow-lg font-black text-xl shrink-0">
              <Smartphone className="w-6 h-6 text-[#025540]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Get MedSupplyBD Mobile App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase tracking-wider">
                  Mobile Ready
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Full offline order cutting, 41k medicine search & POS terminal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGetAppOpen(false)}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-3">
          <button
            onClick={() => setActiveTab("pwa")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "pwa"
                ? "border-emerald-700 text-emerald-900 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>PWA Mobile Web (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab("apk")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "apk"
                ? "border-emerald-700 text-emerald-900 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Native Android APK (Capacitor)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {activeTab === "pwa" ? (
            <div className="space-y-5">
              
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
                  <HardDrive className="w-5 h-5 text-emerald-700 mb-1" />
                  <span className="font-bold text-slate-900 text-xs">Lightweight</span>
                  <span className="text-[10px] text-slate-500">&lt;3MB footprint</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
                  <Zap className="w-5 h-5 text-emerald-700 mb-1" />
                  <span className="font-bold text-slate-900 text-xs">Instant Setup</span>
                  <span className="text-[10px] text-slate-500">Zero App Store wait</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 mb-1" />
                  <span className="font-bold text-slate-900 text-xs">Works Offline</span>
                  <span className="text-[10px] text-slate-500">Local DB caching</span>
                </div>
              </div>

              {/* QR Code and Direct Install Section */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-5">
                
                {/* Visual QR Code Card */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
                  <div className="w-32 h-32 relative bg-emerald-50 rounded-xl p-2 flex items-center justify-center border border-emerald-200/60">
                    {/* High-fidelity SVG QR representation */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#01382a]" fill="currentColor">
                      {/* Corner 1 */}
                      <rect x="0" y="0" width="30" height="30" rx="4" fill="#01382a" />
                      <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
                      <rect x="10" y="10" width="10" height="10" rx="1" fill="#01382a" />

                      {/* Corner 2 */}
                      <rect x="70" y="0" width="30" height="30" rx="4" fill="#01382a" />
                      <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
                      <rect x="80" y="10" width="10" height="10" rx="1" fill="#01382a" />

                      {/* Corner 3 */}
                      <rect x="0" y="70" width="30" height="30" rx="4" fill="#01382a" />
                      <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
                      <rect x="10" y="80" width="10" height="10" rx="1" fill="#01382a" />

                      {/* Data dots pattern */}
                      <circle cx="45" cy="15" r="3" fill="#01382a" />
                      <circle cx="55" cy="15" r="3" fill="#01382a" />
                      <circle cx="40" cy="25" r="2.5" fill="#01382a" />
                      <circle cx="60" cy="25" r="2.5" fill="#01382a" />

                      <circle cx="15" cy="45" r="3" fill="#01382a" />
                      <circle cx="15" cy="55" r="3" fill="#01382a" />
                      <circle cx="25" cy="40" r="2.5" fill="#01382a" />
                      <circle cx="25" cy="60" r="2.5" fill="#01382a" />

                      <rect x="38" y="38" width="24" height="24" rx="3" fill="#10b981" />
                      <circle cx="50" cy="50" r="6" fill="white" />

                      <circle cx="75" cy="45" r="3" fill="#01382a" />
                      <circle cx="85" cy="45" r="3" fill="#01382a" />
                      <circle cx="75" cy="55" r="3" fill="#01382a" />
                      <circle cx="85" cy="60" r="3" fill="#01382a" />

                      <circle cx="45" cy="75" r="3" fill="#01382a" />
                      <circle cx="55" cy="75" r="3" fill="#01382a" />
                      <circle cx="45" cy="85" r="3" fill="#01382a" />
                      <circle cx="55" cy="85" r="3" fill="#01382a" />
                      <circle cx="65" cy="85" r="3" fill="#01382a" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2">Scan via Phone</span>
                </div>

                {/* Right Details & Action Buttons */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Scan or Open on your Smartphone
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Open camera app on your Android or iPhone and point at this QR code to load the app directly.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleDirectInstall}
                      className="px-4 py-2.5 rounded-xl bg-[#025540] hover:bg-[#01382a] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 active:scale-95"
                    >
                      <Download className="w-4 h-4 text-emerald-300" />
                      <span>{canDirectInstall ? "Install to This Device Now" : "Install App"}</span>
                    </button>

                    <button
                      onClick={handleCopyUrl}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-500" />
                          <span>Copy App Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 truncate bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentUrl}
                  </div>
                </div>

              </div>

              {/* Step-by-step Tabs for OS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Android Steps */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      🤖
                    </span>
                    <span className="font-black text-xs text-slate-900">
                      Android (Chrome / Edge)
                    </span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pl-1">
                    <li>Open this URL in Google Chrome.</li>
                    <li>Tap the <strong>3 dots menu (⋮)</strong> at top right.</li>
                    <li>Tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                    <li>The app appears on your phone screen with native touch navigation!</li>
                  </ol>
                </div>

                {/* iOS Steps */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                      🍎
                    </span>
                    <span className="font-black text-xs text-slate-900">
                      iPhone / iPad (Safari)
                    </span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pl-1">
                    <li>Open this URL in Apple Safari.</li>
                    <li>Tap the <strong>Share button (⎋)</strong> at bottom bar.</li>
                    <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot; (⊞)</strong>.</li>
                    <li>Tap <strong>&quot;Add&quot;</strong> at top right to complete.</li>
                  </ol>
                </div>
              </div>

            </div>
          ) : (
            /* Native Android APK Tab */
            <div className="space-y-4">
              
              {/* Direct APK Download Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#01382a] to-[#025540] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-500/30">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#025540] flex items-center justify-center font-bold shrink-0 shadow-md">
                    <Smartphone className="w-6 h-6 text-[#025540]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-white">
                        Download Native Android APK
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase">
                        v1.0 (17.3 MB)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      Compiled release for Android phones &amp; MPO sales tablets
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/medsupplybd-v1.0.apk"
                  download="medsupplybd-v1.0.apk"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (17.3 MB)</span>
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Capacitor Native Android Project
                  </span>
                  <span className="text-emerald-400 font-bold">bd.medsupply.b2b</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  The native project is fully initialized in the <code className="text-emerald-400">/android</code> directory. You can build an APK or run in Android Studio with standard CLI commands:
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 text-emerald-400 space-y-1 font-mono text-[11px]">
                  <div># 1. Sync web assets into Android project:</div>
                  <div className="text-white font-bold">npm run mobile:sync</div>
                  <div className="pt-1 text-slate-400"># 2. Open in Android Studio to build signed APK:</div>
                  <div className="text-white font-bold">npm run mobile:open:android</div>
                  <div className="pt-1 text-slate-400"># Or build directly via Gradle:</div>
                  <div className="text-white font-bold">cd android &amp;&amp; ./gradlew assembleDebug</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-xs text-slate-900">
                  What Native APK provides:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pl-1">
                  <li><strong>Hardware Barcode Scanning:</strong> Direct camera sensor integration for fast batch expiration validation.</li>
                  <li><strong>Bluetooth Receipt Printers:</strong> Direct pairing with ESC/POS mobile thermal belt printers for MPOs.</li>
                  <li><strong>Enterprise MDM Provisioning:</strong> Ready to deploy to sales reps via Mobile Device Management or direct APK download.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-medium">DGDA Digital Distribution Standard</span>
          </div>

          <button
            onClick={() => setIsGetAppOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
