"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Boxes,
  Calendar,
  AlertTriangle,
  Activity,
  ArrowRight,
  Search,
  Building2,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function InventoryPage() {
  const { medicines, batches } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = medicines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || m.brandName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Depot Inventory Management & Stock Valuation</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            FEFO lot traceability, multi-tier packaging conversions, and real-time stock balances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/inventory/batches"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Batch Lots</span>
          </Link>
          <Link
            href="/inventory/near-expiry"
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Near Expiry</span>
          </Link>
          <Link
            href="/inventory/stock-movement"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Movement Audit</span>
          </Link>
        </div>
      </div>

      {/* Search Bar (Pure White Card) */}
      <div className="premium-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKUs by Brand, Generic, or Manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Inventory Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Medicine & SKU</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Pack Spec</th>
                <th className="py-3 px-4">Active Batches</th>
                <th className="py-3 px-4">Total Available Stock</th>
                <th className="py-3 px-4">Cost Value (৳)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((med) => {
                const medBatches = batches.filter((b) => b.medicineId === med.id);
                const totalStock = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
                const boxPieces = med.piecesPerStrip * med.stripsPerBox;
                const totalCost = medBatches.reduce((acc, b) => acc + b.availableLooseUnits * b.costPricePerPiece, 0);

                return (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/products/${med.id}`} className="font-bold text-slate-900 hover:text-emerald-700">
                        {med.brandName} ({med.strength})
                      </Link>
                      <div className="text-[11px] text-slate-500">{med.genericName} • {med.code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{med.manufacturer}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{med.dosageForm}</div>
                      <div className="text-[10px] text-slate-400">{boxPieces} pcs/box</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{medBatches.length} Lots</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-800">
                        {(totalStock / boxPieces).toFixed(1)} Boxes ({totalStock} pcs)
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ৳{totalCost.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/products/${med.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>Batches</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
