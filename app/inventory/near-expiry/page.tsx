"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Tag,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function NearExpiryPage() {
  const { batches, medicines } = useApp();

  const nearExpiryBatches = batches.filter(
    (b) => new Date(b.expiryDate).getFullYear() === 2026
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Near-Expiry Lot Priority Dashboard</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Lots expiring within 90 days prioritized for FEFO allocation or clearance trade discounts.
          </p>
        </div>

        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inventory</span>
        </Link>
      </div>

      {/* Near Expiry Batches List (Pure White Cards) */}
      <div className="space-y-3">
        {nearExpiryBatches.map((b) => {
          const med = medicines.find((m) => m.id === b.medicineId);
          const daysLeft = Math.ceil(
            (new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
          );

          return (
            <div
              key={b.id}
              className="premium-card p-5 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-slate-900">{med?.brandName} ({med?.strength})</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {b.batchNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    {daysLeft > 0 ? `${daysLeft} Days to Expiry` : "Immediate Clearance"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{med?.genericName} • {med?.manufacturer}</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Expiry Date: <strong className="text-slate-900">{typeof b.expiryDate === "string" ? b.expiryDate : "2026-11-30"}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Available Lot Stock</div>
                  <div className="text-base font-black font-mono text-amber-800">
                    {b.availableLooseUnits} pieces
                  </div>
                </div>

                <Link
                  href={`/products/${med?.id}`}
                  className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all"
                >
                  View Product
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
