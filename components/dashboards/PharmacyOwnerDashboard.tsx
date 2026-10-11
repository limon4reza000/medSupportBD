"use client";

import React, { useState } from "react";
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
  DollarSign,
  Briefcase,
  Settings,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const PharmacyOwnerDashboard: React.FC = () => {
  const router = useRouter();
  const { currentPharmacy, setIsQuickOrderOpen, setIsSearchOpen } = useApp();

  // State for interactive order chart timeframe
  const [chartTimeframe, setChartTimeframe] = useState<string>("Last 12 Months");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [activeTooltipMonth, setActiveTooltipMonth] = useState<string>("Jul");

  // 12-Month Order Overview Data matching user mockup
  const monthlyOrderData = [
    { month: "Jan", online: 80, wholesale: 40 },
    { month: "Feb", online: 115, wholesale: 50 },
    { month: "Mar", online: 140, wholesale: 65 },
    { month: "Apr", online: 125, wholesale: 72 },
    { month: "May", online: 160, wholesale: 102 },
    { month: "Jun", online: 182, wholesale: 116 },
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
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Truck,
      iconBg: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* =================================================================== */}
      {/* 1. TOP ROW: 4 METRIC KPI CARDS                                      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-[#1e60d5] shrink-0 shadow-2xs">
              <Box className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Products</div>
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 mt-0.5 tracking-tight leading-none">
                25,430
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <span className="text-emerald-600 font-bold flex items-center">↗ +12%</span>
                <span className="text-slate-400">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Suppliers */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Suppliers</div>
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 mt-0.5 tracking-tight leading-none">
                350+
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <span className="text-emerald-600 font-bold flex items-center">↗ +8%</span>
                <span className="text-slate-400">Active suppliers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-500 shrink-0 shadow-2xs">
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Orders</div>
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 mt-0.5 tracking-tight leading-none">
                1,200+
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <span className="text-emerald-600 font-bold flex items-center">↗ +18%</span>
                <span className="text-slate-400">This month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: On-Time Delivery */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
              <Truck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">On-Time Delivery</div>
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 mt-0.5 tracking-tight leading-none">
                99%
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <span className="text-emerald-600 font-bold flex items-center">↗ +2%</span>
                <span className="text-slate-400">Delivery success rate</span>
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
        <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
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
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-700 px-3 sm:px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <span>{chartTimeframe}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[145px] text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                      {["Last 12 Months", "Last 6 Months", "Last 30 Days"].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => {
                            setChartTimeframe(tf);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
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

                {/* Legends */}
                <div className="hidden sm:flex items-center gap-3.5 text-xs sm:text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0080ff] shrink-0" />
                    <span className="text-slate-700 font-semibold">Online Orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00d084] shrink-0" />
                    <span className="text-slate-700 font-semibold">Wholesale Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Legend row */}
            <div className="flex sm:hidden items-center gap-3 text-xs font-medium text-slate-600 pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0080ff] shrink-0" />
                <span className="text-slate-700">Online Orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d084] shrink-0" />
                <span className="text-slate-700">Wholesale Orders</span>
              </div>
            </div>

            {/* Dual Bar Chart Area (Taller & Roomier) */}
            <div className="relative pt-14 sm:pt-16 pb-2 mt-1">
              {/* Y-axis Ticks & Horizontal Grid Lines */}
              <div className="absolute inset-x-0 top-14 sm:top-16 bottom-8 flex flex-col justify-between pointer-events-none select-none text-[11px] sm:text-xs text-slate-400 font-medium">
                <div className="border-b border-slate-100 flex items-center justify-between pb-0.5">
                  <span className="w-7 text-right pr-2">400</span>
                  <div className="flex-1" />
                </div>
                <div className="border-b border-slate-100 flex items-center justify-between pb-0.5">
                  <span className="w-7 text-right pr-2">300</span>
                  <div className="flex-1" />
                </div>
                <div className="border-b border-slate-100 flex items-center justify-between pb-0.5">
                  <span className="w-7 text-right pr-2">200</span>
                  <div className="flex-1" />
                </div>
                <div className="border-b border-slate-100 flex items-center justify-between pb-0.5">
                  <span className="w-7 text-right pr-2">100</span>
                  <div className="flex-1" />
                </div>
                <div className="border-b border-slate-200 flex items-center justify-between pb-0.5">
                  <span className="w-7 text-right pr-2 text-slate-400">0</span>
                  <div className="flex-1" />
                </div>
              </div>

              {/* 12 Bars Columns */}
              <div className="relative pl-9 sm:pl-10 pr-2 h-64 sm:h-72 lg:h-80 flex items-end justify-between gap-1 sm:gap-2">
                {monthlyOrderData.map((item) => {
                  const onlineHeight = Math.min(100, Math.max(4, Math.round((item.online / 400) * 100)));
                  const wholesaleHeight = Math.min(100, Math.max(4, Math.round((item.wholesale / 400) * 100)));
                  const isHovered = activeTooltipMonth === item.month;

                  return (
                    <div
                      key={item.month}
                      className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                      onMouseEnter={() => setActiveTooltipMonth(item.month)}
                    >
                      {/* Interactive Floating Tooltip (matching Jul 2026 screenshot) */}
                      {isHovered && (
                        <div className="absolute -top-14 sm:-top-16 z-30 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-100 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap min-w-[110px]">
                          <div className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">
                            {item.month} 2026
                          </div>
                          <div className="text-[11px] sm:text-xs text-[#0080ff] font-bold flex items-center gap-1.5 mt-1 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-[#0080ff] shrink-0" />
                            <span>Online: {item.online}</span>
                          </div>
                          <div className="text-[11px] sm:text-xs text-[#00d084] font-bold flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-[#00d084] shrink-0" />
                            <span>Wholesale: {item.wholesale}</span>
                          </div>
                        </div>
                      )}

                      {/* Side by side Bars */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                        {/* Blue Online Bar */}
                        <div
                          className="w-2 sm:w-3 md:w-3.5 lg:w-4 rounded-t-sm sm:rounded-t-md bg-[#0080ff] transition-all duration-300 hover:brightness-110"
                          style={{ height: `${onlineHeight}%` }}
                        />
                        {/* Green Wholesale Bar */}
                        <div
                          className="w-2 sm:w-3 md:w-3.5 lg:w-4 rounded-t-sm sm:rounded-t-md bg-[#00d084] transition-all duration-300 hover:brightness-110"
                          style={{ height: `${wholesaleHeight}%` }}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1.5 select-none transition-colors group-hover:text-slate-900">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2.2 INVENTORY STATUS (Donut Chart & Metrics)                      */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Inventory Status
            </h3>

            {/* Circular Donut & Legend Container */}
            <div className="flex items-center justify-between gap-4 py-4 sm:py-5">
              
              {/* Donut Chart SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />
                  {/* Out of Stock (Red) - 1.5% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray="251.3"
                    strokeDashoffset="0"
                  />
                  {/* Low Stock (Yellow) - 4% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray="251.3"
                    strokeDashoffset="3.8"
                  />
                  {/* In Stock (Green) - 94.5% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#00c48c"
                    strokeWidth="12"
                    strokeDasharray="251.3"
                    strokeDashoffset="14"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                    95%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    In Stock
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="space-y-2 text-xs font-semibold flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00c48c]" />
                    <span>In Stock</span>
                  </div>
                  <span className="font-bold text-slate-900">8,250</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span>Low Stock</span>
                  </div>
                  <span className="font-bold text-slate-900">620</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span>Out of Stock</span>
                  </div>
                  <span className="font-bold text-slate-900">180</span>
                </div>
              </div>

            </div>
          </div>

          {/* View Inventory Action Button */}
          <Link
            href="/inventory"
            className="w-full py-2.5 px-3 rounded-xl border border-blue-200/90 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group"
          >
            <Box className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>View Inventory</span>
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
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
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
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {ord.id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate">
                          {ord.pharmacy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800">
                          {ord.amount}
                        </div>
                        <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border ${ord.statusColor}`}>
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
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Top Selling Products
              </h3>
              <Link
                href="/inventory"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                      <td className="py-2.5 pr-2 font-bold text-slate-400 text-xs">{p.id}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded-lg object-contain p-0.5 border border-slate-200/80 bg-white shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate">
                              {p.generic}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 font-medium">{p.category}</td>
                      <td className="py-2.5 px-2 text-right font-medium text-slate-600">{p.stock}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-slate-800">{p.sold}</td>
                      <td className="py-2.5 pl-2 text-right">
                        <div className="font-bold text-slate-900">{p.revenue}</div>
                        <div className="w-16 h-1 bg-slate-100 rounded-full ml-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
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
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Low Stock Products
              </h3>
              <Link
                href="/inventory"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                            className="w-6 h-6 rounded-md object-contain border border-slate-200/80 bg-white shrink-0"
                          />
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700">{p.stock}</td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${p.statusColor}`}>
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
                className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-left transition-all active:scale-95 group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Box className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-950 transition-colors leading-tight">
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
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-950 transition-colors leading-tight">
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
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-950 transition-colors leading-tight">
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
                <div className="text-xs font-bold text-slate-800 group-hover:text-orange-950 transition-colors leading-tight">
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
                <div className="text-xs font-bold text-slate-800 group-hover:text-rose-950 transition-colors leading-tight">
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
                <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-950 transition-colors leading-tight">
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
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#00c48c] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                Integrated Pharmacy Management Systems
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Everything you need to run your pharmacy business, in one powerful platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              8 Enterprise Modules Active
            </span>
            <Link
              href="/settings"
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
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
              iconBg: "bg-[#00c48c]",
              cardBg: "bg-[#ebfbf3] border-[#cbf0dd] hover:border-emerald-400 hover:shadow-emerald-100/50",
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
              icon: DollarSign,
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
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors pt-1 truncate">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  <span>{mod.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
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
