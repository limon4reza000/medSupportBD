"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  Check,
  Search,
  ShoppingCart,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Store,
  Factory,
  Truck,
  UserCheck,
  Calendar,
  FileText,
  Camera,
  ExternalLink,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Download,
  CheckCircle2,
} from "lucide-react";
import { UserRole } from "@/types/domain";

type DeviceModel = "IPHONE_16_PRO" | "SAMSUNG_S25" | "CLEAN_FRAME";
type ScreenTab = "REFERENCE_SCHEDULE" | "ROLE_REGISTRATION" | "ORDER_CUTTING_POS" | "LIVE_DELIVERY_TRACK";

export default function MobilePrototypePage() {
  const [deviceModel, setDeviceModel] = useState<DeviceModel>("IPHONE_16_PRO");
  const [activeScreen, setActiveScreen] = useState<ScreenTab>("REFERENCE_SCHEDULE");
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [contentMode, setContentMode] = useState<"EXACT_IMAGE" | "MEDGO_HEALTHCARE">("EXACT_IMAGE");

  // Reference Screen State
  const [selectedDay, setSelectedDay] = useState<number>(4); // Default: Sun 4
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false);

  // Mobile Registration Demo State
  const [regStep, setRegStep] = useState<number>(1);
  const [regRole, setRegRole] = useState<UserRole>(UserRole.PHARMACY_OWNER);
  const [regPhone, setRegPhone] = useState("01711223344");
  const [regVerified, setRegVerified] = useState(false);
  const [regOtp, setRegOtp] = useState(["", "", "", "", "", ""]);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [hasCameraPhoto, setHasCameraPhoto] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // POS State
  const [cartItems, setCartItems] = useState([
    { name: "Napa Extra 500mg", qty: 10, bonus: 1, price: 350 },
    { name: "Seclo 20mg Capsule", qty: 5, bonus: 0, price: 420 },
  ]);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "BKASH" | "NAGAD" | "BANK">("BKASH");

  const daysOfWeek = [
    { day: "SAT", date: 3, hasDot: false },
    { day: "SUN", date: 4, hasDot: true },
    { day: "MON", date: 5, hasDot: true },
    { day: "TUE", date: 6, hasDot: true },
    { day: "WED", date: 7, hasDot: true },
    { day: "THU", date: 8, hasDot: true },
    { day: "FRI", date: 9, hasDot: false },
  ];

  return (
    <div className="min-h-screen bg-[#0F0C20] text-slate-100 flex flex-col selection:bg-[#4F46E5] selection:text-white">
      
      {/* =================================================================== */}
      {/* 1. TOP SIMULATOR CONTROL BAR                                        */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-50 bg-[#171330]/90 backdrop-blur-md border-b border-indigo-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Brand & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-indigo-200 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to MedSupplyBD</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-[#FB923C] animate-pulse" />
              <span className="text-white">MedGo Mobile Device Simulator</span>
              <span className="text-[10px] font-bold text-[#FB923C] bg-[#FB923C]/10 px-2 py-0.5 rounded-full border border-[#FB923C]/30">
                Hi-Fi Prototype
              </span>
            </div>
          </div>

          {/* Center: Interactive Screen Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/10 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveScreen("REFERENCE_SCHEDULE")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeScreen === "REFERENCE_SCHEDULE"
                  ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reference UI (Schedule)</span>
            </button>

            <button
              onClick={() => setActiveScreen("ROLE_REGISTRATION")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeScreen === "ROLE_REGISTRATION"
                  ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mobile Onboarding</span>
            </button>

            <button
              onClick={() => setActiveScreen("ORDER_CUTTING_POS")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeScreen === "ORDER_CUTTING_POS"
                  ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Mobile POS Billing</span>
            </button>

            <button
              onClick={() => setActiveScreen("LIVE_DELIVERY_TRACK")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeScreen === "LIVE_DELIVERY_TRACK"
                  ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Live Delivery GPS</span>
            </button>
          </div>

          {/* Right: Device Frame & Zoom Controls */}
          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setDeviceModel("IPHONE_16_PRO")}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceModel === "IPHONE_16_PRO"
                    ? "bg-[#4F46E5] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="iPhone 16 Pro Frame"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceModel("SAMSUNG_S25")}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceModel === "SAMSUNG_S25"
                    ? "bg-[#4F46E5] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Samsung Galaxy S25 Frame"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceModel("CLEAN_FRAME")}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceModel === "CLEAN_FRAME"
                    ? "bg-[#4F46E5] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Clean Frameless View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Selector */}
            <select
              value={zoomScale}
              onChange={(e) => setZoomScale(Number(e.target.value))}
              className="bg-black/40 border border-white/10 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value={80}>80%</option>
              <option value={90}>90%</option>
              <option value={100}>100%</option>
            </select>
          </div>

        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. PROTOTYPE CANVAS WORKSPACE                                       */}
      {/* =================================================================== */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto">
        
        {/* Top Floating Headline matching the User Reference Image */}
        {activeScreen === "REFERENCE_SCHEDULE" && (
          <div className="text-center space-y-2 mb-8 max-w-lg mx-auto animate-in fade-in duration-300">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Never walk into the{" "}
              <span className="text-[#FB923C] font-black underline decoration-[#FB923C]/50 decoration-wavy">
                wrong room
              </span>{" "}
              again
            </h1>
            <p className="text-sm text-indigo-200/90 font-medium">
              Your next class, with the room in big type
            </p>

            {/* Quick Toggle: Exact Reference Demo vs MedGo B2B Mode */}
            <div className="pt-2 flex justify-center">
              <div className="inline-flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setContentMode("EXACT_IMAGE")}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    contentMode === "EXACT_IMAGE"
                      ? "bg-[#FB923C] text-slate-950 font-black shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Exact Reference Copy (Aisha / CSE 2101)
                </button>
                <button
                  type="button"
                  onClick={() => setContentMode("MEDGO_HEALTHCARE")}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    contentMode === "MEDGO_HEALTHCARE"
                      ? "bg-[#4F46E5] text-white font-black shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  MedGo Healthcare Operations Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEVICE CONTAINER with Responsive Zoom Transform */}
        <div
          style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-200"
        >
          
          {/* Real Hardware Device Chassis */}
          <div
            className={`relative mx-auto transition-all duration-300 ${
              deviceModel === "IPHONE_16_PRO"
                ? "w-[393px] h-[844px] rounded-[52px] p-3.5 bg-gradient-to-b from-[#2E294E] via-[#1E1743] to-[#120D2B] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_8px_#3D356A,0_0_0_10px_#1B1735]"
                : deviceModel === "SAMSUNG_S25"
                ? "w-[400px] h-[855px] rounded-[42px] p-3 bg-gradient-to-b from-[#221D3F] to-[#0F0C22] shadow-[0_25px_65px_rgba(0,0,0,0.8),0_0_0_6px_#443C70]"
                : "w-[385px] h-[830px] rounded-3xl p-0 shadow-2xl border-2 border-indigo-500/30"
            }`}
          >
            {/* Phone Exterior Side Buttons */}
            {deviceModel === "IPHONE_16_PRO" && (
              <>
                {/* Volume Up & Down Buttons */}
                <div className="absolute -left-4 top-28 w-1 h-12 bg-[#3D356A] rounded-l-md" />
                <div className="absolute -left-4 top-44 w-1 h-12 bg-[#3D356A] rounded-l-md" />
                {/* Action Button */}
                <div className="absolute -left-4 top-16 w-1 h-7 bg-[#FB923C] rounded-l-md" />
                {/* Power / Lock Button */}
                <div className="absolute -right-4 top-32 w-1 h-16 bg-[#3D356A] rounded-r-md" />
              </>
            )}

            {/* PHONE INNER SCREEN VIEWPORT */}
            <div className="relative w-full h-full bg-[#F5F6FC] rounded-[44px] overflow-hidden flex flex-col shadow-inner select-none text-slate-900 font-sans">
              
              {/* ============================================================= */}
              {/* STATUS BAR: 9:41, Cellular, Wi-Fi, Battery, Dynamic Island    */}
              {/* ============================================================= */}
              <div className="relative z-30 pt-3 px-6 flex items-center justify-between text-xs font-semibold text-slate-900 shrink-0">
                <span className="font-bold tracking-tight">9:41</span>

                {/* iPhone Dynamic Island */}
                {deviceModel === "IPHONE_16_PRO" && (
                  <div
                    onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                    className={`cursor-pointer transition-all duration-300 rounded-full bg-black flex items-center justify-between px-3 text-white ${
                      dynamicIslandExpanded
                        ? "w-64 h-9 shadow-lg"
                        : "w-28 h-6"
                    }`}
                  >
                    {dynamicIslandExpanded ? (
                      <div className="flex items-center justify-between w-full text-[10px] px-1 font-bold">
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Truck className="w-3 h-3 text-[#FB923C]" />
                          MedSupplyBD Live
                        </span>
                        <span className="text-[#FB923C]">14m ETA</span>
                      </div>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C] shrink-0" />
                        <span className="text-[9px] font-black text-slate-300">MedGo</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      </>
                    )}
                  </div>
                )}

                {/* Status Icons: Signal, Wi-Fi, Battery */}
                <div className="flex items-center gap-1.5 text-slate-800">
                  {/* Signal bars */}
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-1 bg-slate-800 rounded-xs" />
                    <span className="w-0.5 h-1.5 bg-slate-800 rounded-xs" />
                    <span className="w-0.5 h-2 bg-slate-800 rounded-xs" />
                    <span className="w-0.5 h-2.5 bg-slate-800 rounded-xs" />
                  </div>
                  {/* Wi-Fi Icon */}
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3c3.78 0 7.22 1.48 9.77 3.92L12 19.34 2.23 10.92C4.78 8.48 8.22 7 12 7z"/>
                  </svg>
                  {/* Battery Pill */}
                  <div className="w-5 h-2.5 border border-slate-800 rounded-xs p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-800 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* SCREEN CONTENT AREA (SCROLLABLE INSIDE DEVICE)                */}
              {/* ============================================================= */}
              <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8 scrollbar-none">
                
                {/* ----------------------------------------------------------- */}
                {/* TAB 1: EXACT REFERENCE IMAGE SCHEDULE SCREEN                */}
                {/* ----------------------------------------------------------- */}
                {activeScreen === "REFERENCE_SCHEDULE" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Header Row: Hamburger Icon & (+) Floating Pill */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-800 active:scale-90 transition-transform"
                      >
                        <Menu className="w-5 h-5 stroke-[2.2]" />
                      </button>

                      <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/30 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Plus className="w-5 h-5 stroke-[2.6]" />
                      </button>
                    </div>

                    {/* Greeting Title */}
                    <div className="pt-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        {contentMode === "EXACT_IMAGE"
                          ? "Good morning, Aisha"
                          : "Good morning, Dr. Rafiqul"}
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Sunday, 4 October
                      </p>
                    </div>

                    {/* Prominent UP NEXT Hero Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241B52] via-[#2E236C] to-[#4338CA] p-5 text-white shadow-xl shadow-indigo-900/20">
                      {/* Ambient Watermark Circles */}
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                      <div className="absolute right-12 -top-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                      {/* Up Next Pill & Countdown */}
                      <div className="flex items-center gap-2 text-xs font-bold mb-3">
                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-200">
                          UP NEXT
                        </span>
                        <span className="w-2 h-2 rounded-full border border-indigo-300" />
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-white">
                          Starts in 14 min
                        </span>
                      </div>

                      {/* Main Title & ROOM 504 Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-2xl font-black tracking-tight leading-tight">
                            {contentMode === "EXACT_IMAGE" ? "CSE 2101" : "Napa Extra 500mg"}
                          </div>
                          <div className="text-xs font-semibold text-indigo-200/90 mt-0.5">
                            {contentMode === "EXACT_IMAGE" ? "Data Structures" : "Beximco Pharma • 120 Boxes"}
                          </div>
                        </div>

                        {/* Distinct White ROOM 504 Badge Card */}
                        <div className="w-20 h-16 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-lg shrink-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {contentMode === "EXACT_IMAGE" ? "ROOM" : "DEPOT"}
                          </span>
                          <span className="text-xl font-black tracking-tight leading-none text-slate-900">
                            504
                          </span>
                        </div>
                      </div>

                      {/* Bottom Time & Doctor / Instructor */}
                      <div className="pt-4 mt-3 border-t border-white/10 text-xs font-medium text-indigo-100 flex items-center justify-between">
                        <span>9:00 AM – 10:30 AM</span>
                        <span>•</span>
                        <span className="truncate">
                          {contentMode === "EXACT_IMAGE" ? "Dr. Sabrina Rahman" : "Depot Lead Tariqul"}
                        </span>
                      </div>
                    </div>

                    {/* Quiz / Urgent Audit Notification Card */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 active:scale-98 transition-transform cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm shrink-0">
                          {contentMode === "EXACT_IMAGE" ? "📑 ?" : "🏥"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {contentMode === "EXACT_IMAGE"
                              ? "Quiz 3 • PHY 1103"
                              : "Urgent Audit • DGDA 2026"}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            in 4 days • 9:30 AM • Room 210
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>

                    {/* Week Navigation Header */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
                      <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800">
                        This week • 3–9 Oct
                      </span>
                      <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 7-DAY INTERACTIVE DATE PICKER (Matching Image exact colors & dot) */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {daysOfWeek.map((item) => {
                        const isSelected = selectedDay === item.date;

                        return (
                          <div
                            key={item.date}
                            onClick={() => setSelectedDay(item.date)}
                            className={`cursor-pointer rounded-2xl py-2 px-1 flex flex-col items-center justify-between h-18 transition-all ${
                              isSelected
                                ? "bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/30 scale-105"
                                : "bg-white text-slate-800 border border-slate-200/80 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider ${
                                isSelected ? "text-indigo-200" : "text-slate-400"
                              }`}
                            >
                              {item.day}
                            </span>
                            <span className="text-sm font-black">{item.date}</span>

                            {/* Warm Coral / Peach Indicator Dot */}
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected
                                  ? "bg-[#FB923C]"
                                  : item.hasDot
                                  ? "bg-rose-500"
                                  : "opacity-0"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Today Schedule List Header */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                        <span>
                          Today <span className="text-slate-500 font-normal">3 classes • 9:00 AM – 2:30 PM</span>
                        </span>
                      </div>
                    </div>

                    {/* Class / Dispatch Item Card 1 */}
                    <div className="flex items-start gap-3 pt-1">
                      <div className="w-12 text-right pt-2 text-xs font-bold text-slate-900">
                        9:00 <span className="block text-[10px] text-slate-400">AM</span>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl p-3.5 border-l-4 border-l-[#4F46E5] border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            {contentMode === "EXACT_IMAGE" ? "CSE 2101" : "Napa Extra 500mg (10+1 Scheme)"}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Room 504
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {contentMode === "EXACT_IMAGE" ? "Data Structures • Lab Building" : "Direct Wholesale Depot Delivery"}
                        </p>
                      </div>
                    </div>

                    {/* Class / Dispatch Item Card 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 text-right pt-2 text-xs font-bold text-slate-900">
                        11:30 <span className="block text-[10px] text-slate-400">AM</span>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl p-3.5 border-l-4 border-l-[#FB923C] border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            {contentMode === "EXACT_IMAGE" ? "CSE 2102" : "Seclo 20mg Capsule (Square Pharma)"}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Lab 302
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {contentMode === "EXACT_IMAGE" ? "Algorithm Lab Examination" : "Cold-Chain Insulin & Capsule Allocation"}
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* TAB 2: MOBILE ROLE-BASED REGISTRATION FLOW                  */}
                {/* ----------------------------------------------------------- */}
                {activeScreen === "ROLE_REGISTRATION" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Stepper Header */}
                    <div className="text-center space-y-1 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] text-[10px] font-black uppercase border border-indigo-200">
                        Step {regStep} of 4 • Onboarding
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        {regStep === 1
                          ? "Select Business Role"
                          : regStep === 2
                          ? "Entity Verification Info"
                          : regStep === 3
                          ? "Contact OTP Check"
                          : "DGDA Audit Status"}
                      </h3>
                    </div>

                    {/* Step 1: Role Chooser inside Mobile */}
                    {regStep === 1 && (
                      <div className="space-y-2 pt-1">
                        {[
                          { role: UserRole.PHARMACY_OWNER, title: "Pharmacy Owner", desc: "Wholesale Credit & Direct Supply", icon: Store },
                          { role: UserRole.RETAIL_PHARMACY, title: "Retail Pharmacy", desc: "Patient POS & Daily Dispensary", icon: Building2 },
                          { role: UserRole.PHARMA_COMPANY, title: "Pharma Company", desc: "Manufacturer HQ & National Supply", icon: Factory },
                          { role: UserRole.DISTRIBUTOR, title: "Distributor Depot", desc: "Regional Hub & Cold Chain Logistics", icon: Truck },
                          { role: UserRole.SALES_REP, title: "MPO / SR Terminal", desc: "Field Order Cutting & Beat Visit", icon: UserCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSel = regRole === item.role;
                          return (
                            <div
                              key={item.role}
                              onClick={() => setRegRole(item.role)}
                              className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                                isSel
                                  ? "border-[#4F46E5] bg-indigo-50/50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                                    isSel ? "bg-[#4F46E5] text-white" : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">{item.title}</div>
                                  <div className="text-[10px] text-slate-500">{item.desc}</div>
                                </div>
                              </div>
                              {isSel && <Check className="w-4 h-4 text-[#4F46E5] stroke-[3]" />}
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => setRegStep(2)}
                          className="w-full py-3 rounded-2xl bg-[#4F46E5] text-white text-xs font-black shadow-md mt-2 active:scale-95 transition-transform"
                        >
                          Continue to Mandatory Form
                        </button>
                      </div>
                    )}

                    {/* Step 2: Form Details inside Mobile */}
                    {regStep === 2 && (
                      <div className="space-y-3 pt-1 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Trade Name *
                          </label>
                          <input
                            type="text"
                            defaultValue="Green Care Pharmacy"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Owner NID Number (10/13/17 digits) *
                          </label>
                          <input
                            type="text"
                            defaultValue="1990269112233"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Trade License Number *
                          </label>
                          <input
                            type="text"
                            defaultValue="TRAD/DSCC/88219/2026"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                          />
                        </div>

                        {/* Camera Snapshot Simulation */}
                        <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            License Document / Mobile Camera Snap *
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCapturingCamera(true);
                              setTimeout(() => {
                                setIsCapturingCamera(false);
                                setHasCameraPhoto(true);
                              }, 1200);
                            }}
                            className="w-full py-2 px-3 rounded-xl border-2 border-dashed border-indigo-300 hover:bg-indigo-50 text-[#4F46E5] font-bold text-xs flex items-center justify-center gap-2"
                          >
                            <Camera className="w-4 h-4 text-[#FB923C]" />
                            <span>
                              {isCapturingCamera
                                ? "Capturing Camera Feed..."
                                : hasCameraPhoto
                                ? "✓ License Photo Captured"
                                : "Tap to Snap Photo"}
                            </span>
                          </button>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setRegStep(1)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegStep(3)}
                            className="flex-1 py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold shadow-md"
                          >
                            Proceed to OTP
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: OTP Verification inside Mobile */}
                    {regStep === 3 && (
                      <div className="space-y-4 pt-2 text-center text-xs">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] flex items-center justify-center mx-auto">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm">Enter 6-Digit Code</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Sent to {regPhone}</div>
                        </div>

                        <div className="flex justify-center gap-1.5 font-mono">
                          {["7", "2", "9", "4", "0", "1"].map((d, i) => (
                            <span
                              key={i}
                              className="w-9 h-11 rounded-xl bg-white border-2 border-indigo-400 flex items-center justify-center text-base font-black text-slate-900 shadow-2xs"
                            >
                              {d}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRegVerified(true);
                            setTrackingId("REG-2026-992144");
                            setRegStep(4);
                          }}
                          className="w-full py-3 rounded-2xl bg-[#4F46E5] text-white font-black text-xs shadow-md mt-2"
                        >
                          Verify & Submit Application
                        </button>
                      </div>
                    )}

                    {/* Step 4: Tracking Card */}
                    {regStep === 4 && (
                      <div className="p-4 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-md animate-in zoom-in-95">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Tracking Number:</div>
                          <div className="font-mono text-base font-black text-slate-900">{trackingId}</div>
                        </div>
                        <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                          Pending Verification
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Your physical premises and DGDA license are under review.
                        </p>
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                        >
                          Reset Demo Form
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* TAB 3: MOBILE ORDER CUTTING / POS SCREEN                    */}
                {/* ----------------------------------------------------------- */}
                {activeScreen === "ORDER_CUTTING_POS" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                    
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-sm font-black text-slate-900">Mobile POS Billing</div>
                        <div className="text-[11px] text-slate-500">Customer Counter Checkout</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] text-[10px] font-bold">
                        Online
                      </span>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-2">
                      {cartItems.map((item, i) => (
                        <div key={i} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-black text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500">
                              Qty: {item.qty} boxes {item.bonus > 0 && <span className="text-[#FB923C] font-bold">+{item.bonus} Free</span>}
                            </div>
                          </div>
                          <div className="font-mono font-black text-slate-900">
                            ৳{item.price}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Payment Mode Chooser with requested brand colors */}
                    <div className="space-y-1.5 pt-2">
                      <label className="font-bold text-slate-700 text-[11px]">Select Payment Channel:</label>
                      <div className="grid grid-cols-2 gap-2 text-white font-black text-xs">
                        <button
                          onClick={() => setPaymentMode("BKASH")}
                          className={`p-2.5 rounded-xl transition-all ${
                            paymentMode === "BKASH" ? "ring-2 ring-white scale-102" : "opacity-85"
                          }`}
                          style={{ backgroundColor: "#D12053" }}
                        >
                          bKash Merchant
                        </button>
                        <button
                          onClick={() => setPaymentMode("NAGAD")}
                          className={`p-2.5 rounded-xl transition-all ${
                            paymentMode === "NAGAD" ? "ring-2 ring-white scale-102" : "opacity-85"
                          }`}
                          style={{ backgroundColor: "#F7941D" }}
                        >
                          Nagad Direct
                        </button>
                        <button
                          onClick={() => setPaymentMode("BANK")}
                          className={`p-2.5 rounded-xl transition-all ${
                            paymentMode === "BANK" ? "ring-2 ring-white scale-102" : "opacity-85"
                          }`}
                          style={{ backgroundColor: "#1A56DB" }}
                        >
                          Bank Transfer
                        </button>
                        <button
                          onClick={() => setPaymentMode("CASH")}
                          className={`p-2.5 rounded-xl transition-all ${
                            paymentMode === "CASH" ? "ring-2 ring-white scale-102" : "opacity-85"
                          }`}
                          style={{ backgroundColor: "#059669" }}
                        >
                          Cash Counter
                        </button>
                      </div>
                    </div>

                    {/* Total & Checkout */}
                    <div className="p-3.5 bg-slate-100 rounded-2xl flex items-center justify-between font-black text-sm">
                      <span>Total Payable:</span>
                      <span className="font-mono text-base text-[#4F46E5]">৳770.00</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("Thermal Receipt Sent via SMS & POS Printer!")}
                      className="w-full py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs shadow-md active:scale-95 transition-transform"
                    >
                      Print & Confirm Receipt (৳770)
                    </button>

                  </div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* TAB 4: LIVE GPS VEHICLE DELIVERY TRACKING                   */}
                {/* ----------------------------------------------------------- */}
                {activeScreen === "LIVE_DELIVERY_TRACK" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                    
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-sm font-black text-slate-900">Live Delivery GPS</div>
                        <div className="text-[11px] text-slate-500">Dhaka Central Depot Dispatch</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        In Transit
                      </span>
                    </div>

                    {/* Simulated Map Container */}
                    <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md">
                      {/* Map Graphics */}
                      <div className="absolute inset-0 bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                      
                      {/* Route Line */}
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="60" y1="170" x2="260" y2="70" stroke="#4F46E5" strokeWidth="4" strokeDasharray="6 4" />
                      </svg>

                      {/* Moving Vehicle Pin */}
                      <div className="absolute left-[160px] top-[115px] -translate-x-1/2 -translate-y-1/2 animate-bounce">
                        <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] border-2 border-white text-white flex items-center justify-center text-base shadow-xl">
                          🚚
                        </div>
                      </div>

                      {/* Destination Pharmacy Pin */}
                      <div className="absolute left-[260px] top-[70px] -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-[#FB923C] border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md">
                          🏥
                        </div>
                      </div>

                      {/* Overlay Info Card */}
                      <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-slate-300">Driver: Monirul Islam</div>
                          <div className="text-[10px] text-emerald-400 font-mono">Van: DHA-METRO-11-9482</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-[#FB923C]">14 Mins</div>
                          <div className="text-[9px] text-slate-400">ETA to Shop</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Call Button */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => alert("Calling Driver: +880 1711-889900")}
                        className="flex-1 py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold text-xs shadow-md"
                      >
                        Call Delivery Driver
                      </button>
                      <button
                        type="button"
                        onClick={() => alert("OTP for delivery hand-off: 4912")}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800"
                      >
                        View Hand-off OTP
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* ============================================================= */}
              {/* MOBILE BOTTOM NAVIGATION DOCK (Inside Device)                 */}
              {/* ============================================================= */}
              <div className="relative z-30 bg-[#1E1743] px-6 py-2.5 flex items-center justify-between text-indigo-200/70 border-t border-indigo-500/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveScreen("REFERENCE_SCHEDULE")}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeScreen === "REFERENCE_SCHEDULE" ? "text-white" : ""
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Schedule</span>
                  {activeScreen === "REFERENCE_SCHEDULE" && (
                    <span className="w-1 h-1 rounded-full bg-[#FB923C]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveScreen("ROLE_REGISTRATION")}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeScreen === "ROLE_REGISTRATION" ? "text-white" : ""
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Register</span>
                  {activeScreen === "ROLE_REGISTRATION" && (
                    <span className="w-1 h-1 rounded-full bg-[#FB923C]" />
                  )}
                </button>

                {/* Floating Center Action Button */}
                <button
                  type="button"
                  onClick={() => setActiveScreen("ORDER_CUTTING_POS")}
                  className="w-10 h-10 rounded-full bg-[#4F46E5] -mt-5 text-white flex items-center justify-center shadow-lg border-2 border-[#1E1743] active:scale-90 transition-transform"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveScreen("ORDER_CUTTING_POS")}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeScreen === "ORDER_CUTTING_POS" ? "text-white" : ""
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-[9px] font-bold">POS</span>
                  {activeScreen === "ORDER_CUTTING_POS" && (
                    <span className="w-1 h-1 rounded-full bg-[#FB923C]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveScreen("LIVE_DELIVERY_TRACK")}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeScreen === "LIVE_DELIVERY_TRACK" ? "text-white" : ""
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Tracking</span>
                  {activeScreen === "LIVE_DELIVERY_TRACK" && (
                    <span className="w-1 h-1 rounded-full bg-[#FB923C]" />
                  )}
                </button>
              </div>

              {/* iPhone Home Indicator Pill */}
              <div className="bg-[#1E1743] pb-2 flex justify-center shrink-0">
                <div className="w-28 h-1 rounded-full bg-white/30" />
              </div>

            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
