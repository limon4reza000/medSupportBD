"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Boxes,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function SalesPharmaciesPage() {
  const { pharmacies, setIsQuickOrderOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = pharmacies.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.tradeName.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.thana.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Assigned Territory Pharmacies Directory</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Credit standing, Drug License verification, order frequency, and contact records.
          </p>
        </div>

        <Link
          href="/sales"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to SR Dashboard</span>
        </Link>
      </div>

      {/* Search Bar (Pure White Card) */}
      <div className="premium-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Pharmacy Name, Owner, or Thana..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Pharmacies Grid (Pure White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((pharm) => {
          const availableCredit = Math.max(0, pharm.creditLimit - pharm.currentBalance);

          return (
            <div
              key={pharm.id}
              className="premium-card p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{pharm.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    pharm.isCreditBlocked ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {pharm.isCreditBlocked ? "Blocked" : "Good Standing"}
                  </span>
                </div>

                <h2 className="text-base font-black text-slate-900 mt-2">{pharm.tradeName}</h2>
                <div className="text-xs text-slate-500">{pharm.ownerName}</div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pharm.address}, {pharm.thana}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pharm.phone}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credit Limit:</span>
                    <strong className="font-mono text-slate-900">৳{pharm.creditLimit.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Headroom:</span>
                    <strong className="font-mono text-emerald-800">৳{availableCredit.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/sales/pharmacies/${pharm.id}`}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>Detailed Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setIsQuickOrderOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold"
                >
                  Cut Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
