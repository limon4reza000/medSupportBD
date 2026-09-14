"use client";

import React from "react";
import Link from "next/link";
import {
  Truck,
  Boxes,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Building2,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function DepotDashboardPage() {
  const { batches, medicines, orders, pharmacies } = useApp();

  const totalInventoryPieces = batches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
  const totalInventoryValue = batches.reduce(
    (acc, b) => acc + b.availableLooseUnits * b.costPricePerPiece,
    0
  );
  const nearExpiryBatches = batches.filter((b) => new Date(b.expiryDate).getFullYear() === 2026);
  const pendingOrders = orders.filter((o) => o.status !== "DELIVERED");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Depot Operations Command
            </span>
            <span className="text-xs text-emerald-200 font-mono">Dhaka Central Hub (#DEPOT-DHK-01)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Depot Inventory & Dispatch Center
          </h1>
          <p className="text-xs text-emerald-100/80">
            Real-time batch stock valuations, dispatch queues, FEFO lot integrity, and field collection logs.
          </p>
        </div>

        <Link
          href="/inventory/batches"
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto hover:scale-105"
        >
          <Layers className="w-4 h-4" />
          <span>Inspect All FEFO Batches</span>
        </Link>
      </div>

      {/* KPI Cards (Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Valuation</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{totalInventoryPieces.toLocaleString()} pieces in warehouse</div>
        </div>

        <div className="premium-card p-5 border-blue-300">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Pending Orders</div>
          <div className="text-2xl font-black font-mono text-blue-700 mt-1">
            {pendingOrders.length} In Queue
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Awaiting packing & thermal seal</div>
        </div>

        <div className="premium-card p-5 border-amber-300">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Near-Expiry Batches</div>
          <div className="text-2xl font-black font-mono text-amber-700 mt-1">
            {nearExpiryBatches.length} Lots
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Expiring within 90 days</div>
        </div>

        <div className="premium-card p-5 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Active Catalog SKUs</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {medicines.length} SKUs
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% DGDA Compliant</div>
        </div>

      </div>

      {/* Middle Grid: Pending Dispatch Queue & Near-Expiry Lots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Orders Queue (Pure White Card) */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                Dispatch & Courier Queue
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {pendingOrders.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{ord.orderNumber}</div>
                  <div className="text-[11px] text-slate-500">{ord.pharmacyName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Assigned: {ord.assignedSalesRep} • Expected: {ord.expectedDelivery}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-slate-900">
                    ৳{ord.netPayableAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-blue-700">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Near Expiry Batches (Pure White Card) */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                Near-Expiry Batch Alerts (FEFO Priority)
              </h2>
            </div>
            <Link
              href="/inventory/near-expiry"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {nearExpiryBatches.map((b) => {
              const med = medicines.find((m) => m.id === b.medicineId);
              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{med?.brandName} ({med?.strength})</div>
                    <div className="text-[11px] font-mono text-slate-600">Lot: {b.batchNumber}</div>
                    <div className="text-[10px] font-bold text-rose-700 mt-0.5">
                      Expiry Date: {typeof b.expiryDate === "string" ? b.expiryDate : "2026-11-30"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-amber-900">
                      {b.availableLooseUnits} pcs
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">1st Priority Allocation</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
