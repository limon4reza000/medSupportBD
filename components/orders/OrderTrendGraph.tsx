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
  CheckCircle2,
  PackageCheck,
  Truck,
  Activity,
  Boxes,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { OrderStatus } from "@/types/domain";

export const OrderTrendGraph: React.FC<{ title?: string }> = ({
  title = "Pharma Territory Business Intelligence & Analytics Suite",
}) => {
  const { orders, medicines } = useApp();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [monthIndex, setMonthIndex] = useState(8); // Default: September (2026)
  const [activeCategory, setActiveCategory] = useState("TABLET");

  const currentMonthName = months[monthIndex];

  const handlePrevMonth = () => {
    setMonthIndex((prev) => (prev === 0 ? months.length - 1 : prev - 1));
  };

  const handleNextMonth = () => {
    setMonthIndex((prev) => (prev === months.length - 1 ? 0 : prev + 1));
  };

  // 1. Filter live orders for the selected month
  const selectedMonthOrders = orders.filter((o) => {
    if (!o.orderDate) return false;
    const d = new Date(o.orderDate);
    return d.getMonth() === monthIndex;
  });

  const liveOrdersCount = selectedMonthOrders.length;
  const liveDeliveredCount = selectedMonthOrders.filter((o) => o.status === OrderStatus.DELIVERED).length;
  const liveProcessingCount = selectedMonthOrders.filter((o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.DISPATCHED).length;
  const liveNetRevenue = selectedMonthOrders.reduce((sum, o) => sum + o.netPayableAmount, 0);
  const liveBilledPieces = selectedMonthOrders.reduce((sum, o) => sum + o.totalLoosePieces, 0);
  const liveBonusPieces = selectedMonthOrders.reduce((sum, o) => sum + o.totalBonusPieces, 0);

  // Brand totals for selected month
  const monthBrandTotals: Record<string, number> = {};
  selectedMonthOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      monthBrandTotals[item.brandName] = (monthBrandTotals[item.brandName] || 0) + item.looseUnitsBilled;
    });
  });

  // Pre-configured baseline monthly datasets for 12 months (All update when monthIndex changes)
  const monthlyDatabase: Record<
    number,
    {
      totalOrders: number;
      billedPieces: number;
      bonusPieces: number;
      totalRevenue: string;
      growth: string;
      peakValue: string;
      clinicalGauge: number;
      fulfillGauge: number;
      dispenseGauge: number;
      recoveryGauge: number;
      brand1: { name: string; count: number; dir: "up" | "down"; ratio: number };
      brand2: { name: string; count: number; dir: "up" | "down"; ratio: number };
      brand3: { name: string; count: number; dir: "up" | "down"; ratio: number };
      donutSegments: { label: string; value: string; color: string }[];
      sparkValues: [number, number, number];
    }
  > = {
    0: { // Jan
      totalOrders: 18,
      billedPieces: 11240,
      bonusPieces: 890,
      totalRevenue: "৳84,120.00",
      growth: "+8.4%",
      peakValue: "14,250",
      clinicalGauge: 72,
      fulfillGauge: 82,
      dispenseGauge: 75,
      recoveryGauge: 91,
      brand1: { name: "NAPA EXTRA", count: 5400, dir: "up", ratio: 18 },
      brand2: { name: "ACE PLUS", count: 3200, dir: "down", ratio: 12 },
      brand3: { name: "SECLO 20", count: 2640, dir: "up", ratio: 15 },
      donutSegments: [
        { label: "Jan Billed", value: "11,240", color: "#F59E0B" },
        { label: "Trade Scheme", value: "22,150", color: "#F97316" },
        { label: "Bonus Units", value: "4,890", color: "#EF4444" },
        { label: "Prescriptions", value: "31,200", color: "#EC4899" },
        { label: "OTC Reorder", value: "25,640", color: "#3B82F6" },
        { label: "Institutional", value: "24,100", color: "#8B5CF6" },
      ],
      sparkValues: [3120, 4890, 2640],
    },
    1: { // Feb
      totalOrders: 20,
      billedPieces: 12800,
      bonusPieces: 1100,
      totalRevenue: "৳89,450.50",
      growth: "+10.1%",
      peakValue: "15,890",
      clinicalGauge: 74,
      fulfillGauge: 85,
      dispenseGauge: 78,
      recoveryGauge: 92,
      brand1: { name: "NAPA EXTRA", count: 6100, dir: "up", ratio: 20 },
      brand2: { name: "ACE PLUS", count: 3900, dir: "up", ratio: 14 },
      brand3: { name: "SECLO 20", count: 2800, dir: "down", ratio: 10 },
      donutSegments: [
        { label: "Feb Billed", value: "12,800", color: "#F59E0B" },
        { label: "Trade Scheme", value: "24,600", color: "#F97316" },
        { label: "Bonus Units", value: "5,100", color: "#EF4444" },
        { label: "Prescriptions", value: "33,400", color: "#EC4899" },
        { label: "OTC Reorder", value: "27,800", color: "#3B82F6" },
        { label: "Institutional", value: "26,500", color: "#8B5CF6" },
      ],
      sparkValues: [3340, 5100, 2800],
    },
    2: { // Mar
      totalOrders: 22,
      billedPieces: 13500,
      bonusPieces: 950,
      totalRevenue: "৳92,780.00",
      growth: "+11.5%",
      peakValue: "16,420",
      clinicalGauge: 78,
      fulfillGauge: 88,
      dispenseGauge: 82,
      recoveryGauge: 93,
      brand1: { name: "NAPA EXTRA", count: 6500, dir: "up", ratio: 21 },
      brand2: { name: "SECLO 20", count: 4200, dir: "up", ratio: 16 },
      brand3: { name: "ZIMAX 500", count: 2800, dir: "down", ratio: 11 },
      donutSegments: [
        { label: "Mar Billed", value: "13,500", color: "#F59E0B" },
        { label: "Trade Scheme", value: "26,100", color: "#F97316" },
        { label: "Bonus Units", value: "4,950", color: "#EF4444" },
        { label: "Prescriptions", value: "35,800", color: "#EC4899" },
        { label: "OTC Reorder", value: "29,200", color: "#3B82F6" },
        { label: "Institutional", value: "28,100", color: "#8B5CF6" },
      ],
      sparkValues: [3580, 4950, 2920],
    },
    3: { // Apr
      totalOrders: 24,
      billedPieces: 14100,
      bonusPieces: 1050,
      totalRevenue: "৳95,110.25",
      growth: "+12.8%",
      peakValue: "16,980",
      clinicalGauge: 80,
      fulfillGauge: 86,
      dispenseGauge: 80,
      recoveryGauge: 94,
      brand1: { name: "NAPA EXTRA", count: 6800, dir: "up", ratio: 22 },
      brand2: { name: "ACE PLUS", count: 4300, dir: "up", ratio: 15 },
      brand3: { name: "SERGEL 20", count: 3000, dir: "up", ratio: 13 },
      donutSegments: [
        { label: "Apr Billed", value: "14,100", color: "#F59E0B" },
        { label: "Trade Scheme", value: "27,500", color: "#F97316" },
        { label: "Bonus Units", value: "5,050", color: "#EF4444" },
        { label: "Prescriptions", value: "36,900", color: "#EC4899" },
        { label: "OTC Reorder", value: "30,100", color: "#3B82F6" },
        { label: "Institutional", value: "29,200", color: "#8B5CF6" },
      ],
      sparkValues: [3690, 5050, 3010],
    },
    4: { // May
      totalOrders: 25,
      billedPieces: 14500,
      bonusPieces: 1120,
      totalRevenue: "৳97,630.00",
      growth: "+13.6%",
      peakValue: "17,310",
      clinicalGauge: 82,
      fulfillGauge: 89,
      dispenseGauge: 84,
      recoveryGauge: 95,
      brand1: { name: "NAPA EXTRA", count: 7000, dir: "up", ratio: 23 },
      brand2: { name: "SECLO 20", count: 4500, dir: "up", ratio: 16 },
      brand3: { name: "FEXO 120", count: 3000, dir: "down", ratio: 11 },
      donutSegments: [
        { label: "May Billed", value: "14,500", color: "#F59E0B" },
        { label: "Trade Scheme", value: "28,700", color: "#F97316" },
        { label: "Bonus Units", value: "5,120", color: "#EF4444" },
        { label: "Prescriptions", value: "37,800", color: "#EC4899" },
        { label: "OTC Reorder", value: "30,800", color: "#3B82F6" },
        { label: "Institutional", value: "29,900", color: "#8B5CF6" },
      ],
      sparkValues: [3780, 5120, 3080],
    },
    5: { // Jun
      totalOrders: 27,
      billedPieces: 14877,
      bonusPieces: 1173,
      totalRevenue: "৳99,845.45",
      growth: "+14.2%",
      peakValue: "17,756",
      clinicalGauge: 84,
      fulfillGauge: 90,
      dispenseGauge: 85,
      recoveryGauge: 94,
      brand1: { name: "NAPA EXTRA", count: 7200, dir: "up", ratio: 24 },
      brand2: { name: "ACE PLUS", count: 4600, dir: "down", ratio: 14 },
      brand3: { name: "MONAS 10", count: 3077, dir: "up", ratio: 12 },
      donutSegments: [
        { label: "June Billed", value: "14,877", color: "#F59E0B" },
        { label: "Trade Scheme", value: "29,472", color: "#F97316" },
        { label: "Bonus Units", value: "5,173", color: "#EF4444" },
        { label: "Prescriptions", value: "38,552", color: "#EC4899" },
        { label: "OTC Reorder", value: "31,346", color: "#3B82F6" },
        { label: "Institutional", value: "30,255", color: "#8B5CF6" },
      ],
      sparkValues: [3855, 5173, 3134],
    },
    6: { // Jul
      totalOrders: 28,
      billedPieces: 15400,
      bonusPieces: 1300,
      totalRevenue: "৳102,450.00",
      growth: "+15.8%",
      peakValue: "18,420",
      clinicalGauge: 85,
      fulfillGauge: 91,
      dispenseGauge: 87,
      recoveryGauge: 96,
      brand1: { name: "NAPA EXTRA", count: 7500, dir: "up", ratio: 24 },
      brand2: { name: "SECLO 20", count: 4800, dir: "up", ratio: 17 },
      brand3: { name: "CIPROCIN 500", count: 3100, dir: "up", ratio: 13 },
      donutSegments: [
        { label: "July Billed", value: "15,400", color: "#F59E0B" },
        { label: "Trade Scheme", value: "30,800", color: "#F97316" },
        { label: "Bonus Units", value: "5,300", color: "#EF4444" },
        { label: "Prescriptions", value: "39,800", color: "#EC4899" },
        { label: "OTC Reorder", value: "32,500", color: "#3B82F6" },
        { label: "Institutional", value: "31,400", color: "#8B5CF6" },
      ],
      sparkValues: [3980, 5300, 3250],
    },
    7: { // Aug
      totalOrders: 30,
      billedPieces: 16100,
      bonusPieces: 1450,
      totalRevenue: "৳105,890.75",
      growth: "+17.1%",
      peakValue: "19,150",
      clinicalGauge: 88,
      fulfillGauge: 93,
      dispenseGauge: 89,
      recoveryGauge: 95,
      brand1: { name: "NAPA EXTRA", count: 7900, dir: "up", ratio: 25 },
      brand2: { name: "ACE PLUS", count: 5000, dir: "down", ratio: 15 },
      brand3: { name: "ZIMAX 500", count: 3200, dir: "up", ratio: 12 },
      donutSegments: [
        { label: "Aug Billed", value: "16,100", color: "#F59E0B" },
        { label: "Trade Scheme", value: "31,900", color: "#F97316" },
        { label: "Bonus Units", value: "5,450", color: "#EF4444" },
        { label: "Prescriptions", value: "41,200", color: "#EC4899" },
        { label: "OTC Reorder", value: "33,800", color: "#3B82F6" },
        { label: "Institutional", value: "32,700", color: "#8B5CF6" },
      ],
      sparkValues: [4120, 5450, 3380],
    },
    8: { // Sep (Current active month with live orders)
      totalOrders: Math.max(2, liveOrdersCount),
      billedPieces: liveBilledPieces > 0 ? liveBilledPieces : 5300,
      bonusPieces: liveBonusPieces > 0 ? liveBonusPieces : 300,
      totalRevenue: liveNetRevenue > 0 ? `৳${(126316.80 + liveNetRevenue).toLocaleString("en-BD", { minimumFractionDigits: 2 })}` : "৳131,585.28",
      growth: "+18.4%",
      peakValue: (19840 + (liveBilledPieces || 5300)).toLocaleString(),
      clinicalGauge: 66,
      fulfillGauge: liveOrdersCount > 0 ? Math.round((liveProcessingCount / liveOrdersCount) * 100) : 50,
      dispenseGauge: liveOrdersCount > 0 ? Math.round((liveDeliveredCount / liveOrdersCount) * 100) : 50,
      recoveryGauge: 94,
      brand1: { name: "NAPA EXTRA", count: monthBrandTotals["Napa Extra"] || 2000, dir: "up", ratio: 18 },
      brand2: { name: "ACE PLUS", count: monthBrandTotals["Ace Plus"] || 1600, dir: "down", ratio: 14 },
      brand3: { name: "SECLO 20", count: monthBrandTotals["Seclo 20"] || 100, dir: "up", ratio: 19 },
      donutSegments: [
        { label: "Sep Billed", value: (22100 + (liveBilledPieces || 5300)).toLocaleString(), color: "#F59E0B" },
        { label: "Trade Scheme", value: "32,600", color: "#F97316" },
        { label: "Bonus Units", value: (5900 + (liveBonusPieces || 300)).toLocaleString(), color: "#EF4444" },
        { label: "Prescriptions", value: "42,500", color: "#EC4899" },
        { label: "OTC Reorder", value: "34,900", color: "#3B82F6" },
        { label: "Institutional", value: "33,800", color: "#8B5CF6" },
      ],
      sparkValues: [4250, 5900, 3490],
    },
    9: { // Oct
      totalOrders: 33,
      billedPieces: 17400,
      bonusPieces: 1600,
      totalRevenue: "৳112,640.50",
      growth: "+19.9%",
      peakValue: "20,560",
      clinicalGauge: 89,
      fulfillGauge: 94,
      dispenseGauge: 90,
      recoveryGauge: 96,
      brand1: { name: "NAPA EXTRA", count: 8500, dir: "up", ratio: 26 },
      brand2: { name: "SECLO 20", count: 5400, dir: "up", ratio: 18 },
      brand3: { name: "SERGEL 20", count: 3500, dir: "up", ratio: 14 },
      donutSegments: [
        { label: "Oct Billed", value: "17,400", color: "#F59E0B" },
        { label: "Trade Scheme", value: "33,800", color: "#F97316" },
        { label: "Bonus Units", value: "5,800", color: "#EF4444" },
        { label: "Prescriptions", value: "44,100", color: "#EC4899" },
        { label: "OTC Reorder", value: "36,200", color: "#3B82F6" },
        { label: "Institutional", value: "35,100", color: "#8B5CF6" },
      ],
      sparkValues: [4410, 5800, 3620],
    },
    10: { // Nov
      totalOrders: 35,
      billedPieces: 18200,
      bonusPieces: 1750,
      totalRevenue: "৳116,980.00",
      growth: "+21.3%",
      peakValue: "21,340",
      clinicalGauge: 91,
      fulfillGauge: 95,
      dispenseGauge: 92,
      recoveryGauge: 97,
      brand1: { name: "NAPA EXTRA", count: 8900, dir: "up", ratio: 27 },
      brand2: { name: "ACE PLUS", count: 5600, dir: "down", ratio: 16 },
      brand3: { name: "FEXO 120", count: 3700, dir: "up", ratio: 14 },
      donutSegments: [
        { label: "Nov Billed", value: "18,200", color: "#F59E0B" },
        { label: "Trade Scheme", value: "35,100", color: "#F97316" },
        { label: "Bonus Units", value: "6,000", color: "#EF4444" },
        { label: "Prescriptions", value: "45,800", color: "#EC4899" },
        { label: "OTC Reorder", value: "37,600", color: "#3B82F6" },
        { label: "Institutional", value: "36,500", color: "#8B5CF6" },
      ],
      sparkValues: [4580, 6000, 3760],
    },
    11: { // Dec
      totalOrders: 38,
      billedPieces: 19100,
      bonusPieces: 1900,
      totalRevenue: "৳121,450.00",
      growth: "+23.5%",
      peakValue: "22,480",
      clinicalGauge: 94,
      fulfillGauge: 97,
      dispenseGauge: 95,
      recoveryGauge: 98,
      brand1: { name: "NAPA EXTRA", count: 9400, dir: "up", ratio: 28 },
      brand2: { name: "SECLO 20", count: 5900, dir: "up", ratio: 19 },
      brand3: { name: "ZIMAX 500", count: 3800, dir: "up", ratio: 15 },
      donutSegments: [
        { label: "Dec Billed", value: "19,100", color: "#F59E0B" },
        { label: "Trade Scheme", value: "36,500", color: "#F97316" },
        { label: "Bonus Units", value: "6,250", color: "#EF4444" },
        { label: "Prescriptions", value: "47,600", color: "#EC4899" },
        { label: "OTC Reorder", value: "39,100", color: "#3B82F6" },
        { label: "Institutional", value: "37,900", color: "#8B5CF6" },
      ],
      sparkValues: [4760, 6250, 3910],
    },
  };

  // Active month data selection (Updates when monthIndex changes)
  const activeMonthData = monthlyDatabase[monthIndex] || monthlyDatabase[8];

  // Days count for selected month (28, 30, or 31)
  const daysInMonth = currentMonthName === "February" ? 28 : ["April", "June", "September", "November"].includes(currentMonthName) ? 30 : 31;

  // Generate dynamic wave Y values for full month timeline based on monthIndex
  const wavePoints = Array.from({ length: daysInMonth }).map((_, idx) => {
    const dayNum = idx + 1;
    const seed = (idx * 17 + (monthIndex + 1) * 23 + activeMonthData.totalOrders * 7) % 100;
    const baseWave = Math.sin((dayNum / daysInMonth) * Math.PI * 6) * 45;
    const yVal = 105 + baseWave + (seed % 35) - 18;
    return {
      x: 20 + idx * 25,
      y: Math.max(25, Math.min(175, yVal)),
      day: String(dayNum).padStart(2, "0"),
    };
  });

  // Build smooth cubic bezier curve string for full month
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
  const endX = wavePoints[wavePoints.length - 1]?.x || 770;

  // Capsule Bar Chart heights (14 items) shifting per month & active category
  const categoryHeightsMap: Record<string, number[]> = {
    TABLET: [60, 85, 95, 70, 90, 100, 80, 85, 75, 95, 65, 80, 90, 75].map((h) => Math.min(100, Math.max(30, h + (monthIndex % 5) * 3 - 6))),
    CAPSULE: [50, 70, 80, 60, 75, 85, 65, 75, 60, 80, 55, 70, 80, 65].map((h) => Math.min(100, Math.max(30, h + (monthIndex % 4) * 4 - 4))),
    ANTIBIOTIC: [80, 90, 100, 85, 95, 90, 85, 90, 80, 95, 75, 85, 95, 85].map((h) => Math.min(100, Math.max(30, h - (monthIndex % 3) * 5 + 5))),
    GASTRIC: [70, 80, 90, 75, 85, 95, 75, 80, 70, 90, 65, 75, 85, 70].map((h) => Math.min(100, Math.max(30, h + (monthIndex % 6) * 2 - 5))),
  };

  const capsuleHeights = categoryHeightsMap[activeCategory] || categoryHeightsMap["TABLET"];


  return (
    <div className="w-full bg-[#7C3AED]/10 p-2 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
      
      {/* Outer Dashboard Card Wrapper (Pure White Container) */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/80 space-y-5 sm:space-y-6 text-slate-900 overflow-hidden">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base md:text-lg text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Live Territory Procurement Velocity & Sales Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeMonthData.totalOrders} Orders in {currentMonthName}</span>
            </span>
          </div>
        </div>

        {/* ================= TOP ROW: Radial Gauges & Bar Metric Cards ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center pb-5 sm:pb-6 border-b border-slate-100">
          
          {/* 4 Circular Radial Progress Gauges (Top Left - Dynamic from Month Selection) */}
          <div className="lg:col-span-4 grid grid-cols-4 gap-1.5 sm:gap-4 w-full justify-items-center">
            {[
              { val: String(activeMonthData.clinicalGauge), color: "border-rose-500 text-rose-600", label: "CLINICAL" },
              { val: String(activeMonthData.fulfillGauge), color: "border-emerald-500 text-emerald-600", label: "FULFILL" },
              { val: String(activeMonthData.dispenseGauge), color: "border-purple-500 text-purple-600", label: "DISPENSE" },
              { val: String(activeMonthData.recoveryGauge), color: "border-amber-500 text-amber-600", label: "RECOVERY" },
            ].map((g, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 ${g.color} flex items-center justify-center bg-slate-50 shadow-inner font-black text-xs sm:text-sm`}
                >
                  {g.val}
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center">
                  {g.label}
                </span>
              </div>
            ))}
          </div>

          {/* Middle Progress Segment Tracks (Top Middle - Dynamic per Month) */}
          <div className="lg:col-span-4 space-y-2 px-1 sm:px-2 border-y lg:border-y-0 lg:border-x border-slate-100 py-3 lg:py-0">
            {/* Brand 1 Track */}
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-400 text-[10px] uppercase truncate max-w-[120px]">
                {activeMonthData.brand1.name} VELOCITY
              </span>
              <div className="flex items-center gap-1 text-slate-900 font-mono text-[11px]">
                {activeMonthData.brand1.dir === "up" ? (
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{activeMonthData.brand1.count.toLocaleString()} pcs</span>
              </div>
            </div>
            <div className="flex gap-0.5 sm:gap-1 h-2 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < activeMonthData.brand1.ratio ? "bg-emerald-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            {/* Brand 2 Track */}
            <div className="flex items-center justify-between text-xs font-black pt-1">
              <span className="text-slate-400 text-[10px] uppercase truncate max-w-[120px]">
                {activeMonthData.brand2.name} DEMAND
              </span>
              <div className="flex items-center gap-1 text-slate-900 font-mono text-[11px]">
                {activeMonthData.brand2.dir === "up" ? (
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{activeMonthData.brand2.count.toLocaleString()} pcs</span>
              </div>
            </div>
            <div className="flex gap-0.5 sm:gap-1 h-2 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < activeMonthData.brand2.ratio ? "bg-rose-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            {/* Brand 3 Track */}
            <div className="flex items-center justify-between text-xs font-black pt-1">
              <span className="text-slate-400 text-[10px] uppercase truncate max-w-[120px]">
                {activeMonthData.brand3.name} REORDER
              </span>
              <div className="flex items-center gap-1 text-slate-900 font-mono text-[11px]">
                {activeMonthData.brand3.dir === "up" ? (
                  <ArrowUp className="w-3.5 h-3.5 text-cyan-600" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{activeMonthData.brand3.count.toLocaleString()} pcs</span>
              </div>
            </div>
            <div className="flex gap-0.5 sm:gap-1 h-2 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < activeMonthData.brand3.ratio ? "bg-cyan-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Metric Bar Summary Columns (Top Right - Dynamic from Month Selection) */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-2 sm:flex sm:justify-around w-full">
            {[
              { label: "Orders", val: String(activeMonthData.totalOrders), bars: [4, 7, 3, 9, 6, 8, 10] },
              { label: "Billed Pcs", val: activeMonthData.billedPieces.toLocaleString(), bars: [6, 10, 8, 7, 9, 5, 8] },
              { label: "Bonus Free", val: activeMonthData.bonusPieces.toLocaleString(), bars: [5, 6, 8, 4, 7, 9, 6] },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-sm sm:text-lg font-black font-mono text-slate-900 tracking-tight truncate max-w-[90px] text-center">
                  {col.val}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{col.label}</span>
                <div className="flex items-end gap-1 h-5 sm:h-6 mt-0.5">
                  {col.bars.map((h, bIdx) => (
                    <div
                      key={bIdx}
                      className="w-1 sm:w-1.5 bg-emerald-500 rounded-t-sm"
                      style={{ height: `${h * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ================= MIDDLE ROW: Donut Chart & Purple Smooth Wave Chart ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Left Column: Multi-Segment Donut Chart */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-4 w-full">
            
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center select-none">
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

              {/* Center hole with Compact Month Switcher (< Month >) */}
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="flex items-center justify-between w-[100px] sm:w-[108px] font-black text-slate-900 text-[10px] sm:text-[11px] bg-white px-1.5 sm:px-2 py-1 rounded-full shadow-md border border-slate-200 transition-all select-none">
                  <button
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="p-0.5 rounded-full hover:bg-purple-100 text-purple-700 transition-colors flex-shrink-0"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </button>
                  
                  {/* Selectable Month Dropdown */}
                  <select
                    value={monthIndex}
                    onChange={(e) => setMonthIndex(Number(e.target.value))}
                    className="bg-transparent font-black text-slate-900 text-[10px] sm:text-[11px] focus:outline-none cursor-pointer text-center appearance-none px-0.5"
                  >
                    {months.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="p-0.5 rounded-full hover:bg-purple-100 text-purple-700 transition-colors flex-shrink-0"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Donut Legend Items (Dynamically updating according to selected Month) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-mono w-full px-1">
              {activeMonthData.donutSegments.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate max-w-[70px] sm:max-w-none">{s.label}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[10px] sm:text-xs">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Total Revenue KPI Pill */}
            <div className="pt-2 w-full flex items-center justify-between border-t border-slate-200">
              <span className="text-base sm:text-xl font-black font-mono text-slate-900">{activeMonthData.totalRevenue}</span>
              <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase">
                {activeMonthData.growth} Growth
              </span>
            </div>

          </div>

          {/* Right Column: Purple Smooth Wave Area Graph (FERRILAT / PROCUREMENT) */}
          <div className="lg:col-span-8 space-y-3 w-full min-w-0">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  FERRILAT / PROCUREMENT
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Demand Velocity for <span className="font-bold text-purple-700">{currentMonthName} 2026</span>
                </p>
              </div>
              <div className="flex items-center sm:flex-col justify-between sm:text-right">
                <span className="text-lg sm:text-2xl font-black font-mono text-purple-700">
                  {activeMonthData.peakValue}
                </span>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                  MONTHLY UNITS
                </p>
              </div>
            </div>

            {/* Smooth SVG Wavy Area Graph */}
            <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/40">
              <div className="min-w-[700px] sm:min-w-[780px] p-2">
                <svg viewBox="0 0 800 220" className="w-full h-auto overflow-visible select-none">
                  <defs>
                    <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Filled Wave Path */}
                  <path
                    d={`${smoothCurveD} L ${endX} 200 L 20 200 Z`}
                    fill="url(#purpleAreaGrad)"
                    className="transition-all duration-500 ease-in-out"
                  />

                  {/* Smooth Wave Line */}
                  <path
                    d={smoothCurveD}
                    fill="none"
                    stroke="#6D28D9"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-in-out"
                  />

                  {/* Nodes / Dots on Wave Peaks & Valleys */}
                  {wavePoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#6D28D9"
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />
                  ))}

                  {/* Timeline X-Labels (Full month 01 to 28/30/31) */}
                  {wavePoints.map((pt, idx) => (
                    <text
                      key={`lbl-${idx}`}
                      x={pt.x}
                      y="215"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {pt.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

          </div>

        </div>

        {/* ================= BOTTOM ROW: Capsule Bars, Mini Sparklines, Step Counters ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-5 sm:pt-6 border-t border-slate-100">
          
          {/* Left: Capsule Bar Chart (Teal Vertical Pill Bars) */}
          <div className="lg:col-span-5 space-y-3 bg-slate-50/50 p-3 sm:p-4 rounded-2xl border border-slate-100 w-full">
            <div className="overflow-x-auto pb-1">
              <div className="flex items-center justify-between min-w-[280px] h-24 sm:h-28 px-1 sm:px-2">
                {capsuleHeights.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-2.5 sm:w-3 bg-emerald-500 rounded-full transition-all"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Pharma Category Pill Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-around gap-1.5 pt-2 border-t border-slate-200">
              {["TABLET", "CAPSULE", "ANTIBIOTIC", "GASTRIC"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black transition-all ${
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
          <div className="lg:col-span-4 flex items-center justify-between sm:justify-around p-3 sm:p-4 bg-slate-50/50 rounded-2xl border border-slate-100 gap-2">
            <div className="space-y-1 text-center font-mono">
              <div className="text-xs sm:text-sm font-black text-slate-900">{activeMonthData.sparkValues[0].toLocaleString()}</div>
              <div className="text-xs sm:text-sm font-black text-slate-900">{activeMonthData.sparkValues[1].toLocaleString()}</div>
              <div className="text-xs sm:text-sm font-black text-slate-900">{activeMonthData.sparkValues[2].toLocaleString()}</div>
            </div>

            {/* 3 Red/Rose Sparkline Curves */}
            <div className="space-y-3">
              {[
                "M 0 10 Q 15 0, 30 10 T 60 10",
                "M 0 10 Q 15 20, 30 5 T 60 10",
                "M 0 10 Q 15 5, 30 15 T 60 10",
              ].map((dStr, idx) => (
                <svg key={idx} width="48" height="18" className="overflow-visible">
                  <path d={dStr} fill="none" stroke="#EF4444" strokeWidth="2" />
                </svg>
              ))}
            </div>

            {/* Vertical Mini Columns with Numbers */}
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { num: String(activeMonthData.fulfillGauge), h: activeMonthData.fulfillGauge * 0.9 },
                { num: String(activeMonthData.dispenseGauge), h: activeMonthData.dispenseGauge * 0.9 },
                { num: String(activeMonthData.recoveryGauge), h: activeMonthData.recoveryGauge * 0.9 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] sm:text-xs font-black font-mono text-slate-900">{item.num}</span>
                  <div className="w-1.5 sm:w-2 bg-emerald-500 rounded-t-sm h-10 sm:h-12 flex items-end">
                    <div className="w-full bg-emerald-600 rounded-t-sm" style={{ height: `${item.h}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Step Counter Badges & Final Revenue Pill */}
          <div className="lg:col-span-3 flex flex-col justify-between p-3 sm:p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-mono font-black text-[#7C3AED]">
                <span className="text-base sm:text-lg text-slate-900">{activeMonthData.totalOrders}</span>
                <span className="mx-1.5 text-slate-300">|</span>
                <span className="text-base sm:text-lg text-purple-700">{activeMonthData.billedPieces.toLocaleString()}</span>
              </div>
              <span className="text-xs sm:text-sm font-black font-mono text-emerald-700">
                {activeMonthData.totalRevenue}
              </span>
            </div>

            {/* Numbered Step Circles (01 to 05) */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1">
              {["01", "02", "03", "04", "05"].map((num, idx) => (
                <div
                  key={idx}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center border flex-shrink-0 ${
                    idx === (monthIndex % 5)
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
              <svg width="100" height="14" viewBox="0 0 120 16">
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
