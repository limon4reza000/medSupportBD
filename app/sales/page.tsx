"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Target,
  DollarSign,
  Building2,
  Calendar,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function SalesRepPage() {
  const { pharmacies, orders, setIsQuickOrderOpen } = useApp();

  const totalMonthlyTarget = 500000;
  const achievedSales = orders.reduce((acc, o) => acc + o.netPayableAmount, 0);
  const targetPercent = Math.min(100, Math.round((achievedSales / totalMonthlyTarget) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Field MPO Workspace
            </span>
            <span className="text-xs text-emerald-200 font-mono">SR-104 (Dhaka Central Territory)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Sales Representative Dashboard
          </h1>
          <p className="text-xs text-emerald-100/80">
            Assigned pharmacy routes, target achievement, field visit schedules, and proxy order cutting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickOrderOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Book Order for Pharmacy</span>
          </button>
        </div>
      </div>

      {/* KPI Target Cards (Pure White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Target</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{totalMonthlyTarget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">September 2026 Target</div>
        </div>

        <div className="premium-card p-5 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Achieved Sales</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            ৳{achievedSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {targetPercent}% Target Completed
          </div>
        </div>

        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Pharmacies</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {pharmacies.length} Stores
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dhanmondi & Shamoli Route</div>
        </div>

        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Visits Due</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            3 Pharmacies
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">2 Restock Orders Pending</div>
        </div>
      </div>

      {/* Target Progress Bar (Pure White Card) */}
      <div className="premium-card p-5 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Monthly Sales Target Achievement</span>
          <span className="text-emerald-800 font-mono font-black">{targetPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${targetPercent}%` }}
          />
        </div>
      </div>

      {/* Assigned Pharmacies List (Pure White Card) */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <h2 className="font-bold text-sm text-slate-900">Assigned Route Pharmacies</h2>
          </div>
          <Link
            href="/sales/pharmacies"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            Detailed Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pharmacies.map((pharm) => (
            <div
              key={pharm.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{pharm.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    pharm.isCreditBlocked ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {pharm.isCreditBlocked ? "Blocked" : "Active Credit"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{pharm.tradeName}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{pharm.ownerName} • {pharm.phone}</div>
                
                <div className="mt-3 p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credit Limit:</span>
                    <strong className="font-mono">৳{pharm.creditLimit.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outstanding:</span>
                    <strong className="font-mono text-emerald-800">৳{pharm.currentBalance.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <Link
                  href={`/sales/pharmacies/${pharm.id}`}
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setIsQuickOrderOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold"
                >
                  Cut Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
