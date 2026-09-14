"use client";

import React, { useState } from "react";
import { TrendingUp, Calendar, Filter, ArrowUpRight, BarChart2 } from "lucide-react";

interface DataPoint {
  label: string;
  value: number; // Order Count or ৳ Amount
  x: number;
  y: number;
  growth: string;
}

export const OrderTrendGraph: React.FC<{ title?: string }> = ({ title = "Order Cutting & Procurement Trend Graph" }) => {
  const [timeRange, setTimeRange] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // Yearly dataset matching exact curve in user screenshot
  const yearlyData: DataPoint[] = [
    { label: "2020", value: 25, x: 50, y: 175, growth: "+12%" },
    { label: "2021", value: 40, x: 140, y: 145, growth: "+60%" },
    { label: "2022", value: 40, x: 230, y: 145, growth: "0%" },
    { label: "2023", value: 50, x: 320, y: 115, growth: "+25%" },
    { label: "2024", value: 40, x: 410, y: 145, growth: "-20%" },
    { label: "2025", value: 55, x: 500, y: 105, growth: "+37%" },
    { label: "2026", value: 70, x: 590, y: 60, growth: "+27%" },
  ];

  // Monthly dataset
  const monthlyData: DataPoint[] = [
    { label: "Jan", value: 20, x: 50, y: 180, growth: "+10%" },
    { label: "Mar", value: 35, x: 140, y: 150, growth: "+75%" },
    { label: "May", value: 42, x: 230, y: 135, growth: "+20%" },
    { label: "Jul", value: 48, x: 320, y: 120, growth: "+14%" },
    { label: "Sep", value: 58, x: 410, y: 98, growth: "+21%" },
    { label: "Nov", value: 65, x: 500, y: 80, growth: "+12%" },
    { label: "Dec", value: 75, x: 590, y: 50, growth: "+15%" },
  ];

  const currentData = timeRange === "YEARLY" ? yearlyData : monthlyData;

  // Path SVG line string
  const pathD = currentData.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  // Grid lines configuration
  const horizontalGrid = [
    { value: 70, y: 60 },
    { value: 60, y: 90 },
    { value: 50, y: 120 },
    { value: 40, y: 150 },
    { value: 30, y: 180 },
  ];

  return (
    <div className="premium-card p-6 space-y-4 text-slate-900 border border-[#DDE8E3]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#065F52] text-white shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time pharmacy order cutting velocity & volume growth trajectory.</p>
          </div>
        </div>

        {/* Time Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setTimeRange("YEARLY")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === "YEARLY" ? "bg-[#065F52] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Yearly Trend
          </button>
          <button
            onClick={() => setTimeRange("MONTHLY")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === "MONTHLY" ? "bg-[#065F52] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Trend
          </button>
        </div>
      </div>

      {/* SVG Axis & Trend Graph Container */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[620px] p-2">
          
          <svg viewBox="0 0 660 250" className="w-full h-auto overflow-visible select-none">
            <defs>
              {/* Line Gradient matching cyan/emerald exact user screenshot */}
              <linearGradient id="orderTrendLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#0F8F78" />
                <stop offset="100%" stopColor="#065F52" />
              </linearGradient>

              {/* Area Fill Gradient under line */}
              <linearGradient id="orderTrendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F8F78" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0F8F78" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {horizontalGrid.map((grid, idx) => (
              <g key={idx}>
                <line
                  x1="45"
                  y1={grid.y}
                  x2="630"
                  y2={grid.y}
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                <text x="35" y={grid.y + 4} textAnchor="end" fill="#64748B" fontSize="11" fontWeight="600">
                  {grid.value}
                </text>
              </g>
            ))}

            {/* Vertical Gridlines & X Labels */}
            {currentData.map((pt, idx) => (
              <g key={idx}>
                <line
                  x1={pt.x}
                  y1="30"
                  x2={pt.x}
                  y2="210"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                {/* Rotated X Label matching user screenshot */}
                <text
                  x={pt.x}
                  y="235"
                  textAnchor="end"
                  fill="#475569"
                  fontSize="11"
                  fontWeight="700"
                  transform={`rotate(-40, ${pt.x}, 235)`}
                >
                  {pt.label}
                </text>
              </g>
            ))}

            {/* Y-Axis Arrow Line */}
            <g stroke="#334155" strokeWidth="3" strokeLinecap="round">
              <line x1="45" y1="210" x2="45" y2="20" />
              {/* Arrow tip top */}
              <path d="M 38 32 L 45 15 L 52 32" fill="#334155" />
            </g>

            {/* X-Axis Arrow Line */}
            <g stroke="#334155" strokeWidth="3" strokeLinecap="round">
              <line x1="45" y1="210" x2="640" y2="210" />
              {/* Arrow tip right */}
              <path d="M 628 203 L 648 210 L 628 217" fill="#334155" />
            </g>

            {/* Area under trend line */}
            <path
              d={`${pathD} L 590 210 L 50 210 Z`}
              fill="url(#orderTrendAreaGrad)"
            />

            {/* Main Cyan/Emerald Trend Line matching user screenshot */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#orderTrendLineGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circular Node Dots matching user screenshot */}
            {currentData.map((pt, idx) => (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="8"
                  fill="#FFFFFF"
                  stroke="#0F8F78"
                  strokeWidth="4"
                  className="transition-all duration-200 group-hover:scale-125 shadow-md"
                />

                {/* Inner Dot Center */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2.5"
                  fill="#0F8F78"
                />

                {/* Value Label above Node */}
                <text
                  x={pt.x}
                  y={pt.y - 14}
                  textAnchor="middle"
                  fill="#065F52"
                  fontSize="11"
                  fontWeight="800"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {pt.value} Orders
                </text>
              </g>
            ))}
          </svg>

        </div>
      </div>

      {/* Footer Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Current Peak Order Volume</div>
            <div className="text-lg font-black text-[#065F52] font-mono">70 Orders / Month</div>
          </div>
          <div className="p-1.5 bg-emerald-200 text-emerald-900 font-bold rounded-lg text-[10px] flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +27%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Average Monthly Velocity</div>
            <div className="text-lg font-black text-slate-900 font-mono">48.5 Orders</div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">STABLE</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Order Fulfillment Rate</div>
            <div className="text-lg font-black text-emerald-700 font-mono">99.4% FEFO Billed</div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">EXCELLENT</span>
        </div>
      </div>

    </div>
  );
};
