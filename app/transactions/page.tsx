"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { TransactionType } from "@/types/domain";

export default function TransactionsPage() {
  const { ledgerEntries, currentPharmacy } = useApp();
  const [selectedType, setSelectedType] = useState("ALL");

  const filteredEntries = ledgerEntries.filter((e) => {
    if (selectedType === "ALL") return true;
    return e.transactionType === selectedType;
  });

  const exportLedgerCSV = () => {
    const headers = "Date,Reference Number,Type,Debit,Credit,Running Balance,Notes\n";
    const rows = filteredEntries
      .map((e) => {
        const isDebit = e.transactionType === TransactionType.INVOICE_DEBIT;
        const debit = isDebit ? e.amount : 0;
        const credit = !isDebit ? e.amount : 0;
        return `"${e.createdAt}","${e.referenceNumber}","${e.transactionType}",${debit},${credit},${e.newBalance},"${e.notes || ""}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `medsupply_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Financial Transaction Ledger</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Real-time double-entry audit trail for invoice debits, payment settlements, and credit adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/credit"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Credit Dashboard</span>
          </Link>
          <button
            onClick={exportLedgerCSV}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Outstanding</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{currentPharmacy.currentBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Updated after every cut order</div>
        </div>

        <div className="premium-card p-5 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Available Credit Limit</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            ৳{(currentPharmacy.creditLimit - currentPharmacy.currentBalance).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Total Limit: ৳{currentPharmacy.creditLimit.toLocaleString()}</div>
        </div>

        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Terms</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {currentPharmacy.creditDaysLimit} Days
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Good Standing (0 Overdue)
          </div>
        </div>
      </div>

      {/* Filter Bar (Pure White Card) */}
      <div className="premium-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by Type:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", TransactionType.INVOICE_DEBIT, TransactionType.PAYMENT_CREDIT, TransactionType.RETURN_CREDIT, TransactionType.ADJUSTMENT].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedType === type
                  ? "bg-[#025540] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4 text-right">Debit (৳)</th>
                <th className="py-3 px-4 text-right">Credit (৳)</th>
                <th className="py-3 px-4 text-right">Running Balance (৳)</th>
                <th className="py-3 px-4">Notes / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEntries.map((entry) => {
                const isDebit = entry.transactionType === TransactionType.INVOICE_DEBIT;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {entry.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isDebit
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {isDebit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {entry.transactionType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                      {isDebit ? `+৳${entry.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {!isDebit ? `-৳${entry.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      ৳{entry.newBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {entry.notes || "Standard ledger transaction"}
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
