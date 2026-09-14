"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCw,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Boxes,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function ReturnsPage() {
  const { currentPharmacy, medicines } = useApp();

  const returns = [
    { id: "ret-01", date: "2026-09-05", pharmacy: "Popular Medico & Surgical", medicine: "Seclo 20 (Omeprazole)", batch: "BN-2024-SEC-03", qty: 50, reason: "Near Expiry Replacement", creditNote: "CN-2026-004", status: "CREDITED" },
    { id: "ret-02", date: "2026-08-28", pharmacy: "Green Care Pharmacy", medicine: "Monas 10", batch: "BN-2025-MON-04", qty: 20, reason: "Packaging Foil Defect", creditNote: "CN-2026-002", status: "CREDITED" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-emerald-400" />
            <span>Pharma Returns & Credit Notes Management</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Log damaged items, expired batch recalls, and issue automated financial credit notes.
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

      {/* Returns Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Pharmacy</th>
                <th className="py-3 px-4">Medicine & Batch</th>
                <th className="py-3 px-4">Returned Pieces</th>
                <th className="py-3 px-4">Return Reason</th>
                <th className="py-3 px-4">Credit Note Reference</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono">{ret.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{ret.pharmacy}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-bold">{ret.medicine}</div>
                    <div className="text-[10px] font-mono text-slate-400">{ret.batch}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-700">{ret.qty} pieces</td>
                  <td className="py-3 px-4 text-slate-600">{ret.reason}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">{ret.creditNote}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
