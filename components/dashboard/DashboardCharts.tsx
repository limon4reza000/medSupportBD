"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Package,
  DollarSign,
  Info,
} from "lucide-react";

interface MonthlyData {
  month: string;
  year: number;
  amount: number;
  orderCount: number;
}

interface CompanyData {
  companyId: string;
  companyName: string;
  amount: number | null;
  percentage: number;
}

interface TopMedicineData {
  medicineId: string;
  name: string;
  genericName: string;
  companyName: string;
  boxes: number;
  totalAmount: number | null;
}

/**
 * 1. Monthly Purchase Bar Chart (Responsive SVG)
 */
export function MonthlyPurchaseBarChart({
  data,
  isMasked = false,
}: {
  data: MonthlyData[];
  isMasked?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No monthly procurement records available.
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 50000);
  const chartHeight = 130;
  const barWidth = 28;
  const gap = 18;
  const svgWidth = data.length * (barWidth + gap) + 10;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">Trailing 6 Months Procurement (৳)</span>
        {hoveredIndex !== null && !isMasked && (
          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
            {data[hoveredIndex].month} {data[hoveredIndex].year}: ৳{data[hoveredIndex].amount.toLocaleString()} ({data[hoveredIndex].orderCount} orders)
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-2 scrollbar-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight + 35}`}
          className="w-full h-44 select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#139485" />
              <stop offset="100%" stopColor="#0d6d62" />
            </linearGradient>
            <linearGradient id="barGradientNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#80d5ca" />
              <stop offset="100%" stopColor="#3ca89b" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={chartHeight} x2={svgWidth} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
          <line x1="0" y1={chartHeight / 2} x2={svgWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

          {data.map((d, i) => {
            const barHeight = isMasked ? chartHeight * 0.5 : Math.max(8, (d.amount / maxAmount) * chartHeight);
            const x = i * (barWidth + gap) + 10;
            const y = chartHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={`${d.month}-${d.year}`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="5"
                  fill={isHovered ? "url(#barGradientActive)" : "url(#barGradientNormal)"}
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all duration-300"
                />

                {/* Amount Label on Top */}
                {!isMasked && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(12, y - 5)}
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-slate-600"
                  >
                    {d.amount >= 1000 ? `${(d.amount / 1000).toFixed(0)}k` : d.amount}
                  </text>
                )}

                {/* Month Label on Bottom */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className={`text-[10px] ${
                    isHovered ? "font-bold fill-teal-900" : "font-medium fill-slate-500"
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/**
 * 2. Company-Wise Spend Share Distribution
 */
export function CompanyDistributionChart({
  companies,
  onSelectCompany,
  isMasked = false,
}: {
  companies: CompanyData[];
  onSelectCompany?: (name: string) => void;
  isMasked?: boolean;
}) {
  if (!companies || companies.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        No company procurement data in selected period.
      </div>
    );
  }

  const colorPalette = [
    { bg: "bg-[#139485]", text: "text-teal-700", fill: "#139485" },
    { bg: "bg-blue-600", text: "text-blue-700", fill: "#2563eb" },
    { bg: "bg-purple-600", text: "text-purple-700", fill: "#9333ea" },
    { bg: "bg-amber-500", text: "text-amber-700", fill: "#f59e0b" },
    { bg: "bg-rose-500", text: "text-rose-700", fill: "#f43f5e" },
    { bg: "bg-emerald-600", text: "text-emerald-700", fill: "#059669" },
  ];

  return (
    <div className="space-y-3">
      {/* Horizontal Stacked Bar */}
      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {companies.map((c, i) => {
          const color = colorPalette[i % colorPalette.length];
          return (
            <div
              key={c.companyName}
              style={{ width: `${Math.max(2, c.percentage)}%` }}
              className={`${color.bg} h-full transition-all duration-500 hover:opacity-85 cursor-pointer`}
              title={`${c.companyName}: ${c.percentage}%`}
              onClick={() => onSelectCompany && onSelectCompany(c.companyName)}
            />
          );
        })}
      </div>

      {/* Legend & Breakdown List */}
      <div className="space-y-2 pt-1 text-xs">
        {companies.map((c, i) => {
          const color = colorPalette[i % colorPalette.length];
          return (
            <div
              key={c.companyName}
              onClick={() => onSelectCompany && onSelectCompany(c.companyName)}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
            >
              <div className="flex items-center space-x-2 truncate max-w-[220px]">
                <span className={`w-2.5 h-2.5 rounded-full ${color.bg} shrink-0`} />
                <span className="font-semibold text-slate-800 truncate">{c.companyName}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900">
                  {isMasked ? "••••••" : `৳${c.amount?.toLocaleString() ?? "0"}`}
                </span>
                <span className="text-[11px] text-slate-500 ml-1.5 font-medium">({c.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 3. Top Purchased Medicines Ranking Bars
 */
export function TopMedicinesRankingChart({
  medicines,
  isMasked = false,
}: {
  medicines: TopMedicineData[];
  isMasked?: boolean;
}) {
  if (!medicines || medicines.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        No medicine purchase records found.
      </div>
    );
  }

  const maxBoxes = Math.max(...medicines.map((m) => m.boxes), 10);

  return (
    <div className="space-y-2.5">
      {medicines.map((m, idx) => {
        const widthPercent = Math.min(100, Math.max(8, (m.boxes / maxBoxes) * 100));

        return (
          <div key={m.medicineId || idx} className="space-y-1 bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {idx + 1}. {m.name}
              </span>
              <span className="font-bold text-teal-800">
                {isMasked ? "••••••" : `৳${m.totalAmount?.toLocaleString() ?? "0"}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[210px]">{m.genericName} &bull; {m.companyName}</span>
              <span className="font-semibold text-slate-700 shrink-0">{m.boxes} Boxes</span>
            </div>

            {/* Volume indicator bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#139485] h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 4. Monthly Sales vs Purchase Comparison
 */
export function SalesVsPurchaseComparisonCard({
  purchaseAmount,
  isMasked = false,
}: {
  purchaseAmount: number | null;
  isMasked?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Sales vs Procurement Comparison
        </h2>
        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
          POS Integration
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Procurement Spend */}
        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3">
          <span className="block text-[11px] text-teal-700 font-medium">B2B Wholesale Purchase</span>
          <div className="text-base font-bold text-teal-900 mt-1">
            {isMasked ? "••••••" : `৳${purchaseAmount?.toLocaleString() ?? "0"}`}
          </div>
          <span className="text-[10px] text-teal-600 mt-0.5 block">Verified Wholesale Invoices</span>
        </div>

        {/* Retail Sales Dispensing */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 relative overflow-hidden">
          <span className="block text-[11px] text-slate-500 font-medium">Retail Counter Sales</span>
          <div className="text-sm font-semibold text-slate-600 mt-1">
            POS Standby
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Feeds from counter tickets</span>
        </div>
      </div>

      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600 flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
        <p>
          Gross Chemist profit margins will calculate automatically once counter dispensing sales are logged in the Retail POS module.
        </p>
      </div>
    </div>
  );
}

/**
 * 5. Dynamic Business Analytics Bar Chart (Refined UI: Clean Minimalist Header, Rounded Royal Bars, Compact Hover Card)
 */
export function DynamicBarChart({
  chart,
  isMasked = false,
  isLoading = false,
}: {
  chart?: {
    title: string;
    yAxisLabel: string;
    categories: string[];
    series: { label: string; data: number[] }[];
  };
  isMasked?: boolean;
  isLoading?: boolean;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(270);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-36 bg-slate-100 rounded-md animate-pulse" />
          <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="h-56 bg-slate-50/70 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!chart || !chart.categories || chart.categories.length === 0) {
    return (
      <div
        className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2 p-6"
        data-testid="dynamic-bar-chart-empty"
      >
        <Package className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="font-semibold text-slate-700">No Data Available</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          No transactions or orders matched the selected filters.
        </p>
      </div>
    );
  }

  const series = chart.series?.[0] || { label: "Purchase", data: [] };
  const seriesData = series.data || [];
  const rawMax = Math.max(...seriesData, 1000);

  // Dynamic clean ceiling computation
  const getCeiling = (max: number) => {
    if (max <= 50000) return 50000;
    if (max <= 100000) return 100000;
    if (max <= 150000) return 150000;
    if (max <= 200000) return 200000;
    if (max <= 300000) return 300000;
    if (max <= 500000) return 500000;
    if (max <= 1000000) return 1000000;
    return Math.ceil(max / 100000) * 100000;
  };

  const ceiling = getCeiling(rawMax);
  const yTicks = [
    ceiling,
    ceiling * 0.75,
    ceiling * 0.5,
    ceiling * 0.25,
    0,
  ];

  const formatYLabel = (val: number) => {
    if (val === 0) return "৳0";
    if (val >= 1000000) {
      const num = val / 1000000;
      return `৳${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}M`;
    }
    if (val >= 1000) {
      const num = val / 1000;
      return `৳${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}K`;
    }
    return `৳${val}`;
  };

  const formatTooltipVal = (val: number) => {
    if (isMasked) return "••••••";
    if (val === 0) return "৳0";
    if (val >= 1000) {
      const kVal = val / 1000;
      return `৳${kVal % 1 === 0 ? kVal.toFixed(0) : kVal.toFixed(1)}K`;
    }
    return `৳${val}`;
  };

  // Dimensions
  const chartHeight = 210;
  const topPadding = 24;
  const yZero = topPadding + chartHeight;
  const svgHeight = yZero + 38;

  // Y-axis fixed column width (flushed to the far left at red mark)
  const yAxisWidth = 46;

  const count = chart.categories.length;
  // Exactly 6 bars visible in front when count > 6 (e.g. 12 months), remaining 6 bars scroll
  const visibleBars = count > 6 ? 6 : Math.max(1, count);
  // Slot width for each bar in pixels
  const slotWidth = Math.max(40, Math.floor(containerWidth / visibleBars));
  // Bar width is ~68% of slot width, capped between 26px and 40px
  const barWidth = Math.max(26, Math.min(40, Math.floor(slotWidth * 0.68)));
  // Total scrollable width: if count > 6, exactly slotWidth * count (e.g. 6 in front + 6 scrolled)
  const scrollableWidth = count > 6 ? slotWidth * count : Math.max(containerWidth, slotWidth * count);

  const activeIdx = hoveredIdx !== null && hoveredIdx < count ? hoveredIdx : null;
  const activeVal = activeIdx !== null ? (seriesData[activeIdx] || 0) : 0;
  const activeCat = activeIdx !== null ? (chart.categories[activeIdx] || "") : "";
  const activeBarCenterX = activeIdx !== null ? (activeIdx * slotWidth + slotWidth / 2) : 0;
  const activeBarH = activeIdx !== null ? Math.max(8, (activeVal / ceiling) * chartHeight) : 0;
  const activeBarY = yZero - activeBarH;

  return (
    <div
      className="bg-white text-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative overflow-hidden select-none"
      data-testid="dynamic-bar-chart"
      role="graphics-document"
      aria-label={chart.title}
    >
      {/* Clean Minimalist Header with Scroll Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#205493] ring-4 ring-[#205493]/10" />
          <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
            {chart.title}
          </h2>
        </div>
        {count > 6 && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
            Scroll ↔
          </span>
        )}
      </div>

      {/* Chart Layout: Fixed Vertical Y-Axis on Left + Scrollable Bars on Right */}
      <div className="flex items-start relative">
        {/* 1. FIXED VERTICAL Y-AXIS (Left Column: Stays fixed, never scrolls, flush left at red mark) */}
        <div className="shrink-0 z-10 bg-white select-none pt-1" style={{ width: `${yAxisWidth}px` }}>
          <svg
            width={yAxisWidth}
            height={svgHeight}
            className="overflow-visible select-none"
            style={{ width: `${yAxisWidth}px`, height: `${svgHeight}px` }}
          >
            {yTicks.map((tickVal, i) => {
              const lineY = topPadding + i * (chartHeight / 4);
              return (
                <text
                  key={`ytick-fixed-${tickVal}-${i}`}
                  x="0"
                  y={lineY + 4}
                  textAnchor="start"
                  fill="#475569"
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {formatYLabel(tickVal)}
                </text>
              );
            })}
          </svg>
        </div>

        {/* 2. SCROLLABLE BARS & HORIZONTAL MONTHS VIEWPORT (Right Column: 6 bars in front, remaining scroll) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 relative select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div style={{ minWidth: `${scrollableWidth}px` }} className="relative">
            <svg
              viewBox={`0 0 ${scrollableWidth} ${svgHeight}`}
              className="w-full select-none"
              style={{ minWidth: `${scrollableWidth}px`, height: `${svgHeight}px` }}
              preserveAspectRatio="none"
            >
              {/* Defs for subtle shadow filter */}
              <defs>
                <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#205493" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* 5 Horizontal Dashed Gridlines spanning the entire scrollable width */}
              {yTicks.map((tickVal, i) => {
                const lineY = topPadding + i * (chartHeight / 4);
                return (
                  <line
                    key={`gridline-${tickVal}-${i}`}
                    x1="0"
                    y1={lineY}
                    x2={scrollableWidth}
                    y2={lineY}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Bars */}
              {chart.categories.map((cat, i) => {
                const val = seriesData[i] || 0;
                const barH = isMasked
                  ? chartHeight * 0.4
                  : Math.max(6, (val / ceiling) * chartHeight);
                const slotX = i * slotWidth;
                const barX = slotX + Math.floor((slotWidth - barWidth) / 2);
                const barCenterX = slotX + slotWidth / 2;
                const y = yZero - barH;
                const isHovered = hoveredIdx === i;
                const hasHover = hoveredIdx !== null;

                return (
                  <g
                    key={`bar-${cat}-${i}`}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onTouchStart={() => setHoveredIdx(i)}
                    onClick={() => setHoveredIdx(i)}
                  >
                    {/* Transparent Hover Hitbox Area for Smooth Interaction */}
                    <rect
                      x={slotX}
                      y={topPadding}
                      width={slotWidth}
                      height={chartHeight + 35}
                      fill="transparent"
                    />

                    {/* The Bar: Solid Navy Blue with rounded corners and hover glow */}
                    <rect
                      x={barX}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx="10"
                      ry="10"
                      fill={isHovered ? "#2b6cb0" : "#205493"}
                      filter={isHovered ? "url(#barShadow)" : undefined}
                      opacity={hasHover && !isHovered ? 0.75 : 1}
                      className="transition-all duration-200 ease-out"
                    />

                    {/* X-Axis Category / Month Label: Bold font (fontSize 13) */}
                    <text
                      x={barCenterX}
                      y={yZero + 22}
                      textAnchor="middle"
                      fill={isHovered ? "#0f172a" : "#334155"}
                      fontSize="13"
                      fontWeight={isHovered ? "800" : "700"}
                      fontFamily="sans-serif"
                    >
                      {cat.slice(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip Card (Refined Short & Compact per user request) */}
            {activeIdx !== null && activeCat && (
              <div
                className="absolute z-10 pointer-events-none transition-all duration-150 ease-out"
                style={{
                  left: `${Math.max(48, Math.min(scrollableWidth - 48, activeBarCenterX))}px`,
                  top: `${activeBarY}px`,
                  transform: activeBarY < 65 ? "translate(-50%, 12px)" : "translate(-50%, -115%)",
                }}
              >
                <div className="bg-[#1e1e1e]/95 backdrop-blur-sm border border-zinc-700/80 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                  <div className="text-[10px] font-bold text-zinc-300 leading-tight mb-0.5">
                    {activeCat}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#205493] shrink-0" />
                    <span className="text-white font-bold">
                      {formatTooltipVal(activeVal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 6. Dynamic Business Performance Trends Line Chart (Ultra-Premium SaaS Edition)
 * Features: Silky Smooth Bezier Splines, Ambient Gradient Fill, Glowing Nodes,
 * Fixed Left Y-Axis, Responsive 6-Month Front View with Smooth Scroll, and Glassmorphic Tooltips.
 */
export function DynamicLineChart({
  chart,
  isMasked = false,
  isLoading = false,
}: {
  chart?: {
    title: string;
    timePoints: string[];
    lines: { name: string; color: string; data: number[]; isStandby: boolean }[];
  };
  isMasked?: boolean;
  isLoading?: boolean;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(270);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-48 bg-slate-100 rounded-md animate-pulse" />
          <div className="h-4 w-28 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="h-60 bg-slate-50/70 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!chart || !chart.timePoints || chart.timePoints.length === 0) {
    return (
      <div
        className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2 p-6"
        data-testid="dynamic-line-chart-empty"
      >
        <TrendingUp className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="font-semibold text-slate-700">No Trend Data Available</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Performance trends require historical transactions across consecutive periods.
        </p>
      </div>
    );
  }

  const { timePoints, lines } = chart;
  const allValues = lines.flatMap((l) => l.data || []);
  const rawMax = Math.max(...allValues, 1000);

  // Clean ceiling calculation matching Bar Chart
  const getCeiling = (max: number) => {
    if (max <= 50000) return 50000;
    if (max <= 100000) return 100000;
    if (max <= 150000) return 150000;
    if (max <= 200000) return 200000;
    if (max <= 300000) return 300000;
    if (max <= 500000) return 500000;
    if (max <= 1000000) return 1000000;
    return Math.ceil(max / 100000) * 100000;
  };

  const ceiling = getCeiling(rawMax);
  const yTicks = [
    ceiling,
    ceiling * 0.75,
    ceiling * 0.5,
    ceiling * 0.25,
    0,
  ];

  const formatYLabel = (val: number) => {
    if (val === 0) return "৳0";
    if (val >= 1000000) {
      const num = val / 1000000;
      return `৳${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}M`;
    }
    if (val >= 1000) {
      const num = val / 1000;
      return `৳${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}K`;
    }
    return `৳${val}`;
  };

  // Dimensions: Generous, premium height (210px) matching Bar Chart perfectly
  const chartHeight = 210;
  const topPadding = 26;
  const yZero = topPadding + chartHeight;
  const svgHeight = yZero + 38;

  // Y-axis fixed column width (flushed to the far left at red mark line)
  const yAxisWidth = 46;

  const count = timePoints.length;
  // Exactly 6 timepoints in front when count > 6 (e.g. 12 months), remaining scroll smoothly
  const visiblePoints = count > 6 ? 6 : Math.max(1, count);
  const slotWidth = Math.max(42, Math.floor(containerWidth / visiblePoints));
  const scrollableWidth = count > 6 ? slotWidth * count : Math.max(containerWidth, slotWidth * count);

  // Linear points calculation (used for polylines and hover calculations)
  const getPointsString = (data: number[]) => {
    return data
      .map((val, idx) => {
        const x = idx * slotWidth + slotWidth / 2;
        const y = yZero - (isMasked ? chartHeight * 0.4 : Math.min(chartHeight, (val / ceiling) * chartHeight));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Ultra-Smooth Catmull-Rom Cubic Bezier Spline
  const getSmoothPath = (data: number[]) => {
    const pts = data.map((val, idx) => ({
      x: idx * slotWidth + slotWidth / 2,
      y: yZero - (isMasked ? chartHeight * 0.4 : Math.min(chartHeight, (val / ceiling) * chartHeight)),
    }));
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) * 0.18;
      const cp1y = p1.y + (p2.y - p0.y) * 0.18;
      const cp2x = p2.x - (p3.x - p1.x) * 0.18;
      const cp2y = p2.y - (p3.y - p1.y) * 0.18;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  // Smooth Area Polygon Path
  const getAreaSmoothPath = (data: number[]) => {
    if (data.length === 0) return "";
    const firstX = slotWidth / 2;
    const lastX = (data.length - 1) * slotWidth + slotWidth / 2;
    const curve = getSmoothPath(data);
    return `${curve} L ${lastX.toFixed(1)} ${yZero} L ${firstX.toFixed(1)} ${yZero} Z`;
  };

  // Primary active series
  const primaryLine = lines.find((l) => !l.isStandby) || lines[0];
  const primaryVal = hoveredIdx !== null && primaryLine?.data ? (primaryLine.data[hoveredIdx] || 0) : 0;
  const hoveredY = hoveredIdx !== null
    ? yZero - (isMasked ? chartHeight * 0.4 : Math.min(chartHeight, (primaryVal / ceiling) * chartHeight))
    : yZero;

  return (
    <div
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative overflow-hidden select-none space-y-3.5"
      data-testid="dynamic-line-chart"
      role="graphics-document"
      aria-label={chart.title}
    >
      {/* Premium Header with Title, Live Badge, Scroll Indicator, and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#139485] opacity-40" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#139485]" />
            </span>
            <div>
              <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                {chart.title}
              </h2>
            </div>
          </div>
          {count > 6 && (
            <span className="sm:hidden text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/70 rounded-full px-2 py-0.5">
              Scroll ↔
            </span>
          )}
        </div>

        {/* Legend with Capsule Badges */}
        <div className="flex items-center space-x-2 text-[11px]">
          {lines.map((l) => (
            <div
              key={l.name}
              className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 shadow-2xs"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-slate-700 font-semibold text-[11px]">
                {l.name} {l.isStandby ? "(POS)" : ""}
              </span>
            </div>
          ))}
          {count > 6 && (
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/70 rounded-full px-2.5 py-1">
              Scroll ↔
            </span>
          )}
        </div>
      </div>

      {/* Chart Layout: Fixed Vertical Y-Axis on Left + Scrollable Spline Viewport on Right */}
      <div className="flex items-start relative">
        {/* 1. FIXED VERTICAL Y-AXIS (Left Column: Stays permanently fixed, flush left) */}
        <div className="shrink-0 z-10 bg-white select-none pt-1" style={{ width: `${yAxisWidth}px` }}>
          <svg
            width={yAxisWidth}
            height={svgHeight}
            className="overflow-visible select-none"
            style={{ width: `${yAxisWidth}px`, height: `${svgHeight}px` }}
          >
            {yTicks.map((tickVal, i) => {
              const lineY = topPadding + i * (chartHeight / 4);
              return (
                <text
                  key={`ytick-fixed-line-${tickVal}-${i}`}
                  x="0"
                  y={lineY + 4}
                  textAnchor="start"
                  fill="#475569"
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {formatYLabel(tickVal)}
                </text>
              );
            })}
          </svg>
        </div>

        {/* 2. SCROLLABLE SPLINE & HORIZONTAL MONTHS VIEWPORT (Right Column: 6 points in front, remaining scroll) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 relative select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div style={{ minWidth: `${scrollableWidth}px` }} className="relative">
            <svg
              viewBox={`0 0 ${scrollableWidth} ${svgHeight}`}
              className="w-full select-none"
              style={{ minWidth: `${scrollableWidth}px`, height: `${svgHeight}px` }}
              preserveAspectRatio="none"
            >
              <defs>
                {/* Multi-Stop Ambient Area Gradient */}
                <linearGradient id="premiumAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#139485" stopOpacity="0.32" />
                  <stop offset="45%" stopColor="#139485" stopOpacity="0.12" />
                  <stop offset="95%" stopColor="#139485" stopOpacity="0.0" />
                </linearGradient>

                {/* Soft Ambient Line Glow */}
                <filter id="premiumLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#139485" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* 5 Horizontal Dashed Gridlines spanning the entire scrollable width */}
              {yTicks.map((tickVal, i) => {
                const lineY = topPadding + i * (chartHeight / 4);
                return (
                  <line
                    key={`gridline-line-${tickVal}-${i}`}
                    x1="0"
                    y1={lineY}
                    x2={scrollableWidth}
                    y2={lineY}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Active Month Vertical Guideline & Ambient Column Highlight */}
              {hoveredIdx !== null && (
                <g className="pointer-events-none transition-all duration-150">
                  <rect
                    x={hoveredIdx * slotWidth}
                    y={topPadding}
                    width={slotWidth}
                    height={chartHeight}
                    fill="#139485"
                    fillOpacity="0.04"
                    rx="6"
                  />
                  <line
                    x1={hoveredIdx * slotWidth + slotWidth / 2}
                    y1={topPadding}
                    x2={hoveredIdx * slotWidth + slotWidth / 2}
                    y2={yZero}
                    stroke="#139485"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                </g>
              )}

              {/* Smooth Area Path under Primary Curve */}
              {primaryLine && primaryLine.data && primaryLine.data.length > 0 && !primaryLine.isStandby && (
                <path
                  d={getAreaSmoothPath(primaryLine.data)}
                  fill="url(#premiumAreaGradient)"
                  className="pointer-events-none transition-all duration-300"
                />
              )}

              {/* Lines & Data Nodes */}
              {lines.map((line) => {
                const points = getPointsString(line.data);
                const smoothPath = getSmoothPath(line.data);

                return (
                  <g key={`line-${line.name}`}>
                    {/* Polyline element for SVG semantic and test suite compatibility */}
                    <polyline
                      fill="none"
                      stroke={line.color}
                      strokeWidth={line.isStandby ? "2" : "3.5"}
                      strokeDasharray={line.isStandby ? "4 4" : "none"}
                      points={points}
                      className={line.isStandby ? "opacity-85" : "hidden"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Smooth Spline Path for Primary Line with Shadow Glow */}
                    {!line.isStandby && (
                      <path
                        d={smoothPath}
                        fill="none"
                        stroke={line.color}
                        strokeWidth="3.5"
                        filter="url(#premiumLineGlow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Data Point Circles with Halos */}
                    {line.data.map((val, idx) => {
                      const x = idx * slotWidth + slotWidth / 2;
                      const y = yZero - (isMasked ? chartHeight * 0.4 : Math.min(chartHeight, (val / ceiling) * chartHeight));
                      const isHovered = hoveredIdx === idx;

                      if (line.isStandby) {
                        return (
                          <circle
                            key={`pt-${line.name}-${idx}`}
                            cx={x}
                            cy={y}
                            r={isHovered ? "4.5" : "3"}
                            fill="#ffffff"
                            stroke={line.color}
                            strokeWidth="1.8"
                            className="transition-all duration-150"
                          />
                        );
                      }

                      return (
                        <g key={`pt-${line.name}-${idx}`} className="transition-all duration-150">
                          {/* Outer Ambient Halo */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? "11" : "6"}
                            fill={line.color}
                            fillOpacity={isHovered ? 0.22 : 0.12}
                            className="transition-all duration-200"
                          />
                          {/* Main Crisp Node */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? "6" : "4.5"}
                            fill="#ffffff"
                            stroke={line.color}
                            strokeWidth={isHovered ? "3.2" : "2.4"}
                            className="cursor-pointer transition-all duration-150"
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Transparent Column Hitbox for smooth touching/hovering */}
              {timePoints.map((tp, idx) => {
                const slotX = idx * slotWidth;
                return (
                  <rect
                    key={`hitbox-${tp}-${idx}`}
                    x={slotX}
                    y={topPadding}
                    width={slotWidth}
                    height={chartHeight + 35}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onTouchStart={() => setHoveredIdx(idx)}
                    onClick={() => setHoveredIdx(idx)}
                  />
                );
              })}

              {/* Horizontal Month Labels: Large, Bold font (fontSize 13) with Hover Pill Highlight */}
              {timePoints.map((tp, idx) => {
                const x = idx * slotWidth + slotWidth / 2;
                const isHovered = hoveredIdx === idx;

                return (
                  <g key={`tp-${tp}-${idx}`} className="transition-all duration-150">
                    {/* Hover Pill Background */}
                    {isHovered && (
                      <rect
                        x={x - 20}
                        y={yZero + 9}
                        width="40"
                        height="20"
                        rx="6"
                        fill="#0f172a"
                        className="animate-fadeIn"
                      />
                    )}
                    <text
                      x={x}
                      y={yZero + 23}
                      textAnchor="middle"
                      fill={isHovered ? "#ffffff" : "#334155"}
                      fontSize="13"
                      fontWeight={isHovered ? "800" : "700"}
                      fontFamily="sans-serif"
                      className="transition-colors duration-150"
                    >
                      {tp.slice(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Glassmorphic Tooltip Card directly over the active node */}
            {hoveredIdx !== null && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-150 ease-out"
                style={{
                  left: `${Math.max(52, Math.min(scrollableWidth - 52, hoveredIdx * slotWidth + slotWidth / 2))}px`,
                  top: `${Math.max(16, Math.min(chartHeight + topPadding, hoveredY))}px`,
                  transform: hoveredY < 80 ? "translate(-50%, 14px)" : "translate(-50%, -125%)",
                }}
              >
                <div className="bg-[#18181b]/95 backdrop-blur-md border border-zinc-700/80 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap text-left min-w-[120px]">
                  <div className="flex items-center justify-between space-x-2 mb-1.5 border-b border-zinc-700/60 pb-1">
                    <span className="text-[11px] font-bold text-zinc-100">
                      {timePoints[hoveredIdx]}
                    </span>
                    <span className="text-[9px] font-semibold text-teal-300 bg-teal-950/80 border border-teal-800/60 rounded px-1.5 py-0.5">
                      2026 Trend
                    </span>
                  </div>
                  <div className="space-y-1">
                    {lines.map((l) => (
                      <div
                        key={`hov-tip-${l.name}`}
                        className="flex items-center justify-between space-x-3 text-[11px] leading-tight"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                          <span className="text-zinc-400 font-medium">{l.name}:</span>
                        </div>
                        <span className="text-white font-bold pl-1">
                          {isMasked
                            ? "••••••"
                            : l.data[hoveredIdx] > 0
                            ? `৳${(l.data[hoveredIdx] / 1000).toFixed(0)}K`
                            : "Standby"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Summary Bar when Point is Hovered / Selected */}
      {hoveredIdx !== null ? (
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#139485]" />
            <span className="font-bold text-slate-800">
              {timePoints[hoveredIdx]} 2026 Performance:
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            {lines.map((l) => (
              <span key={`hov-bar-${l.name}`} style={{ color: l.color }} className="font-bold">
                {l.name}:{" "}
                {isMasked
                  ? "••••••"
                  : l.data[hoveredIdx] > 0
                  ? `৳${l.data[hoveredIdx].toLocaleString()}`
                  : "Standby"}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-slate-400 text-right pr-2">
          Tap or hover points to compare performance metrics
        </p>
      )}
    </div>
  );
}
