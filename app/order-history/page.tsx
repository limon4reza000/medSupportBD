"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  DollarSign,
  ChevronRight,
  Printer,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function OrderHistoryPage() {
  const { orders } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.assignedSalesRep.toLowerCase().includes(q) ||
      o.pharmacyName.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = "Order Number,Date,Pharmacy,Status,Total Items,Net Amount,Sales Rep\n";
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.orderDate}","${o.pharmacyName}","${o.status}",${o.totalItems},${o.netPayableAmount},"${o.assignedSalesRep}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `medsupply_order_history_${Date.now()}.csv`);
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
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Historical Order Archive</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Audit trail of all cut orders, ledger reference numbers, and batch fulfillment records.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Bar (Pure White Card) */}
      <div className="premium-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order #, SR/MPO name, or Pharmacy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Time Periods</option>
              <option value="THIS_MONTH">This Current Month (Sept 2026)</option>
              <option value="LAST_MONTH">Last Month (August 2026)</option>
              <option value="THIS_YEAR">Year to Date 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Orders Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Pharmacy / Customer</th>
                <th className="py-3 px-4">Assigned SR</th>
                <th className="py-3 px-4">Items / Loose Pieces</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/orders/${ord.id}`} className="font-mono font-bold text-slate-900 hover:text-emerald-700">
                      {ord.orderNumber}
                    </Link>
                    <div className="text-[11px] text-slate-400">
                      {new Date(ord.orderDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{ord.pharmacyName}</td>
                  <td className="py-3 px-4 text-slate-600">{ord.assignedSalesRep}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{ord.totalItems} SKUs</div>
                    <div className="text-[10px] text-slate-400">{ord.totalLoosePieces} pcs ({ord.totalBonusPieces} bonus)</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-800">
                    ৳{ord.netPayableAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/orders/${ord.id}`}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <span>Invoice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
