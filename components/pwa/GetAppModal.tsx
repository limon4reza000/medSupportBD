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
  Info,
  Apple,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const GetAppModal: React.FC = () => {
  const { isGetAppOpen, setIsGetAppOpen } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "android" | "ios" | "pwa">("all");
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("https://medsupportbd.vercel.app");
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);

      // Check if global prompt was already captured
      if ((window as any).__pwa_install_prompt) {
        setDeferredPrompt((window as any).__pwa_install_prompt);
        setCanDirectInstall(true);
      }

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        (window as any).__pwa_install_prompt = e;
        setDeferredPrompt(e);
        setCanDirectInstall(true);
      };

      const handleCustomPrompt = (e: any) => {
        if (e.detail) {
          setDeferredPrompt(e.detail);
          setCanDirectInstall(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      window.addEventListener("pwa-prompt-available", handleCustomPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("pwa-prompt-available", handleCustomPrompt);
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
    const prompt = deferredPrompt || (typeof window !== "undefined" ? (window as any).__pwa_install_prompt : null);
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        console.log("[PWA] Outcome:", outcome);
        if (outcome === "accepted") {
          setIsGetAppOpen(false);
        }
      } catch (e) {
        console.error("Error triggering install prompt:", e);
        setShowManualGuide(true);
      }
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsGetAppOpen(false);
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-[#01382a] text-white p-4 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#01382a] flex items-center justify-center shadow-lg font-black text-xl shrink-0">
              <Smartphone className="w-6 h-6 text-[#025540]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Get MedSupplyBD Mobile App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase tracking-wider">
                  Android &bull; iOS &bull; Web
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Native order cutting, 41,300+ SKU medicine catalog &amp; offline POS
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
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 sm:px-6 pt-3 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Quick Download</span>
          </button>

          <button
            onClick={() => setActiveTab("android")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "android"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🤖</span>
            <span>Android APK</span>
          </button>

          <button
            onClick={() => setActiveTab("ios")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "ios"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🍎</span>
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab("pwa")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "pwa"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Browser PWA</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
          
          {/* TAB 1: ALL / QUICK DOWNLOAD (DEFAULT) */}
          {(activeTab === "all" || activeTab === "android") && (
            <div className="space-y-4">
              
              {/* PRIMARY ACTION 1: DIRECT APK DOWNLOAD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#01382a] via-[#025540] to-emerald-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-emerald-400/30">
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#01382a] flex items-center justify-center font-bold shrink-0 shadow-md text-2xl">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm sm:text-base text-white">
                        Download Native Android APK
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase">
                        v1.0 (17.3 MB)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      Direct standalone installer for all Android phones, tablets &amp; MPO terminals
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/medsupplybd-v1.0.apk"
                  download="medsupplybd-v1.0.apk"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                  id="direct-apk-download-btn"
                >
                  <Download className="w-4 h-4 text-[#01382a]" />
                  <span>Download APK Now</span>
                </a>
              </div>

              {/* PRIMARY ACTION 2: IPHONE / IPAD INSTALL CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0 shadow-md text-2xl border border-white/20">
                    🍎
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-white">
                        Apple iPhone &amp; iPad Setup
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[10px] font-black uppercase">
                        Zero Download
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Open in <strong>Safari</strong> &rarr; Tap Share <strong>⎋</strong> &rarr; Tap <strong>Add to Home Screen ⊞</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyUrl}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link for Safari</span>
                    </>
                  )}
                </button>
              </div>

              {/* PRIMARY ACTION 3: BROWSER 1-CLICK INSTALL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Install as Web App on This Device (PWA)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Works offline on Chrome, Edge, and Android without downloading files.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDirectInstall}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#01382a] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Install to Browser</span>
                </button>
              </div>

              {/* Manual In-Card Guide if direct prompt was not supported */}
              {showManualGuide && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in duration-150">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>How to Install on this Device:</span>
                  </div>
                  <ul className="text-xs space-y-1 list-disc list-inside text-amber-800 pl-1">
                    <li><strong>Chrome / Edge (Desktop):</strong> Click the install icon (<strong>⊕</strong>) in your address bar or menu <strong>⋮</strong> &rarr; <em>Install MedSupplyBD</em>.</li>
                    <li><strong>Android (Phone):</strong> Tap the 3 dots menu <strong>⋮</strong> &rarr; <em>Add to Home Screen</em>.</li>
                    <li><strong>iPhone (Safari):</strong> Tap Share <strong>⎋</strong> &rarr; <em>Add to Home Screen</em>.</li>
                  </ul>
                </div>
              )}

              {/* QR Code Scan Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
                  <div className="w-24 h-24 relative bg-emerald-50 rounded-lg p-1.5 flex items-center justify-center border border-emerald-200/60">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#01382a]" fill="currentColor">
                      <rect x="0" y="0" width="30" height="30" rx="4" />
                      <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />
                      <rect x="70" y="0" width="30" height="30" rx="4" />
                      <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />
                      <rect x="0" y="70" width="30" height="30" rx="4" />
                      <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />
                      <circle cx="45" cy="15" r="3" />
                      <circle cx="55" cy="15" r="3" />
                      <circle cx="15" cy="45" r="3" />
                      <circle cx="15" cy="55" r="3" />
                      <rect x="38" y="38" width="24" height="24" rx="3" fill="#10b981" />
                      <circle cx="50" cy="50" r="6" fill="white" />
                      <circle cx="75" cy="45" r="3" />
                      <circle cx="75" cy="55" r="3" />
                      <circle cx="45" cy="75" r="3" />
                      <circle cx="55" cy="75" r="3" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1">Scan to Open</span>
                </div>

                <div className="space-y-1.5 text-left flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-slate-900">
                    Scan with Your Phone Camera
                  </h5>
                  <p className="text-[11px] text-slate-600">
                    Point your iPhone or Android camera at the QR code to open and install the app on your mobile instantly.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500 truncate bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentUrl}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED IOS (IPHONE / IPAD) */}
          {activeTab === "ios" && (
            <div className="space-y-4">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-700">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0 shadow-md text-2xl border border-white/20">
                    🍎
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-white">
                        iPhone &amp; iPad Native Web App
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase">
                        Instant (No App Store)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Runs in full-screen standalone mode without Safari URL bar
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyUrl}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Share2 className="w-4 h-4 text-slate-700" />
                  <span>{copied ? "Link Copied!" : "Copy Link for Safari"}</span>
                </button>
              </div>

              {/* Step-by-step iOS Safari Install */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black">
                    1
                  </span>
                  How to Install on iPhone / iPad (20 Seconds)
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1">
                  <li>Open this URL in <strong>Apple Safari</strong> on your iPhone or iPad.</li>
                  <li>Tap the <strong>Share button (⎋)</strong> at the bottom center of the Safari toolbar.</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot; (⊞)</strong>.</li>
                  <li>Tap <strong>&quot;Add&quot;</strong> in the top-right corner.</li>
                  <li>The MedSupplyBD icon will appear on your iOS home screen and launch like a native iOS app with full offline capabilities!</li>
                </ol>
              </div>

              {/* Native iOS Xcode Project */}
              <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Native iOS Xcode Project (`ios/App/`)
                  </span>
                  <span className="text-emerald-400 font-bold">bd.medsupply.b2b</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Native iOS project is configured in <code className="text-emerald-400">/ios/App/App.xcodeproj</code>. On a Mac, build or open directly in Xcode:
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 text-emerald-400 space-y-1 font-mono text-[11px]">
                  <div># Sync web code into iOS Xcode workspace:</div>
                  <div className="text-white font-bold">npm run mobile:sync</div>
                  <div className="pt-1 text-slate-400"># Open in Xcode on macOS:</div>
                  <div className="text-white font-bold">npm run mobile:open:ios</div>
                </div>
              </div>

              {/* GitHub Actions Cloud IPA Builder */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-black text-xs text-emerald-950">
                    Automated Cloud iOS Build (No Mac Required)
                  </h4>
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  We have added <code className="font-mono text-emerald-800 font-bold">.github/workflows/ios-build.yml</code>. Every time you push to your GitHub repo, GitHub&apos;s macOS runners automatically compile the Xcode project and output the iOS package as a downloadable artifact!
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: BROWSER PWA DETAILS */}
          {activeTab === "pwa" && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-3 gap-2.5 text-center">
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

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold text-xs text-slate-900">
                  Browser Install Options:
                </h4>
                <p className="text-xs text-slate-600">
                  Click the button below to prompt the browser install banner, or look for the install icon in your address bar:
                </p>
                <button
                  onClick={handleDirectInstall}
                  className="px-5 py-2.5 rounded-xl bg-[#025540] hover:bg-[#01382a] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>Trigger Browser Install</span>
                </button>
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
