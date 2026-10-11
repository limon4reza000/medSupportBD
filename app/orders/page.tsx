"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Search,
  Filter,
  DollarSign,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  Send,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { OrderStatus } from "@/types/domain";

export default function WholesaleOrdersQueuePage() {
  const { orders, currentUser } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === "ALL" || o.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.pharmacyName.toLowerCase().includes(q) ||
      o.assignedSalesRep.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleAction = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#01382b] via-[#025540] to-[#014030] text-white p-6 rounded-3xl shadow-lg border border-emerald-600/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <PackageCheck className="w-3.5 h-3.5" /> B2B Wholesale Queue
            </span>
            <span className="text-xs text-emerald-200 font-mono">
              {currentUser.organizationName || "Central Depot Distribution"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Wholesale Orders Processing & Invoicing
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
            Authorize incoming bulk orders from retail pharmacies and MPOs, verify batch FIFO allocation, generate VAT invoices, and assign delivery vans.
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Back to Command Dashboard</span>
        </Link>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order number, pharmacy, or sales rep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "PROCESSING", "DISPATCHED", "DELIVERED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? "bg-[#025540] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st === "ALL" ? "All Orders" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Order No & Date</th>
                <th className="px-4 py-3.5">Pharmacy / Buyer</th>
                <th className="px-4 py-3.5">Billed & Bonus Pieces</th>
                <th className="px-4 py-3.5">Gross / Net Payable</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Depot Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                    <div className="text-[11px] text-slate-500">{order.orderDate.slice(0, 10)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-800">{order.pharmacyName}</div>
                    <div className="text-[11px] text-slate-500">MPO: {order.assignedSalesRep}</div>
                  </td>
                  <td className="px-4 py-4 font-mono">
                    <div className="text-slate-800 font-semibold">{order.totalLoosePieces.toLocaleString()} pcs ({order.totalItems} SKUs)</div>
                    {order.totalBonusPieces > 0 && (
                      <div className="text-emerald-700 font-bold text-[11px]">
                        +{order.totalBonusPieces.toLocaleString()} trade bonus pcs
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    <div className="text-sm font-black text-slate-900">
                      ৳{order.netPayableAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Gross: ৳{order.grossAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === OrderStatus.DELIVERED
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.status !== OrderStatus.DELIVERED && (
                        <>
                          <button
                            onClick={() => handleAction(`Order ${order.orderNumber} approved!`)}
                            className="px-2.5 py-1 rounded-lg bg-[#025540] hover:bg-[#014232] text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(`Order ${order.orderNumber} packed and assigned to delivery van!`)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Dispatch
                          </button>
                        </>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
