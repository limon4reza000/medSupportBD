"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  Search,
  Filter,
  CreditCard,
  Plus,
  RotateCw,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function CollectionsPage() {
  const { currentPharmacy, pharmacies, ledgerEntries, refreshData } = useApp();
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(currentPharmacy.id);
  const [amount, setAmount] = useState(15000);
  const [paymentMode, setPaymentMode] = useState("BANK_TRANSFER");
  const [refNumber, setRefNumber] = useState(`CHQ-${Date.now().toString().slice(-6)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const collections = [
    { id: "col-1", pharmacy: "Green Care Pharmacy", amount: 20000, mode: "bKash Merchant", ref: "TXN-BKASH-88192", date: "2026-08-30", status: "SETTLED" },
    { id: "col-2", pharmacy: "Popular Medico & Surgical", amount: 15000, mode: "Bank Cheque", ref: "CHQ-EBL-49102", date: "2026-09-02", status: "SETTLED" },
    { id: "col-3", pharmacy: "Green Care Pharmacy", amount: 18500, mode: "Nagad", ref: "TXN-NGD-33019", date: "2026-09-08", status: "SETTLED" },
  ];

  const handleRecordCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: selectedPharmacyId,
          amount,
          method: paymentMode,
          referenceNumber: refNumber,
          notes: `Field collection recorded via ${paymentMode}`,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        await refreshData();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Collection error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Field Collections & Payment Reconciliation</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Log SR/MPO field cash, bKash payments, and bank deposit slips with immediate ledger settlement.
          </p>
        </div>

        <Link
          href="/transactions"
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4" />
          <span>View Master Ledger</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Record New Collection Form (Pure White Card) */}
        <div className="premium-card p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Record Payment Collection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Logs debit relief to the customer's ledger.</p>
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Collection recorded and reconciled!</span>
            </div>
          )}

          <form onSubmit={handleRecordCollection} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700">Select Pharmacy:</label>
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              >
                {pharmacies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.tradeName} (Outstanding: ৳{p.currentBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Collected Amount (৳):</label>
              <input
                type="number"
                min="100"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Payment Mode:</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="BANK_TRANSFER">Bank Cheque / EFT</option>
                <option value="BKASH">bKash Merchant</option>
                <option value="NAGAD">Nagad Digital</option>
                <option value="CASH">Cash in Hand (SR Handover)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Reference / Cheque Number:</label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="w-full py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Settling...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Issue Receipt</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Collections Table (Pure White Card) */}
        <div className="lg:col-span-2 premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Recent Field Collections Queue
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Reconciled
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Pharmacy</th>
                  <th className="py-2.5 px-3">Mode & Reference</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500 font-mono">{col.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{col.pharmacy}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700">{col.mode}</div>
                      <div className="text-[10px] font-mono text-slate-400">{col.ref}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {col.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-800">
                      ৳{col.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
