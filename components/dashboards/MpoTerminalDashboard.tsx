"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Target,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  Clock,
  Phone,
  FileText,
  DollarSign,
  ShieldCheck,
  Eye,
  Award,
  ShoppingCart,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  UserCheck,
  MapPin,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { OrderCuttingTerminal } from "@/components/OrderCuttingTerminal";
import { PackagingUnit } from "@/types/domain";

export const MpoTerminalDashboard: React.FC = () => {
  const {
    pharmacies,
    orders,
    mrVisits,
    mrTarget,
    medicines,
    batches,
    offers,
    currentUser,
    selectedPharmacyId,
    setSelectedPharmacyId,
    currentPharmacy,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"ORDER_CUTTING" | "VISITS" | "TARGETS">("ORDER_CUTTING");
  const [orderCutSuccess, setOrderCutSuccess] = useState<any | null>(null);

  // Targets
  const target = mrTarget.targetAmount;
  const achieved = mrTarget.achievedAmount;
  const percentAchieved = Math.min(100, Math.round((achieved / target) * 100));

  const handleOrderCutSuccess = (orderData: any) => {
    setOrderCutSuccess(orderData);
    setTimeout(() => setOrderCutSuccess(null), 6000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* MPO Terminal Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#01382b] via-[#025540] to-[#014030] text-white p-6 rounded-3xl shadow-lg border border-emerald-600/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Briefcase className="w-3.5 h-3.5" /> MPO Field Terminal
            </span>
            <span className="text-xs text-emerald-200 font-medium">
              {currentUser.name} • {currentUser.territory || "Dhanmondi Route"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            High-Speed Pharmaceutical Order Cutting Terminal
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Select route pharmacy, cut multi-item wholesale orders with automatic 10+1 bonuses, verify credit limits, and submit instantly to the central depot.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Link
            href="/mr-portal"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span>Visit Manager</span>
          </Link>
          <button
            onClick={() => setActiveTab("ORDER_CUTTING")}
            className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-md hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cut New Order</span>
          </button>
        </div>
      </div>

      {orderCutSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <div>Order #{orderCutSuccess.orderNumber || "CUT-SUCCESS"} submitted successfully to Depot!</div>
              <div className="text-[11px] font-normal text-emerald-800">
                Net Payable: ৳{orderCutSuccess.netPayableAmount || "Calculated"} • Total Bonus Pieces: {orderCutSuccess.totalBonusPieces || 0} pcs
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-700 text-white text-[10px] font-black uppercase">
            Sent to Depot
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5">
        
        {/* Today's Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today&apos;s Cuts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ৳84,200
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            6 Orders Cut Across 4 Pharmacies
          </div>
        </div>

        {/* Target Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monthly Target</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {percentAchieved}% Achieved
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
            <div className="bg-purple-600 h-full" style={{ width: `${percentAchieved}%` }} />
          </div>
        </div>

        {/* Route Visits */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Daily Pharmacy Route</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {mrVisits.filter((v) => v.status === "COMPLETED").length} / {pharmacies.length + 5} Done
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Territory: Dhanmondi Route
          </div>
        </div>

        {/* Trade Bonus Counter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Schemes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {offers.filter((o) => o.isActive).length} Trade Offers
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Live bonus auto-allocation on checkout
          </div>
        </div>

      </div>

      {/* Pharmacy Selector Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#025540] text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Selected Route Pharmacy</div>
            <div className="font-bold text-sm text-slate-900">{currentPharmacy.tradeName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-semibold hidden sm:inline">Switch Pharmacy:</label>
          <select
            value={selectedPharmacyId}
            onChange={(e) => setSelectedPharmacyId(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-600"
          >
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.tradeName} ({p.thana} - ৳{(p.creditLimit - p.currentBalance).toLocaleString()} credit room)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Order Cutting Terminal Component */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <OrderCuttingTerminal
          medicines={medicines}
          batches={batches}
          offers={offers}
          pharmacy={currentPharmacy}
          onOrderSuccess={handleOrderCutSuccess}
        />
      </div>

    </div>
  );
};
