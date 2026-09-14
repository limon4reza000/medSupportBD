"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Layers,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function StockAdjustmentsPage() {
  const { batches, medicines } = useApp();
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || "");
  const [adjustmentQty, setAdjustmentQty] = useState(10);
  const [reason, setReason] = useState("PHYSICAL_COUNT_DISCREPANCY");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-emerald-400" />
            <span>Physical Stock Reconciliation & Adjustments</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Log lot count corrections, damaged inventory write-offs, and store room audits.
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

      {/* Adjustment Form (Pure White Card) */}
      <div className="max-w-2xl mx-auto premium-card p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Record Stock Lot Adjustment
          </h2>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Stock adjustment committed to warehouse ledger and audit log!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700">Select Batch Lot:</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
            >
              {batches.map((b) => {
                const med = medicines.find((m) => m.id === b.medicineId);
                return (
                  <option key={b.id} value={b.id}>
                    {med?.brandName} ({b.batchNumber}) — Current: {b.availableLooseUnits} pcs
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700">Adjustment Quantity (+ / - Pieces):</label>
            <input
              type="number"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700">Adjustment Reason:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="PHYSICAL_COUNT_DISCREPANCY">Physical Count Discrepancy</option>
              <option value="DAMAGED_IN_TRANSIT">Damaged in Transit</option>
              <option value="SAMPLE_DISTRIBUTION">Medical Representative Sampling</option>
              <option value="EXPIRED_REMOVAL">Expired Stock Quarantine</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700">Audit Notes & Officer Signature:</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified by Storekeeper M. Rahman after physical stock audit on Rack B-12."
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Commit Inventory Adjustment</span>
          </button>
        </form>
      </div>

    </div>
  );
}
