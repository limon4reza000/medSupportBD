"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Building2, Package, DollarSign, Info } from "lucide-react";

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
 * 5. Dynamic Business Analytics Bar Chart (SVG-based, Filter-Driven)
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="h-44 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!chart || !chart.categories || chart.categories.length === 0) {
    return (
      <div
        className="py-10 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200 space-y-2 p-6"
        data-testid="dynamic-bar-chart-empty"
      >
        <Package className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="font-semibold text-slate-700">No Data Available</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          No transactions or orders matched the selected filters. Try switching the date range or company filter.
        </p>
      </div>
    );
  }

  const seriesData = chart.series?.[0]?.data || [];
  const maxVal = Math.max(...seriesData, 1000);
  const chartHeight = 130;
  const barWidth = Math.max(20, Math.min(36, Math.floor(220 / chart.categories.length)));
  const gap = Math.max(12, Math.min(24, Math.floor(80 / chart.categories.length)));
  const svgWidth = Math.max(300, chart.categories.length * (barWidth + gap) + 30);

  return (
    <div
      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3"
      data-testid="dynamic-bar-chart"
      role="graphics-document"
      aria-label={chart.title}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            {chart.title}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">
            {chart.yAxisLabel}
          </p>
        </div>
        {hoveredIdx !== null ? (
          <span className="text-[11px] font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 animate-fadeIn">
            {chart.categories[hoveredIdx]}:{" "}
            {isMasked
              ? "••••••"
              : seriesData[hoveredIdx] > 0
              ? `৳${seriesData[hoveredIdx].toLocaleString()}`
              : "0 (POS Standby)"}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium">
            Hover bars for details
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
            <linearGradient id="dynamicBarGradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#139485" />
              <stop offset="100%" stopColor="#0d6d62" />
            </linearGradient>
            <linearGradient id="dynamicBarGradNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="standbyBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={chartHeight} x2={svgWidth} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
          <line x1="0" y1={chartHeight / 2} x2={svgWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

          {chart.categories.map((cat, i) => {
            const val = seriesData[i] || 0;
            const barHeight = isMasked
              ? chartHeight * 0.4
              : val > 0
              ? Math.max(8, (val / maxVal) * chartHeight)
              : 4;
            const x = i * (barWidth + gap) + 16;
            const y = chartHeight - barHeight;
            const isHovered = hoveredIdx === i;
            const isZero = val === 0;

            return (
              <g
                key={`bar-${cat}-${i}`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={
                    isZero
                      ? "url(#standbyBarGrad)"
                      : isHovered
                      ? "url(#dynamicBarGradActive)"
                      : "url(#dynamicBarGradNormal)"
                  }
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-300"
                />

                {/* Amount label */}
                {!isMasked && val > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(12, y - 5)}
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-slate-600"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                )}

                {/* Category label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className={`text-[10px] ${
                    isHovered ? "font-bold fill-teal-900" : "font-medium fill-slate-500"
                  }`}
                >
                  {cat.slice(0, 7)}
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
 * 6. Dynamic Business Performance Trends Line Chart (Multi-Series SVG)
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-44 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!chart || !chart.timePoints || chart.timePoints.length === 0) {
    return (
      <div
        className="py-10 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200 space-y-2 p-6"
        data-testid="dynamic-line-chart-empty"
      >
        <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="font-semibold text-slate-700">No Trend Data Available</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Performance trends require historical transactions across consecutive periods.
        </p>
      </div>
    );
  }

  const { timePoints, lines } = chart;
  const allValues = lines.flatMap((l) => l.data || []);
  const maxVal = Math.max(...allValues, 10000);
  const chartHeight = 120;
  const pointGap = 55;
  const svgWidth = Math.max(300, (timePoints.length - 1) * pointGap + 60);

  // Helper to calculate SVG points for a line
  const getPointsString = (data: number[]) => {
    return data
      .map((val, idx) => {
        const x = idx * pointGap + 30;
        const y = chartHeight - (isMasked ? chartHeight * 0.4 : (val / maxVal) * (chartHeight - 20) + 10);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div
      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3"
      data-testid="dynamic-line-chart"
      role="graphics-document"
      aria-label={chart.title}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            {chart.title}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">
            Multi-series performance comparison
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center space-x-2 text-[10px]">
          {lines.map((l) => (
            <div key={l.name} className="flex items-center space-x-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-slate-600 font-medium">
                {l.name} {l.isStandby ? "(POS)" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2 scrollbar-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight + 35}`}
          className="w-full h-44 select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <line x1="15" y1={chartHeight} x2={svgWidth - 15} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
          <line x1="15" y1={chartHeight / 2} x2={svgWidth - 15} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

          {/* Lines */}
          {lines.map((line) => {
            const points = getPointsString(line.data);
            return (
              <g key={`line-${line.name}`}>
                <polyline
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.isStandby ? "1.5" : "2.5"}
                  strokeDasharray={line.isStandby ? "4 4" : "none"}
                  points={points}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {line.data.map((val, idx) => {
                  const x = idx * pointGap + 30;
                  const y = chartHeight - (isMasked ? chartHeight * 0.4 : (val / maxVal) * (chartHeight - 20) + 10);
                  const isHovered = hoveredIdx === idx;

                  return (
                    <circle
                      key={`pt-${line.name}-${idx}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? "5" : "3.5"}
                      fill="#ffffff"
                      stroke={line.color}
                      strokeWidth={isHovered ? "2.5" : "1.8"}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Timepoint Labels */}
          {timePoints.map((tp, idx) => {
            const x = idx * pointGap + 30;
            const isHovered = hoveredIdx === idx;

            return (
              <text
                key={`tp-${tp}-${idx}`}
                x={x}
                y={chartHeight + 16}
                textAnchor="middle"
                className={`text-[10px] ${
                  isHovered ? "font-bold fill-slate-900" : "font-medium fill-slate-400"
                }`}
              >
                {tp}
              </text>
            );
          })}
        </svg>
      </div>

      {hoveredIdx !== null ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs flex items-center justify-between animate-fadeIn">
          <span className="font-semibold text-slate-700">
            {timePoints[hoveredIdx]} Performance:
          </span>
          <div className="flex items-center space-x-3 text-[11px]">
            {lines.map((l) => (
              <span key={`hov-${l.name}`} style={{ color: l.color }} className="font-bold">
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
          Tap points to compare series values
        </p>
      )}
    </div>
  );
}
