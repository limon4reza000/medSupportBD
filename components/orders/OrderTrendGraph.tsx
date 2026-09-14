"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Filter,
} from "lucide-react";

export const OrderTrendGraph: React.FC<{ title?: string }> = ({
  title = "Pharma Territory Business Intelligence & Analytics Suite",
}) => {
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [activeCategory, setActiveCategory] = useState("APEIRIAN");

  // Donut chart segment data
  const donutSegments = [
    { label: "June Sales", value: "14.877", color: "#F59E0B" }, // Yellow
    { label: "Trade Scheme", value: "29.472", color: "#F97316" }, // Orange
    { label: "Bonus Units", value: "5.173", color: "#EF4444" }, // Red
    { label: "Prescriptions", value: "38.552", color: "#EC4899" }, // Pink
    { label: "OTC Reorder", value: "31.346", color: "#3B82F6" }, // Blue
    { label: "Institutional", value: "30.255", color: "#8B5CF6" }, // Purple
  ];

  // Smooth wave graph points (20 timeline coordinates)
  // X: 20px step from 20 to 620
  // Y: values between 40 (high peak) and 180 (trough)
  const wavePoints = [
    { x: 20, y: 140 },
    { x: 50, y: 80 },
    { x: 80, y: 110 },
    { x: 110, y: 65 },
    { x: 140, y: 120 },
    { x: 170, y: 40 },
    { x: 200, y: 70 },
    { x: 230, y: 130 },
    { x: 260, y: 150 },
    { x: 290, y: 90 },
    { x: 320, y: 50 },
    { x: 350, y: 110 },
    { x: 380, y: 130 },
    { x: 410, y: 30 },
    { x: 440, y: 110 },
    { x: 470, y: 70 },
    { x: 500, y: 130 },
    { x: 530, y: 150 },
    { x: 560, y: 100 },
    { x: 590, y: 125 },
  ];

  // Build smooth cubic bezier curve string
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const smoothCurveD = createSmoothPath(wavePoints);

  // Capsule Bar Chart heights (14 items)
  const capsuleHeights = [
    50, 75, 90, 60, 85, 95, 70, 80, 65, 90, 55, 70, 85, 60,
  ];

  return (
    <div className="w-full bg-[#7C3AED]/10 p-4 sm:p-6 rounded-3xl space-y-6">
      
      {/* Outer Dashboard Card Wrapper (Pure White Container) */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 space-y-6 text-slate-900">
        
        {/* ================= TOP ROW: Radial Gauges & Bar Metric Cards ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-6 border-b border-slate-100">
          
          {/* 4 Circular Radial Progress Gauges (Top Left) */}
          <div className="lg:col-span-4 flex items-center justify-between sm:justify-start gap-4">
            {[
              { val: "66", color: "border-rose-500 text-rose-600", label: "CLINICAL" },
              { val: "78", color: "border-emerald-500 text-emerald-600", label: "FULFILL" },
              { val: "58", color: "border-purple-500 text-purple-600", label: "DISPENSE" },
              { val: "94", color: "border-amber-500 text-amber-600", label: "RECOVERY" },
            ].map((g, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-14 h-14 rounded-full border-4 ${g.color} flex items-center justify-center bg-slate-50 shadow-inner font-black text-sm`}
                >
                  {g.val}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {g.label}
                </span>
              </div>
            ))}
          </div>

          {/* Middle Progress Segment Tracks (Top Middle) */}
          <div className="lg:col-span-4 space-y-2 px-2 border-y lg:border-y-0 lg:border-x border-slate-100 py-3 lg:py-0">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-400 text-[10px]">ADOLESCENS QUI</span>
              <div className="flex items-center gap-1 text-slate-900 font-mono">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>12 983</span>
              </div>
            </div>
            {/* Segmented bar */}
            <div className="flex gap-1 h-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < 18 ? "bg-emerald-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-black pt-1">
              <span className="text-slate-400 text-[10px]">CHORO VOCIBUS</span>
              <div className="flex items-center gap-1 text-slate-900 font-mono">
                <ArrowDown className="w-3.5 h-3.5 text-rose-600" />
                <span>9 478</span>
              </div>
            </div>
            <div className="flex gap-1 h-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < 12 ? "bg-rose-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-black pt-1">
              <span className="text-slate-400 text-[10px]">LATINE USU EX DUO</span>
              <div className="flex items-center gap-1 text-slate-900 font-mono">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-600" />
                <span>15 323</span>
              </div>
            </div>
            <div className="flex gap-1 h-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < 20 ? "bg-cyan-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Metric Bar Summary Columns (Top Right) */}
          <div className="lg:col-span-4 flex items-center justify-around">
            {[
              { val: "234", bars: [4, 7, 3, 9, 6, 8, 10] },
              { val: "457", bars: [6, 10, 8, 7, 9, 5, 8] },
              { val: "315", bars: [5, 6, 8, 4, 7, 9, 6] },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
                  {col.val}
                </span>
                <div className="flex items-end gap-1 h-8">
                  {col.bars.map((h, bIdx) => (
                    <div
                      key={bIdx}
                      className="w-1.5 bg-emerald-500 rounded-t-sm"
                      style={{ height: `${h * 3}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ================= MIDDLE ROW: Donut Chart & Purple Smooth Wave Chart ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Multi-Segment Donut Chart */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-4">
            
            <div className="relative w-48 h-48 flex items-center justify-center select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Segment 1: Yellow */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="40 200" strokeDashoffset="0" />
                {/* Segment 2: Orange */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="16" strokeDasharray="35 200" strokeDashoffset="-42" />
                {/* Segment 3: Red */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" strokeWidth="16" strokeDasharray="20 200" strokeDashoffset="-79" />
                {/* Segment 4: Pink */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#EC4899" strokeWidth="16" strokeDasharray="50 200" strokeDashoffset="-101" />
                {/* Segment 5: Blue */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="40 200" strokeDashoffset="-153" />
                {/* Segment 6: Purple */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#8B5CF6" strokeWidth="16" strokeDasharray="40 200" strokeDashoffset="-195" />
              </svg>

              {/* Center hole with Month Switcher */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-1 font-black text-slate-800 text-sm bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200">
                  <ChevronLeft className="w-3.5 h-3.5 cursor-pointer hover:text-purple-600" />
                  <span>{selectedMonth}</span>
                  <ChevronRight className="w-3.5 h-3.5 cursor-pointer hover:text-purple-600" />
                </div>
              </div>
            </div>

            {/* Donut Legend Items */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono w-full px-2">
              {donutSegments.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-bold text-slate-500">{s.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Total Revenue KPI Pill */}
            <div className="pt-2 w-full flex items-center justify-between border-t border-slate-200">
              <span className="text-xl font-black font-mono text-slate-900">৳99,845.45</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                +14.2% Growth
              </span>
            </div>

          </div>

          {/* Right Column: Purple Smooth Wave Area Graph (FERRILAT) */}
          <div className="lg:col-span-8 space-y-3">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">FERRILAT / PROCUREMENT</h3>
                <p className="text-xs text-slate-400 mt-0.5">Continuous Smooth Territory Demand Velocity</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-purple-700">17 756</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase">LATINE USU EX DUO</p>
              </div>
            </div>

            {/* Smooth SVG Wavy Area Graph */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[580px] p-2">
                <svg viewBox="0 0 620 220" className="w-full h-auto overflow-visible select-none">
                  <defs>
                    <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Filled Wave Path */}
                  <path
                    d={`${smoothCurveD} L 590 200 L 20 200 Z`}
                    fill="url(#purpleAreaGrad)"
                  />

                  {/* Smooth Wave Line */}
                  <path
                    d={smoothCurveD}
                    fill="none"
                    stroke="#6D28D9"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Nodes / Dots on Wave Peaks & Valleys (Static Crisp Dots) */}
                  {wavePoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#6D28D9"
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* Timeline X-Labels (01 to 20) */}
                  {wavePoints.map((pt, idx) => (
                    <text
                      key={`lbl-${idx}`}
                      x={pt.x}
                      y="215"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

          </div>

        </div>

        {/* ================= BOTTOM ROW: Capsule Bars, Mini Sparklines, Step Counters ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-100">
          
          {/* Left: Capsule Bar Chart (Teal Vertical Pill Bars) */}
          <div className="lg:col-span-5 space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between h-28 px-2">
              {capsuleHeights.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-3 bg-emerald-500 rounded-full transition-all"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-bold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>

            {/* Filter Pill Buttons */}
            <div className="flex flex-wrap items-center justify-around gap-1 pt-2 border-t border-slate-200">
              {["APEIRIAN", "DESET", "FACETE", "LATINEUS"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                    activeCategory === cat
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Mini Sparkline Waves & Metrics */}
          <div className="lg:col-span-4 flex items-center justify-around p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="space-y-1 text-center font-mono">
              <div className="text-sm font-black text-slate-900">4567</div>
              <div className="text-sm font-black text-slate-900">6683</div>
              <div className="text-sm font-black text-slate-900">2876</div>
            </div>

            {/* 3 Red/Rose Sparkline Curves */}
            <div className="space-y-3">
              {[
                "M 0 10 Q 15 0, 30 10 T 60 10",
                "M 0 10 Q 15 20, 30 5 T 60 10",
                "M 0 10 Q 15 5, 30 15 T 60 10",
              ].map((dStr, idx) => (
                <svg key={idx} width="60" height="20" className="overflow-visible">
                  <path d={dStr} fill="none" stroke="#EF4444" strokeWidth="2" />
                </svg>
              ))}
            </div>

            {/* Vertical Mini Columns with Numbers 78, 65, 98 */}
            <div className="flex items-center gap-3">
              {[
                { num: "78", h: 70 },
                { num: "65", h: 55 },
                { num: "98", h: 90 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-black font-mono text-slate-900">{item.num}</span>
                  <div className="w-2 bg-emerald-500 rounded-t-sm h-12 flex items-end">
                    <div className="w-full bg-emerald-600 rounded-t-sm" style={{ height: `${item.h}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Step Counter Badges & Final Revenue Pill */}
          <div className="lg:col-span-3 flex flex-col justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-mono font-black text-[#7C3AED]">
                <span className="text-lg text-slate-900">268</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-lg text-purple-700">946</span>
              </div>
              <span className="text-sm font-black font-mono text-emerald-700">৳3,809.50</span>
            </div>

            {/* Numbered Step Circles (01 to 05) */}
            <div className="flex items-center justify-between pt-1">
              {["01", "02", "03", "04", "05"].map((num, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border ${
                    idx === 0
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Mini Pink Wave Curve at bottom right */}
            <div className="w-full flex justify-center">
              <svg width="120" height="16" viewBox="0 0 120 16">
                <path
                  d="M 0 10 Q 15 2, 30 10 T 60 10 T 90 4 T 120 10"
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
