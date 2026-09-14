"use client";

import React, { useState } from "react";
import { TrendingUp, ArrowUpRight, BarChart2, CheckCircle2 } from "lucide-react";

interface DataPoint {
  x: number;
  y: number;
  val: number;
}

export const OrderTrendGraph: React.FC<{ title?: string }> = ({ title = "Order Cutting & Procurement Trend Graph" }) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "CYAN" | "NAVY" | "GREY">("ALL");

  // Grid levels 100 to 700
  const yLabels = [700, 600, 500, 400, 300, 200, 100];
  const gridYCoords = [30, 65, 100, 135, 170, 205, 240];
  const xAxisY = 275;

  // X points (7 months/years columns)
  const xPoints = [80, 170, 260, 350, 440, 530, 620];
  const xLabels = ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"];

  // Series 1 (Cyan/Emerald): [250, 610, 680, 415, 595, 420, 485]
  const seriesCyan: DataPoint[] = [
    { x: 80, y: 187.5, val: 250 },
    { x: 170, y: 61.5, val: 610 },
    { x: 260, y: 37.0, val: 680 },
    { x: 350, y: 129.7, val: 415 },
    { x: 440, y: 66.7, val: 595 },
    { x: 530, y: 128.0, val: 420 },
    { x: 620, y: 105.2, val: 485 },
  ];

  // Series 2 (Dark Navy): [100, 205, 360, 150, 290, 255, 155]
  const seriesNavy: DataPoint[] = [
    { x: 80, y: 240.0, val: 100 },
    { x: 170, y: 203.2, val: 205 },
    { x: 260, y: 149.0, val: 372 },
    { x: 350, y: 222.5, val: 150 },
    { x: 440, y: 173.5, val: 290 },
    { x: 530, y: 185.7, val: 255 },
    { x: 620, y: 220.7, val: 155 },
  ];

  // Series 3 (Cool Grey): [200, 100, 150, 240, 140, 60, 75]
  const seriesGrey: DataPoint[] = [
    { x: 80, y: 205.0, val: 200 },
    { x: 170, y: 240.0, val: 100 },
    { x: 260, y: 222.5, val: 150 },
    { x: 350, y: 194.5, val: 240 },
    { x: 440, y: 226.0, val: 140 },
    { x: 530, y: 254.0, val: 60 },
    { x: 620, y: 248.7, val: 75 },
  ];

  const buildPath = (pts: DataPoint[]) =>
    pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "");

  const cyanPath = buildPath(seriesCyan);
  const navyPath = buildPath(seriesNavy);
  const greyPath = buildPath(seriesGrey);

  return (
    <div className="premium-card p-6 space-y-6 text-slate-900 border border-[#DDE8E3] bg-white rounded-2xl shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#065F52] text-white shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Multi-channel order velocity & fulfillment metrics.</p>
          </div>
        </div>

        {/* Filter Badges Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "ALL" ? "bg-[#065F52] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setActiveTab("CYAN")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "CYAN" ? "bg-[#00D294] text-slate-950 shadow-sm" : "bg-emerald-50 text-[#00A876] hover:bg-emerald-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D294]"></span> Total Orders
          </button>
          <button
            onClick={() => setActiveTab("NAVY")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "NAVY" ? "bg-[#0F172A] text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]"></span> Billed Deliveries
          </button>
          <button
            onClick={() => setActiveTab("GREY")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "GREY" ? "bg-[#64748B] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span> Pending/Rejections
          </button>
        </div>
      </div>

      {/* Main Graph & Right Metric Badges Container */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        
        {/* SVG Area Chart */}
        <div className="flex-1 w-full overflow-x-auto">
          <div className="min-w-[620px] p-2">
            <svg viewBox="0 0 660 300" className="w-full h-auto overflow-visible select-none">
              <defs>
                {/* Cyan Gradient */}
                <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D294" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00D294" stopOpacity="0.03" />
                </linearGradient>

                {/* Navy Gradient */}
                <linearGradient id="navyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E293B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity="0.02" />
                </linearGradient>

                {/* Grey Gradient */}
                <linearGradient id="greyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Labels (700 down to 100) */}
              {yLabels.map((val, idx) => {
                const yCoord = gridYCoords[idx];
                return (
                  <g key={idx}>
                    <line
                      x1="45"
                      y1={yCoord}
                      x2="640"
                      y2={yCoord}
                      stroke="#E2E8F0"
                      strokeWidth="1.2"
                    />
                    <text
                      x="35"
                      y={yCoord + 4}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bottom Axis Line */}
              <line
                x1="45"
                y1={xAxisY}
                x2="640"
                y2={xAxisY}
                stroke="#64748B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Left Y-Axis Line */}
              <line
                x1="45"
                y1="20"
                x2="45"
                y2={xAxisY}
                stroke="#64748B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Series 3 (Cool Grey) Line & Area */}
              {(activeTab === "ALL" || activeTab === "GREY") && (
                <g>
                  <path
                    d={`${greyPath} L ${seriesGrey[seriesGrey.length - 1].x} ${xAxisY} L ${seriesGrey[0].x} ${xAxisY} Z`}
                    fill="url(#greyAreaGrad)"
                  />
                  <path
                    d={greyPath}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {seriesGrey.map((pt, idx) => (
                    <circle
                      key={`grey-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="6.5"
                      fill="#FFFFFF"
                      stroke="#94A3B8"
                      strokeWidth="3.5"
                    />
                  ))}
                  {/* Floating Tooltip Pill for Grey Series (Val: 240) */}
                  <g transform={`translate(${seriesGrey[3].x}, ${seriesGrey[3].y - 32})`}>
                    <rect
                      x="-22"
                      y="-14"
                      width="44"
                      height="24"
                      rx="6"
                      fill="#94A3B8"
                    />
                    <polygon points="0,14 -5,9 5,9" fill="#94A3B8" />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="800"
                    >
                      {seriesGrey[3].val}
                    </text>
                  </g>
                </g>
              )}

              {/* Series 2 (Dark Navy) Line & Area */}
              {(activeTab === "ALL" || activeTab === "NAVY") && (
                <g>
                  <path
                    d={`${navyPath} L ${seriesNavy[seriesNavy.length - 1].x} ${xAxisY} L ${seriesNavy[0].x} ${xAxisY} Z`}
                    fill="url(#navyAreaGrad)"
                  />
                  <path
                    d={navyPath}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {seriesNavy.map((pt, idx) => (
                    <circle
                      key={`navy-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="6.5"
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth="3.5"
                    />
                  ))}
                  {/* Floating Tooltip Pill for Navy Series (Val: 372) */}
                  <g transform={`translate(${seriesNavy[2].x}, ${seriesNavy[2].y - 32})`}>
                    <rect
                      x="-22"
                      y="-14"
                      width="44"
                      height="24"
                      rx="6"
                      fill="#334155"
                    />
                    <polygon points="0,14 -5,9 5,9" fill="#334155" />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="800"
                    >
                      {seriesNavy[2].val}
                    </text>
                  </g>
                </g>
              )}

              {/* Series 1 (Bright Cyan Green) Line & Area */}
              {(activeTab === "ALL" || activeTab === "CYAN") && (
                <g>
                  <path
                    d={`${cyanPath} L ${seriesCyan[seriesCyan.length - 1].x} ${xAxisY} L ${seriesCyan[0].x} ${xAxisY} Z`}
                    fill="url(#cyanAreaGrad)"
                  />
                  <path
                    d={cyanPath}
                    fill="none"
                    stroke="#00D294"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {seriesCyan.map((pt, idx) => (
                    <circle
                      key={`cyan-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#FFFFFF"
                      stroke="#00D294"
                      strokeWidth="4"
                    />
                  ))}
                  {/* Floating Tooltip Pill for Cyan Series (Val: 485) */}
                  <g transform={`translate(${seriesCyan[6].x}, ${seriesCyan[6].y - 32})`}>
                    <rect
                      x="-22"
                      y="-14"
                      width="44"
                      height="24"
                      rx="6"
                      fill="#00D294"
                    />
                    <polygon points="0,14 -5,9 5,9" fill="#00D294" />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="800"
                    >
                      {seriesCyan[6].val}
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right Circular Percentage Metric Badges (Matching User Image Exact Style) */}
        <div className="flex lg:flex-col items-center justify-center gap-6 py-2 px-4 border-t lg:border-t-0 lg:border-l border-slate-100">
          
          {/* Top Badge (+0.83%) Cyan/Emerald */}
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="w-24 h-24 rounded-full p-2.5 bg-slate-100 border-4 border-slate-200 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#00D294] flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-base tracking-tight">+0.83%</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#00A876] uppercase tracking-wide">Growth</span>
          </div>

          {/* Middle Badge (- 1.5%) Deep Navy */}
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="w-24 h-24 rounded-full p-2.5 bg-slate-100 border-4 border-slate-200 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-base tracking-tight">- 1.5%</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Delivery Diff</span>
          </div>

          {/* Bottom Badge (+0.12%) Cool Dark Grey */}
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="w-24 h-24 rounded-full p-2.5 bg-slate-100 border-4 border-slate-200 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#475569] flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-base tracking-tight">+0.12%</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pending Ratio</span>
          </div>

        </div>

      </div>

      {/* Footer Details Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Top Order Benchmark</div>
            <div className="text-lg font-black text-[#00A876] font-mono">680 Orders / Peak</div>
          </div>
          <div className="p-1.5 bg-[#00D294] text-white font-bold rounded-lg text-[10px] flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +0.83%
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Current Order Level</div>
            <div className="text-lg font-black text-slate-900 font-mono">485 Active Billed</div>
          </div>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-lg">VERIFIED</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Rejection Rate</div>
            <div className="text-lg font-black text-slate-700 font-mono">0.12% Standard</div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OPTIMAL
          </span>
        </div>
      </div>

    </div>
  );
};
