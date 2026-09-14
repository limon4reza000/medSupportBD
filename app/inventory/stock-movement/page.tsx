"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Calendar,
  Layers,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function StockMovementPage() {
  const { medicines } = useApp();
  const [selectedType, setSelectedType] = useState("ALL");

  const movements = [
    { id: "mov-01", date: "2026-09-14 10:15", type: "SALE_DEDUCTION", medicine: "Napa Extra", batch: "BN-2024-NAPA-01", qty: -450, ref: "ORD-2026-0914-01", user: "Auto FEFO Allocation" },
    { id: "mov-02", date: "2026-09-14 10:15", type: "BONUS_DEDUCTION", medicine: "Napa Extra", batch: "BN-2025-NAPA-02", qty: -200, ref: "ORD-2026-0914-01", user: "Trade Bonus Scheme (10+1)" },
    { id: "mov-03", date: "2026-09-14 10:15", type: "SALE_DEDUCTION", medicine: "Seclo 20", batch: "BN-2024-SEC-03", qty: -100, ref: "ORD-2026-0914-01", user: "Auto FEFO Allocation" },
    { id: "mov-04", date: "2026-09-10 14:40", type: "SALE_DEDUCTION", medicine: "Ace Plus", batch: "BN-2024-ACE-08", qty: -1600, ref: "ORD-2026-0910-03", user: "Auto FEFO Allocation" },
    { id: "mov-05", date: "2026-09-01 09:00", type: "PURCHASE_RECEIPT", medicine: "Napa Extra", batch: "BN-2025-NAPA-03", qty: +10000, ref: "GRN-2026-0901", user: "Depot Storekeeper" },
  ];

  const filtered = movements.filter((m) => {
    if (selectedType === "ALL") return true;
    return m.type === selectedType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Stock Movement Audit Trail</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Full physical traceability for purchases, sales order deductions, trade bonus issues, and lot returns.
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

      {/* Movements Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Batch Lot Number</th>
                <th className="py-3 px-4 text-right">Quantity (Pieces)</th>
                <th className="py-3 px-4">Reference Document</th>
                <th className="py-3 px-4">Initiator / Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((mov) => {
                const isOut = mov.qty < 0;

                return (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{mov.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOut ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {isOut ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {mov.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{mov.medicine}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{mov.batch}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${isOut ? "text-rose-700" : "text-emerald-700"}`}>
                      {mov.qty > 0 ? `+${mov.qty}` : mov.qty} pcs
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{mov.ref}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{mov.user}</td>
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
