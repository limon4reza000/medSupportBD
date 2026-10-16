"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  ShoppingCart,
  Users,
  Truck,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Layers,
  Building2,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
  Home,
  Plus,
  Briefcase,
  Settings,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { TakaIcon } from "@/components/common/TakaIcon";

export const PharmacyOwnerDashboard: React.FC = () => {
  const router = useRouter();
  const { currentPharmacy, setIsQuickOrderOpen, setIsSearchOpen } = useApp();

  // State for interactive order chart timeframe
  const [chartTimeframe, setChartTimeframe] = useState<string>("Last 12 Months");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [activeTooltipMonth, setActiveTooltipMonth] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside the chart
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
        setActiveTooltipMonth(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 12-Month Order Overview Data with elevated Feb, Mar, Jun peak volumes
  const monthlyOrderData = [
    { month: "Jan", online: 80, wholesale: 40 },
    { month: "Feb", online: 210, wholesale: 125 },
    { month: "Mar", online: 265, wholesale: 160 },
    { month: "Apr", online: 135, wholesale: 80 },
    { month: "May", online: 175, wholesale: 110 },
    { month: "Jun", online: 315, wholesale: 195 },
    { month: "Jul", online: 220, wholesale: 145, isHighlighted: true },
    { month: "Aug", online: 265, wholesale: 178 },
    { month: "Sep", online: 292, wholesale: 195 },
    { month: "Oct", online: 322, wholesale: 212 },
    { month: "Nov", online: 360, wholesale: 228 },
    { month: "Dec", online: 395, wholesale: 246 },
  ];

  // Top Selling Products matching user mockup
  const topSellingProducts = [
    {
      id: 1,
      name: "Napa 500mg Tablet",
      generic: "Paracetamol",
      category: "Tablet",
      stock: "12,500",
      sold: "8,450",
      revenue: "BDT 422,500",
      progress: 85,
      image: "/images/trade-napa.png",
    },
    {
      id: 2,
      name: "Seclo 20mg Capsule",
      generic: "Omeprazole",
      category: "Capsule",
      stock: "8,200",
      sold: "5,760",
      revenue: "BDT 345,600",
      progress: 68,
      image: "/images/trade-seclo.png",
    },
    {
      id: 3,
      name: "Ace 5mg Tablet",
      generic: "Amlodipine",
      category: "Tablet",
      stock: "10,450",
      sold: "5,200",
      revenue: "BDT 260,000",
      progress: 52,
      image: "/images/med-product-1.png",
    },
    {
      id: 4,
      name: "ORS Powder",
      generic: "Oral Saline",
      category: "Syrup/Powder",
      stock: "5,600",
      sold: "4,980",
      revenue: "BDT 149,400",
      progress: 38,
      image: "/images/med-product-2.png",
    },
  ];

  // Low Stock Products matching user mockup
  const lowStockProducts = [
    {
      id: 1,
      name: "Azith 500mg",
      stock: 45,
      status: "Out of Stock",
      statusColor: "bg-rose-50 text-rose-600 border-rose-200",
      image: "/images/med-product-3.png",
    },
    {
      id: 2,
      name: "Metformin 500mg",
      stock: 120,
      status: "Low Stock",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      image: "/images/med-product-4.png",
    },
    {
      id: 3,
      name: "Saline 1L",
      stock: 80,
      status: "Low Stock",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      image: "/images/med-product-5.png",
    },
    {
      id: 4,
      name: "Vitamin C 500mg",
      stock: 65,
      status: "Out of Stock",
      statusColor: "bg-rose-50 text-rose-600 border-rose-200",
      image: "/images/med-product-6.png",
    },
    {
      id: 5,
      name: "Calpol Syrup",
      stock: 95,
      status: "Low Stock",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      image: "/images/med-product-7.png",
    },
  ];

  // Recent Orders matching user mockup
  const recentOrders = [
    {
      id: "#ORD-01234",
      pharmacy: "City Pharmacy",
      amount: "BDT 12,450",
      status: "Delivered",
      statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Building2,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "#ORD-01233",
      pharmacy: "Health Care Ltd.",
      amount: "BDT 8,720",
      status: "Processing",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: ShoppingCart,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "#ORD-01232",
      pharmacy: "Medico Plus",
      amount: "BDT 15,230",
      status: "Delivered",
      statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Briefcase,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "#ORD-01231",
      pharmacy: "Life Line Pharma",
      amount: "BDT 6,980",
      status: "Pending",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      id: "#ORD-01230",
      pharmacy: "Care & Cure",
      amount: "BDT 11,400",
      status: "Delivered",
      statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Truck,
      iconBg: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* =================================================================== */}
      {/* 1. TOP ROW: 4 METRIC KPI CARDS                                      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5">
        
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-[#1e60d5] shrink-0 shadow-2xs">
              <Box className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-slate-500 truncate">Total Products</div>
              <div className="text-lg sm:text-[28px] font-bold text-slate-900 mt-0.5 tracking-tight leading-none">
                25,430
              </div>
              <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-1.5 text-[10px] sm:text-[13px] mt-0.5 sm:mt-1 font-semibold leading-tight">
                <span className="text-indigo-600 font-bold flex items-center shrink-0">↗ +12%</span>
                <span className="text-slate-500 text-[10px] sm:text-[12px] truncate">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Suppliers */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Users className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-slate-500 truncate">Total Suppliers</div>
              <div className="text-lg sm:text-[28px] font-bold text-slate-900 mt-0.5 tracking-tight leading-none">
                350+
              </div>
              <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-1.5 text-[10px] sm:text-[13px] mt-0.5 sm:mt-1 font-semibold leading-tight">
                <span className="text-indigo-600 font-bold flex items-center shrink-0">↗ +8%</span>
                <span className="text-slate-500 text-[10px] sm:text-[12px] truncate">Active suppliers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-500 shrink-0 shadow-2xs">
              <ShoppingCart className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-slate-500 truncate">Total Orders</div>
              <div className="text-lg sm:text-[28px] font-bold text-slate-900 mt-0.5 tracking-tight leading-none">
                1,200+
              </div>
              <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-1.5 text-[10px] sm:text-[13px] mt-0.5 sm:mt-1 font-semibold leading-tight">
                <span className="text-indigo-600 font-bold flex items-center shrink-0">↗ +18%</span>
                <span className="text-slate-500 text-[10px] sm:text-[12px] truncate">This month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: On-Time Delivery */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
              <Truck className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-slate-500 truncate">On-Time Delivery</div>
              <div className="text-lg sm:text-[28px] font-bold text-slate-900 mt-0.5 tracking-tight leading-none">
                99%
              </div>
              <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-1.5 text-[10px] sm:text-[13px] mt-0.5 sm:mt-1 font-semibold leading-tight">
                <span className="text-indigo-600 font-bold flex items-center shrink-0">↗ +2%</span>
                <span className="text-slate-500 text-[10px] sm:text-[12px] truncate">Delivery success</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. SECOND ROW: ORDER OVERVIEW, INVENTORY STATUS & RECENT ORDERS      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ================================================================= */}
        {/* 2.1 ORDER OVERVIEW (12-Month Bar Chart)                           */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          {/* Header + Dropdown + Legends */}
          <div className="shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100/90">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Order Overview
              </h3>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Timeframe Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-sm font-bold text-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <span>{chartTimeframe}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[150px] text-sm font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                      {["Last 12 Months", "Last 6 Months", "Last 30 Days"].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => {
                            setChartTimeframe(tf);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            chartTimeframe === tf ? "text-blue-600 bg-blue-50/50" : ""
                          }`}
                        >
                          <span>{tf}</span>
                          {chartTimeframe === tf && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Legends with Clean 2D Color Swatches */}
                <div className="hidden sm:flex items-center gap-4 text-sm font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-2xs bg-[#729df2]" />
                    <span className="text-slate-700 font-semibold">Online Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-2xs bg-[#b2dc87]" />
                    <span className="text-slate-700 font-semibold">Wholesale Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern 2D Clustered Column Chart (Compact Mobile Height: 310px) */}
          <div className="flex-1 w-full flex flex-col pt-1 pb-1 mt-1 bg-white">
            <div className="flex-1 w-full flex items-stretch">
              {/* Left Y-Axis: Clean Numbers with Subtle Tick Marks */}
              <div className="w-8 sm:w-10 shrink-0 select-none bg-white z-10 flex flex-col justify-between">
                <svg viewBox="0 0 32 310" className="w-full h-[310px]">
                  {[400, 300, 200, 100, 0].map((val) => {
                    const ratio = val / 400;
                    const y = 265 - ratio * 230;
                    return (
                      <g key={val}>
                        {/* Clean Tick Value */}
                        <text
                          x="26"
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] sm:text-xs font-semibold fill-slate-500"
                        >
                          {val}
                        </text>
                        {/* Seamless Grid Line Tick */}
                        <line
                          x1="28"
                          y1={y}
                          x2="32"
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Scrollable Column Chart Area with Visible Custom Scrollbar */}
              <div
                ref={chartRef}
                className="flex-1 min-w-0 overflow-x-auto pt-0 pb-2 chart-scrollbar bg-white"
              >
                <div className="relative w-[840px] h-[310px] shrink-0">
                  <svg
                    viewBox="0 0 840 310"
                    className="w-[840px] h-[310px] overflow-visible select-none"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Clean Horizontal Grid Lines Across Full Width */}
                    {[400, 300, 200, 100, 0].map((val) => {
                      const ratio = val / 400;
                      const y = 265 - ratio * 230;
                      return (
                        <line
                          key={val}
                          x1="0"
                          y1={y}
                          x2="840"
                          y2={y}
                          stroke={val === 0 ? "#cbd5e1" : "#e5e7eb"}
                          strokeWidth={val === 0 ? "1.5" : "1"}
                        />
                      );
                    })}

                    {/* 12 Months 2D Clustered Columns (Tighter gap: Jan to Apr fit together on mobile screen) */}
                    {monthlyOrderData.map((item, index) => {
                      const colSpacing = 68;
                      const colStartX = 4 + index * colSpacing;
                      const bw = 22; // 22px bar width
                      const gap = 2; // 2px gap between paired bars
                      const offset = (colSpacing - (2 * bw + gap)) / 2; // 11px centered in column
                      const isSelected = activeTooltipMonth === item.month;

                      // Bar 1: Online Orders (Blue, Left)
                      const bar1X = colStartX + offset;
                      const h1 = Math.max(5, Math.round((item.online / 400) * 230));
                      const bar1Y = 265 - h1;

                      // Bar 2: Wholesale Orders (Green, Right)
                      const bar2X = bar1X + bw + gap;
                      const h2 = Math.max(5, Math.round((item.wholesale / 400) * 230));
                      const bar2Y = 265 - h2;

                      // Category Center X (for month label and tooltip)
                      const centerX = colStartX + colSpacing / 2;

                      // Colors matching reference image
                      const bar1Fill = isSelected ? "#f87171" : "#729df2";
                      const bar2Fill = isSelected ? "#fbbf24" : "#b2dc87";

                      return (
                        <g
                          key={item.month}
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltipMonth(isSelected ? null : item.month);
                          }}
                        >
                          {/* Clickable transparent hitbox for the entire column pair */}
                          <rect
                            x={colStartX}
                            y={10}
                            width={colSpacing}
                            height={285}
                            fill="transparent"
                            className="hover:fill-slate-500/5 transition-colors"
                          />

                          {/* 1. Online Bar (Blue, Left) */}
                          <rect
                            x={bar1X}
                            y={bar1Y}
                            width={bw}
                            height={h1}
                            rx="2"
                            fill={bar1Fill}
                            className="transition-all duration-200"
                          />
                          {/* Value label directly above Online Bar */}
                          <text
                            x={bar1X + bw / 2}
                            y={bar1Y - 4}
                            textAnchor="middle"
                            className="text-[10px] sm:text-xs font-semibold fill-slate-700"
                          >
                            {item.online}
                          </text>

                          {/* 2. Wholesale Bar (Green, Right) */}
                          <rect
                            x={bar2X}
                            y={bar2Y}
                            width={bw}
                            height={h2}
                            rx="2"
                            fill={bar2Fill}
                            className="transition-all duration-200"
                          />
                          {/* Value label directly above Wholesale Bar */}
                          <text
                            x={bar2X + bw / 2}
                            y={bar2Y - 4}
                            textAnchor="middle"
                            className="text-[10px] sm:text-xs font-semibold fill-slate-700"
                          >
                            {item.wholesale}
                          </text>

                          {/* Category Month Label centered beneath the pair */}
                          <text
                            x={centerX}
                            y={292}
                            textAnchor="middle"
                            className={`text-xs sm:text-sm select-none transition-colors ${
                              isSelected
                                ? "fill-slate-950 font-black"
                                : "fill-slate-600 font-semibold group-hover:fill-slate-900"
                            }`}
                          >
                            {item.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Floating Interactive Tooltip Popover hovering directly on top of the selected pair */}
                  {activeTooltipMonth && (
                    (() => {
                      const selIndex = monthlyOrderData.findIndex((m) => m.month === activeTooltipMonth);
                      const selItem = monthlyOrderData[selIndex];
                      if (!selItem || selIndex === -1) return null;

                      const colSpacing = 68;
                      const colStartX = 4 + selIndex * colSpacing;
                      const bw = 22;
                      const gap = 2;
                      const offset = (colSpacing - (2 * bw + gap)) / 2;

                      const bar1X = colStartX + offset;
                      const h1 = Math.max(5, Math.round((selItem.online / 400) * 230));
                      const bar1Y = 265 - h1;

                      const bar2X = bar1X + bw + gap;
                      const h2 = Math.max(5, Math.round((selItem.wholesale / 400) * 230));
                      const bar2Y = 265 - h2;

                      const centerX = colStartX + colSpacing / 2;
                      const topPeak = Math.min(bar1Y, bar2Y) - 14;

                      // Tooltip sits directly on top of the selected column pair
                      const tooltipHeight = 106;
                      const tooltipY = Math.max(4, topPeak - tooltipHeight - 4);
                      const tooltipLeft = Math.max(75, Math.min(765, centerX));

                      return (
                        <div
                          className="absolute z-30 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200/90 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap min-w-[145px] -translate-x-1/2 transition-all"
                          style={{ left: `${tooltipLeft}px`, top: `${tooltipY}px` }}
                        >
                          <div className="text-[14px] font-black text-slate-900 leading-tight tracking-tight">
                            {selItem.month} 2026
                          </div>
                          <div className="text-xs text-[#2563eb] font-bold flex items-center gap-2 mt-2">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#729df2] shrink-0" />
                            <span>Online: {selItem.online} orders</span>
                          </div>
                          <div className="text-xs text-[#4d7c0f] font-bold flex items-center gap-2 mt-1">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#b2dc87] shrink-0" />
                            <span>Wholesale: {selItem.wholesale} orders</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold mt-2 pt-2 border-t border-slate-100">
                            Total: {selItem.online + selItem.wholesale} orders
                          </div>

                          {/* Downward pointing caret pointing directly to the column pair */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45 pointer-events-none" />
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Legend Matching Reference Image */}
            <div className="flex items-center justify-center gap-8 pt-2.5 pb-0.5 select-none border-t border-slate-100/80 mt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-2xs bg-[#729df2]" />
                <span className="text-xs text-slate-600 font-semibold">Online Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-2xs bg-[#b2dc87]" />
                <span className="text-xs text-slate-600 font-semibold">Wholesale Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2.2 INVENTORY STATUS (Infographic 3D Segmented Donut Chart)       */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Inventory Status
              </h3>
              <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full tracking-wider">
                10,750 SKUs
              </span>
            </div>

            {/* Infographic 3D Segmented Donut Chart matching user mockup */}
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center mx-auto my-3">
              <svg className="w-full h-full drop-shadow-sm select-none" viewBox="0 0 300 300">
                <defs>
                  {/* Gradients */}
                  <linearGradient id="tealSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#357a8a" />
                    <stop offset="50%" stopColor="#2ba4b5" />
                    <stop offset="100%" stopColor="#38c9c0" />
                  </linearGradient>

                  <linearGradient id="orangeSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb03a" />
                    <stop offset="100%" stopColor="#f37324" />
                  </linearGradient>

                  <linearGradient id="redSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d4d" />
                    <stop offset="100%" stopColor="#d63031" />
                  </linearGradient>

                  <linearGradient id="arrowCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#00d2d3" stopOpacity="1" />
                  </linearGradient>

                  <radialGradient id="centerPuckGrad" cx="45%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </radialGradient>

                  <filter id="puckShadow" x="-20%" y="-20%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.22" />
                  </filter>

                  <filter id="textGlow">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Outer Sweeping Cyan Arrow Track */}
                {/* Dashed tail arc from bottom-left */}
                <path
                  d="M 42.6 213 A 124 124 0 0 0 150 274"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="6"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                {/* Solid sweeping arc from bottom to top right */}
                <path
                  d="M 150 274 A 124 124 0 0 0 251.6 87.4"
                  fill="none"
                  stroke="url(#arrowCyanGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Arrow head pointing top-right */}
                <polygon
                  points="234,92 265,72 258,103"
                  fill="#00d2d3"
                  filter="drop-shadow(0 2px 4px rgba(0,210,211,0.4))"
                />

                {/* 1. Large 70% Teal Segment */}
                <path
                  d="M 260.6 122.4 A 114 114 0 1 1 89.6 53.3 L 120.3 102.5 A 56 56 0 1 0 204.3 136.5 Z"
                  fill="url(#tealSliceGrad)"
                  className="transition-all duration-300 hover:brightness-105 cursor-pointer"
                />

                {/* Ribbon Fold shadow under Red segment on the left */}
                <polygon points="89.6,53.3 120.3,102.5 106,75" fill="#1b4d3e" opacity="0.45" />

                {/* 2. Orange 20% Segment */}
                <path
                  d="M 158 36.3 A 114 114 0 0 1 260.6 122.4 L 204.3 136.5 A 56 56 0 0 0 153.9 94.1 Z"
                  fill="url(#orangeSliceGrad)"
                  className="transition-all duration-300 hover:brightness-105 cursor-pointer"
                />

                {/* Ribbon Fold shadow between Red and Orange */}
                <polygon points="158,36.3 153.9,94.1 163,60" fill="#a1281e" opacity="0.38" />

                {/* 3. Red 10% Segment */}
                <path
                  d="M 89.6 53.3 A 114 114 0 0 1 158 36.3 L 153.9 94.1 A 56 56 0 0 0 120.3 102.5 Z"
                  fill="url(#redSliceGrad)"
                  className="transition-all duration-300 hover:brightness-105 cursor-pointer"
                />

                {/* Ribbon Fold shadow flap on Red edge */}
                <polygon points="89.6,53.3 102,48 94,62" fill="#5c1d18" opacity="0.5" />

                {/* Bold Typography inside Segments */}
                {/* 70% Text */}
                <text
                  x="122"
                  y="235"
                  textAnchor="middle"
                  fill="#ffffff"
                  filter="url(#textGlow)"
                  className="select-none pointer-events-none font-black"
                >
                  <tspan fontSize="34" fontWeight="900">70</tspan>
                  <tspan fontSize="18" fontWeight="700">%</tspan>
                </text>

                {/* 20% Text */}
                <text
                  x="204"
                  y="93"
                  textAnchor="middle"
                  fill="#ffffff"
                  filter="url(#textGlow)"
                  className="select-none pointer-events-none font-black"
                >
                  <tspan fontSize="26" fontWeight="900">20</tspan>
                  <tspan fontSize="14" fontWeight="700">%</tspan>
                </text>

                {/* 10% Text */}
                <text
                  x="129"
                  y="72"
                  textAnchor="middle"
                  fill="#ffffff"
                  filter="url(#textGlow)"
                  className="select-none pointer-events-none font-black"
                >
                  <tspan fontSize="20" fontWeight="900">10</tspan>
                  <tspan fontSize="12" fontWeight="700">%</tspan>
                </text>

                {/* Central 3D Embossed Ring & Concave Hole */}
                <circle cx="150" cy="150" r="54" fill="url(#centerPuckGrad)" filter="url(#puckShadow)" />
                <circle cx="150" cy="150" r="48" fill="#ffffff" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="150" cy="150" r="46" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="150" cy="150" r="30" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="28" fill="#ffffff" />
              </svg>
            </div>

            {/* Status Breakdown Legend Matching 70% / 20% / 10% */}
            <div className="space-y-2.5 text-sm font-semibold pt-1.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50/60 border border-teal-100/70">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#2ba4b5] to-[#38c9c0] shrink-0 shadow-2xs" />
                  <span className="font-bold text-teal-900 text-sm">In Stock (70%)</span>
                </div>
                <span className="font-black text-slate-900 text-sm">8,250</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-100/70">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#ffb03a] to-[#f37324] shrink-0 shadow-2xs" />
                  <span className="font-bold text-amber-900 text-sm">Low Stock (20%)</span>
                </div>
                <span className="font-black text-slate-900 text-sm">1,650</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60 border border-rose-100/70">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#ff4d4d] to-[#d63031] shrink-0 shadow-2xs" />
                  <span className="font-bold text-rose-900 text-sm">Out of Stock (10%)</span>
                </div>
                <span className="font-black text-slate-900 text-sm">850</span>
              </div>
            </div>
          </div>

          {/* View Inventory Action Button */}
          <Link
            href="/inventory"
            className="w-full mt-4 py-2.5 px-3 rounded-xl border border-teal-200/90 bg-teal-50/50 hover:bg-teal-100/70 text-teal-800 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-2xs group"
          >
            <Box className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
            <span>View Full Inventory</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ================================================================= */}
        {/* 2.3 RECENT ORDERS LIST                                            */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Recent Orders
              </h3>
              <Link
                href="/distributor-orders"
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Orders Stack */}
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => {
                const IconComponent = ord.icon;
                return (
                  <div
                    key={ord.id}
                    onClick={() => router.push("/distributor-orders")}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/70 rounded-xl px-1.5 -mx-1.5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl ${ord.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {ord.id}
                        </div>
                        <div className="text-xs sm:text-[13px] text-slate-500 font-medium truncate">
                          {ord.pharmacy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {ord.amount}
                        </div>
                        <span className={`inline-block text-[10.5px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full border ${ord.statusColor}`}>
                          {ord.status}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. THIRD ROW: TOP SELLING, LOW STOCK & QUICK ACTIONS                 */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ================================================================= */}
        {/* 3.1 TOP SELLING PRODUCTS TABLE (5 Columns)                        */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Top Selling Products
              </h3>
              <Link
                href="/inventory"
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 pr-2 w-6">#</th>
                    <th className="py-2.5 px-2">Product Name</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2 text-right">Stock</th>
                    <th className="py-2.5 px-2 text-right">Sold (30 Days)</th>
                    <th className="py-2.5 pl-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSellingProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => router.push("/inventory")}
                    >
                      <td className="py-2.5 pr-2 font-bold text-slate-400 text-sm">{p.id}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-contain p-0.5 border border-slate-200/80 bg-white shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium truncate">
                              {p.generic}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 font-medium text-sm">{p.category}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-slate-700 text-sm">{p.stock}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900 text-sm">{p.sold}</td>
                      <td className="py-2.5 pl-2 text-right">
                        <div className="font-black text-slate-900 text-sm">{p.revenue}</div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3.2 LOW STOCK PRODUCTS (3 Columns)                                */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Low Stock Products
              </h3>
              <Link
                href="/inventory"
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 pr-2">Product</th>
                    <th className="py-2.5 px-2 text-center">Current Stock</th>
                    <th className="py-2.5 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => router.push("/inventory")}
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded-md object-contain border border-slate-200/80 bg-white shrink-0"
                          />
                          <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-slate-800 text-sm">{p.stock}</td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className={`inline-block text-[10.5px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${p.statusColor}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3.3 QUICK ACTIONS (2x3 Grid of 6 Operations)                      */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Quick Actions
            </h3>

            {/* 2x3 Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3">
              
              {/* 1. Add Product */}
              <button
                onClick={() => router.push("/inventory")}
                className="p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Box className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-[#241B52] transition-colors leading-tight">
                  Add Product
                </div>
              </button>

              {/* 2. Create Order */}
              <button
                onClick={() => setIsQuickOrderOpen(true)}
                className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-blue-950 transition-colors leading-tight">
                  Create Order
                </div>
              </button>

              {/* 3. Add Supplier */}
              <button
                onClick={() => router.push("/distributor-orders")}
                className="p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-purple-950 transition-colors leading-tight">
                  Add Supplier
                </div>
              </button>

              {/* 4. Manage Inventory */}
              <button
                onClick={() => router.push("/inventory")}
                className="p-3 rounded-xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Home className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-orange-950 transition-colors leading-tight">
                  Manage Inventory
                </div>
              </button>

              {/* 5. View Reports */}
              <button
                onClick={() => router.push("/reports")}
                className="p-3 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-rose-950 transition-colors leading-tight">
                  View Reports
                </div>
              </button>

              {/* 6. Analytics */}
              <button
                onClick={() => router.push("/reports")}
                className="p-3 rounded-xl bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <PieChart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-cyan-950 transition-colors leading-tight">
                  Analytics
                </div>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. FOURTH ROW: INTEGRATED PHARMACY MANAGEMENT SYSTEMS (8 MODULES)    */}
      {/* =================================================================== */}
      <div className="space-y-3 pt-2">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                Integrated Pharmacy Management Systems
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1">
                Everything you need to run your pharmacy business, in one powerful platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              8 Enterprise Modules Active
            </span>
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Manage Modules</span>
            </Link>
          </div>
        </div>

        {/* 8 Enterprise Modules 4x2 Grid matching user mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Daily Sales POS",
              desc: "Fast billing, returns and thermal printing.",
              href: "/pos",
              btnText: "Open POS",
              image: "/images/module-pos.png",
              iconBg: "bg-[#4F46E5]",
              cardBg: "bg-[#EEF2FF] border-[#E0E7FF] hover:border-indigo-400 hover:shadow-indigo-100/50",
              icon: ShoppingCart,
            },
            {
              title: "Medicine Stock",
              desc: "Batch tracking, expiry alerts and stock control.",
              href: "/inventory",
              btnText: "Manage Stock",
              image: "/images/module-stock.png",
              iconBg: "bg-[#0088ff]",
              cardBg: "bg-[#edf6ff] border-[#d4e7fe] hover:border-blue-400 hover:shadow-blue-100/50",
              icon: Box,
            },
            {
              title: "Company Orders",
              desc: "Send orders to manufacturers via app.",
              href: "/distributor-orders",
              btnText: "Create Order",
              image: "/images/module-truck.png",
              iconBg: "bg-orange-500",
              cardBg: "bg-[#fff7ee] border-[#fedcc2] hover:border-orange-400 hover:shadow-orange-100/50",
              icon: Truck,
            },
            {
              title: "Customer Due",
              desc: "Baki khata, customer ledger & SMS alerts.",
              href: "/customer-due",
              btnText: "View Customers",
              image: "/images/module-customer.png",
              iconBg: "bg-pink-500",
              cardBg: "bg-[#fef2f6] border-[#fcd5e5] hover:border-pink-400 hover:shadow-pink-100/50",
              icon: Users,
            },
            {
              title: "Staff & Payroll",
              desc: "Manage staff, salary and attendance.",
              href: "/employees",
              btnText: "Manage Staff",
              image: "/images/module-staff.png",
              iconBg: "bg-purple-500",
              cardBg: "bg-[#f7f2fe] border-[#eddcff] hover:border-purple-400 hover:shadow-purple-100/50",
              icon: Users,
            },
            {
              title: "Reports & BI",
              desc: "Sales trends, top brands and net profit.",
              href: "/reports",
              btnText: "View Reports",
              image: "/images/module-reports.png",
              iconBg: "bg-cyan-500",
              cardBg: "bg-[#edf8fd] border-[#d2f0fd] hover:border-cyan-400 hover:shadow-cyan-100/50",
              icon: BarChart3,
            },
            {
              title: "Expenses",
              desc: "Rent, electricity, OPEX and full expense.",
              href: "/expenses",
              btnText: "Manage Expenses",
              image: "/images/module-expenses.png",
              iconBg: "bg-amber-500",
              cardBg: "bg-[#fff9ea] border-[#fef2b8] hover:border-amber-400 hover:shadow-amber-100/50",
              icon: TakaIcon,
            },
            {
              title: "MR Portal",
              desc: "Manage field staff and visit reports.",
              href: "/mr-portal",
              btnText: "Open MR Portal",
              image: "/images/module-mr.png",
              iconBg: "bg-blue-600",
              cardBg: "bg-[#edf6fd] border-[#d1e7fd] hover:border-blue-400 hover:shadow-blue-100/50",
              icon: Briefcase,
            },
          ].map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`${mod.cardBg} rounded-2xl p-4 border hover:shadow-lg transition-all flex items-center justify-between gap-3 group relative overflow-hidden`}
            >
              <div className="flex-1 space-y-1 z-10 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${mod.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    <mod.icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-colors pt-1 truncate">
                  {mod.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="pt-2 flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  <span>{mod.btnText}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* 3D Illustration Graphic */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
                <img
                  src={mod.image}
                  alt={mod.title}
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 rounded-xl"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};
