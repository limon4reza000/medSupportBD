"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  FileText,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Building2,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { OrderStatus } from "@/types/domain";

export default function MyOrdersPage() {
  const { orders, currentPharmacy } = useApp();
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "ALL", label: "All Orders", count: orders.length },
    { id: "PROCESSING", label: "Processing / Packed", count: orders.filter((o) => o.status === OrderStatus.PROCESSING).length },
    { id: "DISPATCHED", label: "Dispatched", count: orders.filter((o) => o.status === OrderStatus.DISPATCHED).length },
    { id: "DELIVERED", label: "Delivered", count: orders.filter((o) => o.status === OrderStatus.DELIVERED).length },
    { id: "CANCELLED", label: "Cancelled", count: orders.filter((o) => o.status === OrderStatus.CANCELLED).length },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesTab = selectedTab === "ALL" ? true : o.status === selectedTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.assignedSalesRep.toLowerCase().includes(q) ||
      o.items.some((i) => i.brandName.toLowerCase().includes(q));
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span>My Active & Historical Orders</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Track batch allocations, dispatch timelines, and invoice status in real-time.
          </p>
        </div>

        <Link
          href="/order-history"
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Advanced History & Export</span>
        </Link>
      </div>

      {/* Tabs & Search Filter Bar (Pure White Card) */}
      <div className="premium-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedTab === tab.id
                    ? "bg-[#025540] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order # or Medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

        </div>
      </div>

      {/* Orders List (Pure White Cards) */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="premium-card p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No orders found matching criteria</div>
            <p className="text-xs text-slate-400">Try changing filter tabs or search keywords.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDelivered = order.status === OrderStatus.DELIVERED;
            const isProcessing = order.status === OrderStatus.PROCESSING;

            return (
              <div
                key={order.id}
                className="premium-card p-5 transition-all hover:border-emerald-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  
                  {/* Left info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900">{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isProcessing
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(order.orderDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>Assigned SR: <strong className="text-slate-800">{order.assignedSalesRep}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Expected: <strong className="text-emerald-700">{order.expectedDelivery}</strong></span>
                    </div>
                  </div>

                  {/* Right summary & view */}
                  <div className="flex items-center justify-between lg:justify-end gap-5">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Payable</div>
                      <div className="text-lg font-black font-mono text-emerald-800">
                        ৳{order.netPayableAmount.toLocaleString()}
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Order Timeline & Batches</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>

                {/* Items preview */}
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{item.brandName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.orderedQty} {item.orderedUnit}s ({item.looseUnitsBilled} pcs)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">৳{item.netItemTotal.toFixed(0)}</div>
                        {item.bonusLooseUnits > 0 && (
                          <div className="text-[10px] font-bold text-emerald-700">+{item.bonusLooseUnits} bonus</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
