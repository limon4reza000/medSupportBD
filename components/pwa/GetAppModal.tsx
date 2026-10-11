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
  FileDown,
  Sparkles,
  ArrowRight,
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
                  Android APK &bull; iOS &bull; Web
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Native order cutting, 41,300+ SKU medicine catalog &amp; offline field POS
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGetAppOpen(false)}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
            id="close-get-app-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 sm:px-6 pt-3 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("all")}
            id="tab-quick-download"
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
            id="tab-android-apk"
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
            id="tab-ios"
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "ios"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🍎</span>
            <span>iPhone / iPad (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab("pwa")}
            id="tab-browser-pwa"
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
          
          {/* =============================================================== */}
          {/* TAB 1: ALL / QUICK DOWNLOAD (DEFAULT)                           */}
          {/* =============================================================== */}
          {activeTab === "all" && (
            <div className="space-y-4">
              
              {/* PRIMARY ACTION 1: DIRECT ANDROID APK DOWNLOAD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#01382a] via-[#025540] to-emerald-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-emerald-400/30">
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#01382a] flex items-center justify-center font-bold shrink-0 shadow-md text-2xl">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm sm:text-base text-white">
                        Android APK Download
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase">
                        v1.0 (17.3 MB)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      Direct standalone installer for all Android phones, tablets &amp; field MPO terminals
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/medsupplybd-v1.0.apk"
                  download="medsupplybd-v1.0.apk"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                  id="direct-apk-download-btn"
                >
                  <Download className="w-4 h-4 text-[#01382a]" />
                  <span>Download APK (17.3 MB)</span>
                </a>
              </div>

              {/* PRIMARY ACTION 2: DIRECT APPLE IOS (IPHONE / IPAD) CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col gap-3 shadow-lg border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0 shadow-md text-2xl border border-white/20">
                      🍎
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm sm:text-base text-white">
                          Apple iOS for iPhone &amp; iPad
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[10px] font-black uppercase">
                          IPA &bull; Profile &bull; Safari
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Download native iOS package, 1-click configuration profile, or install in Safari
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 iOS Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Option 2A: Direct IPA Download */}
                  <a
                    href="/downloads/medsupplybd-v1.0.ipa"
                    download="medsupplybd-v1.0.ipa"
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
                    id="direct-ipa-download-btn"
                    title="Download native iOS .ipa package for AltStore, Sideloadly or TestFlight"
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-white group-hover:text-emerald-300">
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Download iOS IPA</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">12.8 MB (AltStore/Sideload)</span>
                  </a>

                  {/* Option 2B: 1-Click iOS Profile */}
                  <a
                    href="/downloads/medsupplybd-ios.mobileconfig"
                    download="medsupplybd-ios.mobileconfig"
                    className="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
                    id="direct-mobileconfig-download-btn"
                    title="1-Click iOS Configuration Profile for instant Home Screen install"
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-300 group-hover:text-emerald-200">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1-Click iOS Profile</span>
                    </div>
                    <span className="text-[10px] text-emerald-200/70 mt-0.5">Direct iPhone Settings</span>
                  </a>

                  {/* Option 2C: Safari Web App */}
                  <button
                    onClick={handleCopyUrl}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
                    title="Copy URL to open in Apple Safari"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200 group-hover:text-white">
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Safari Guide</span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">Share ⎋ &rarr; Add to Home</span>
                  </button>
                </div>
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
                      Instant offline operation on Chrome, Edge, and Android without downloading files.
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

          {/* =============================================================== */}
          {/* TAB 2: DEDICATED ANDROID APK                                    */}
          {/* =============================================================== */}
          {activeTab === "android" && (
            <div className="space-y-4">
              
              {/* Main Android Download Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#01382a] via-[#025540] to-emerald-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-emerald-400/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#01382a] flex items-center justify-center font-bold shrink-0 shadow-md text-3xl">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-white">
                        MedSupplyBD Native Android APK
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase">
                        v1.0 Release
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-1">
                      Direct standalone package. No Google Play account required.
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/medsupplybd-v1.0.apk"
                  download="medsupplybd-v1.0.apk"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                  id="tab-android-download-btn"
                >
                  <Download className="w-5 h-5 text-[#01382a]" />
                  <span>Download APK (17.3 MB)</span>
                </a>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>APK Specifications &amp; Build Metadata</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Package Name</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">bd.medsupply.b2b</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Min Android</span>
                    <span className="font-bold text-slate-800">Android 8.0+ (API 26)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Target SDK</span>
                    <span className="font-bold text-slate-800">Android 15 (API 35)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">File Size</span>
                    <span className="font-bold text-emerald-700">17.3 MB</span>
                  </div>
                </div>
              </div>

              {/* 3-Step Install Guide */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h4 className="font-bold text-xs text-slate-900">
                  How to Install APK on Any Android Device (30 Seconds):
                </h4>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside pl-1">
                  <li>
                    Tap <strong>Download APK (17.3 MB)</strong> above. The file <code className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">medsupplybd-v1.0.apk</code> will download to your phone.
                  </li>
                  <li>
                    When download finishes, tap the notification or open your phone&apos;s <strong>Files / Downloads</strong> app.
                  </li>
                  <li>
                    Tap <strong>Install</strong>. If your phone asks for permission, tap <em>Settings</em> and toggle <em>&quot;Allow from this source&quot;</em>.
                  </li>
                  <li>
                    MedSupplyBD will open immediately with full offline medicine catalog, camera barcode scanning &amp; order draft storage!
                  </li>
                </ol>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: DEDICATED APPLE IOS (IPHONE & IPAD)                      */}
          {/* =============================================================== */}
          {activeTab === "ios" && (
            <div className="space-y-4">
              
              {/* iOS Downloads Action Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col gap-4 shadow-xl border border-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0 shadow-md text-3xl border border-white/20">
                      🍎
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-base text-white">
                          MedSupplyBD for Apple iPhone &amp; iPad
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase">
                          iOS 15 to 18+
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Download native iOS package (.ipa) or install directly via Apple configuration profile
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* BUTTON 1: NATIVE IPA DOWNLOAD */}
                  <a
                    href="/downloads/medsupplybd-v1.0.ipa"
                    download="medsupplybd-v1.0.ipa"
                    className="p-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-between gap-2 active:scale-95 group"
                    id="tab-ios-download-ipa-btn"
                  >
                    <div className="flex items-center gap-2.5">
                      <Apple className="w-5 h-5 text-slate-900 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="font-black text-slate-900">Download iOS IPA</div>
                        <div className="text-[10px] font-normal text-slate-500">Native bundle (12.8 MB)</div>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-emerald-700" />
                  </a>

                  {/* BUTTON 2: 1-CLICK CONFIGURATION PROFILE */}
                  <a
                    href="/downloads/medsupplybd-ios.mobileconfig"
                    download="medsupplybd-ios.mobileconfig"
                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#025540] hover:from-emerald-500 hover:to-[#01382a] text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-between gap-2 active:scale-95 group border border-emerald-400/30"
                    id="tab-ios-download-profile-btn"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="font-black text-white">1-Click iOS Profile</div>
                        <div className="text-[10px] font-normal text-emerald-200">Apple WebClip Profile</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-200" />
                  </a>

                </div>
              </div>

              {/* METHOD 1: 1-CLICK PROFILE INSTALL GUIDE */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-emerald-950 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center text-[11px] font-black">
                      A
                    </span>
                    Method 1: Instant Install via iOS Profile (Fastest &bull; No Computer Required)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed">
                  Apple allows certified WebClip profiles to install the MedSupplyBD app icon directly onto your iPhone home screen:
                </p>
                <ol className="text-xs text-emerald-950 space-y-1.5 list-decimal list-inside pl-1 font-medium">
                  <li>Tap <strong>1-Click iOS Profile</strong> above while browsing in <strong>Apple Safari</strong>.</li>
                  <li>Tap <strong>Allow</strong> when prompted: <em>&quot;This website is trying to download a configuration profile&quot;</em>.</li>
                  <li>Open iPhone <strong>Settings ⚙️</strong> &rarr; tap <strong>&quot;Profile Downloaded&quot;</strong> near the top &rarr; tap <strong>Install</strong>.</li>
                  <li>The MedSupplyBD app icon will appear immediately on your iPhone Home Screen and launch in full-screen standalone mode!</li>
                </ol>
              </div>

              {/* METHOD 2: SIDELOADING VIA IPA */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[11px] font-black">
                    B
                  </span>
                  Method 2: Sideloading Native IPA Bundle (`.ipa`)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For users who want to sideload or deploy to enterprise/test devices via USB or wireless:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside pl-1">
                  <li><strong>Sideloadly / AltStore:</strong> Download <code className="font-mono text-slate-800 font-bold bg-slate-100 px-1 py-0.5 rounded">medsupplybd-v1.0.ipa</code>, drag into Sideloadly or AltStore, enter your Apple ID, and install directly to your connected iPhone.</li>
                  <li><strong>TrollStore / Scarlet / Enterprise:</strong> Direct 1-tap installation if your iOS device supports TrollStore or MDM provisioning.</li>
                </ul>
              </div>

              {/* METHOD 3: SAFARI ADD TO HOME SCREEN */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[11px] font-black">
                      C
                    </span>
                    Method 3: Safari &quot;Add to Home Screen&quot;
                  </h4>
                  <button
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    <span>{copied ? "Copied" : "Copy Safari Link"}</span>
                  </button>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pl-1">
                  <li>Open <code className="font-mono text-emerald-800 font-bold">{currentUrl}</code> in <strong>Apple Safari</strong>.</li>
                  <li>Tap the <strong>Share button (⎋)</strong> at the bottom center of the Safari toolbar.</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot; (⊞)</strong>.</li>
                  <li>Tap <strong>&quot;Add&quot;</strong> in the top-right corner.</li>
                </ol>
              </div>

              {/* Developer & GitHub Actions Cloud Builder */}
              <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Xcode &amp; GitHub Actions Cloud Build
                  </span>
                  <span className="text-emerald-400 font-bold">bd.medsupply.b2b</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Native iOS Xcode project is located at <code className="text-emerald-400">/ios/App/App.xcodeproj</code>. Automated cloud IPA builds run on every Git push via <code className="text-emerald-400">.github/workflows/ios-build.yml</code> on GitHub macOS runners!
                </p>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: BROWSER PWA DETAILS                                      */}
          {/* =============================================================== */}
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
            <span className="font-medium">DGDA Digital Distribution Standard &bull; Android &amp; iOS Verified</span>
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
