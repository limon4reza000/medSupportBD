"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function BatchesPage() {
  const { batches, medicines } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBatches = batches.filter((b) => {
    const med = medicines.find((m) => m.id === b.medicineId);
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      b.batchNumber.toLowerCase().includes(q) ||
      (med && med.brandName.toLowerCase().includes(q)) ||
      (med && med.genericName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <span>FEFO Batch Registry & Expiration Matrix</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Individual batch lot numbers, manufacturing dates, expiry horizons, and available stock units.
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

      {/* Search Bar (Pure White Card) */}
      <div className="premium-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Batch Number (e.g. BN-2024) or Medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Batches Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Batch Lot Number</th>
                <th className="py-3 px-4">Medicine & Strength</th>
                <th className="py-3 px-4">Manufacturing Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Unit Cost Price</th>
                <th className="py-3 px-4 text-right">FEFO Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBatches.map((b) => {
                const med = medicines.find((m) => m.id === b.medicineId);
                const isNearExp = new Date(b.expiryDate).getFullYear() === 2026;

                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.batchNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/products/${med?.id}`} className="font-bold text-slate-900 hover:text-emerald-700">
                        {med?.brandName} ({med?.strength})
                      </Link>
                      <div className="text-[11px] text-slate-500">{med?.genericName}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {typeof b.manufacturingDate === "string" ? b.manufacturingDate : "2025-01-15"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {typeof b.expiryDate === "string" ? b.expiryDate : "2027-06-30"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {b.availableLooseUnits} pieces
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ৳{b.costPricePerPiece.toFixed(2)}/pc
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isNearExp ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Near Expiry (1st Out)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Standard Stock
                        </span>
                      )}
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
