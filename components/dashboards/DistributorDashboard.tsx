"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Boxes,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Building2,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  Search,
  Filter,
  Check,
  FileText,
  Calendar,
  Send,
  Users,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { OrderStatus, PaymentStatus } from "@/types/domain";

export const DistributorDashboard: React.FC = () => {
  const {
    batches,
    medicines,
    orders,
    pharmacies,
    currentUser,
    deliveryRecords,
    productReturns,
    updateDeliveryStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"ORDERS" | "INVENTORY" | "CREDIT" | "DISPATCH">("ORDERS");
  const [orderActionNotice, setOrderActionNotice] = useState<string | null>(null);

  // Valuation
  const totalInventoryPieces = batches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
  const totalInventoryValue = batches.reduce(
    (acc, b) => acc + b.availableLooseUnits * b.costPricePerPiece,
    0
  );
  const nearExpiryBatches = batches.filter((b) => new Date(b.expiryDate).getFullYear() <= 2026);
  const pendingOrders = orders.filter((o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED);

  const handleApproveOrder = (orderNumber: string) => {
    setOrderActionNotice(`Order ${orderNumber} approved & sent to picking and packing bay!`);
    setTimeout(() => setOrderActionNotice(null), 3500);
  };

  const handleDispatchOrder = (orderNumber: string) => {
    setOrderActionNotice(`Order ${orderNumber} packed and assigned to delivery van!`);
    setTimeout(() => setOrderActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Depot Command Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white p-6 rounded-3xl shadow-lg border border-indigo-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FB923C] text-white flex items-center gap-1 shadow-sm">
              <Truck className="w-3.5 h-3.5" /> Central Distribution Depot
            </span>
            <span className="text-xs text-indigo-200 font-mono">
              {currentUser.organizationCode || "DEPOT-DHK-01"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Depot Wholesale Operations & Dispatch Hub
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 max-w-2xl leading-relaxed">
            Approve wholesale pharmacy orders, allocate earliest expiry (FEFO) lots, enforce credit limits, generate tax invoices, and supervise delivery fleets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Link
            href="/inventory/batches"
            className="px-4 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs transition-all flex items-center gap-2 shadow-md hover:scale-105"
          >
            <Layers className="w-4 h-4" />
            <span>FEFO Batch Inspector</span>
          </Link>
          <Link
            href="/customer-due"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-indigo-200" />
            <span>Credit Receivables</span>
          </Link>
        </div>
      </div>

      {orderActionNotice && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-300 text-[#241B52] text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
          <span>{orderActionNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5">
        
        {/* Warehouse Valuation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Warehouse Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            ৳{(totalInventoryValue / 100000).toFixed(2)} Lac
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            {totalInventoryPieces.toLocaleString()} pieces in stock
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Orders in Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {pendingOrders.length} Orders
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Awaiting picking & dispatch
          </div>
        </div>

        {/* Near Expiry Batches */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">FEFO Near Expiry</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {nearExpiryBatches.length} Batches
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Prioritize dispensing in FEFO
          </div>
        </div>

        {/* Delivery Fleet */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Transit Deliveries</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {deliveryRecords.length} Active Trips
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Temperature-controlled vans
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ORDERS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ORDERS"
              ? "bg-[#4F46E5] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Incoming Wholesale Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "INVENTORY"
              ? "bg-[#4F46E5] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          FEFO Batch Inventory ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab("DISPATCH")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "DISPATCH"
              ? "bg-[#4F46E5] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Dispatch & Deliveries ({deliveryRecords.length})
        </button>
        <button
          onClick={() => setActiveTab("CREDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "CREDIT"
              ? "bg-[#4F46E5] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Pharmacy Credit Controls ({pharmacies.length})
        </button>
      </div>

      {/* Tab 1: Orders Approval Queue */}
      {activeTab === "ORDERS" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Wholesale Order Processing & Invoice Generation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review MPO cut orders and direct pharmacy orders, confirm batch allocations, and trigger packing.
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Order Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Order Number</th>
                  <th className="px-4 py-3.5">Pharmacy</th>
                  <th className="px-4 py-3.5">Items / Loose Pieces</th>
                  <th className="px-4 py-3.5">Net Payable</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Depot Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                        <div className="text-[11px] text-slate-500">{order.orderDate.slice(0, 10)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{order.pharmacyName}</div>
                        <div className="text-[11px] text-slate-500">MPO: {order.assignedSalesRep}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {order.totalItems} SKUs • {order.totalLoosePieces} pcs
                        {order.totalBonusPieces > 0 && (
                          <span className="text-indigo-700 font-bold block text-[11px]">
                            +{order.totalBonusPieces} bonus pcs
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        ৳{order.netPayableAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === OrderStatus.DELIVERED
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status !== OrderStatus.DELIVERED && (
                            <>
                              <button
                                onClick={() => handleApproveOrder(order.orderNumber)}
                                className="px-2.5 py-1 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleDispatchOrder(order.orderNumber)}
                                className="px-2.5 py-1 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" /> Pack & Dispatch
                              </button>
                            </>
                          )}
                          <Link
                            href={`/orders/${order.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Print Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: FEFO Batch Inventory */}
      {activeTab === "INVENTORY" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                FEFO Batch Stock & Physical Allocation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Earliest expiry lots are allocated first to prevent expiry waste.
              </p>
            </div>
            <Link
              href="/inventory/batches"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Batch Audit Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Batch Number</th>
                  <th className="px-4 py-3.5">Medicine</th>
                  <th className="px-4 py-3.5">Available Pieces</th>
                  <th className="px-4 py-3.5">Manufacturing Date</th>
                  <th className="px-4 py-3.5">Expiry Date</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => {
                  const med = medicines.find((m) => m.id === b.medicineId);
                  const isExpiringSoon = new Date(b.expiryDate).getFullYear() <= 2026;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {b.batchNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{med?.brandName || "Medicine"}</div>
                        <div className="text-[11px] text-slate-500">{med?.strength}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-800">
                        {b.availableLooseUnits.toLocaleString()} pcs
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        {typeof b.manufacturingDate === "string" ? b.manufacturingDate : "2024-01-01"}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold">
                        <span className={isExpiringSoon ? "text-amber-700" : "text-slate-800"}>
                          {typeof b.expiryDate === "string" ? b.expiryDate : "2027-01-01"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {b.isQuarantined ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Quarantined
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Near Expiry (FEFO 1st)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            Optimal
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
      )}

      {/* Tab 3: Dispatch & Deliveries */}
      {activeTab === "DISPATCH" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">
            Active Delivery Fleets & Proof of Delivery (POD)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryRecords.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{d.orderNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === "DELIVERED" ? "bg-indigo-100 text-indigo-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">{d.pharmacyName}</div>
                <div className="text-[11px] text-slate-600">{d.deliveryAddress}</div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs space-y-0.5">
                  <div className="text-slate-700">Driver: <strong>{d.driverName}</strong> ({d.driverPhone})</div>
                  <div className="text-slate-600 font-mono text-[11px]">Van: {d.vehicleNo}</div>
                  {d.podReceiverSignature && (
                    <div className="text-indigo-700 text-[11px] font-medium pt-1">
                      POD: {d.podReceiverSignature}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Pharmacy Credit Controls */}
      {activeTab === "CREDIT" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">
            Pharmacy Credit Limits, Receivables & Risk Hard Freeze
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pharmacies.map((pharm) => {
              const available = Math.max(0, pharm.creditLimit - pharm.currentBalance);
              const utilization = Math.round((pharm.currentBalance / pharm.creditLimit) * 100);

              return (
                <div key={pharm.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{pharm.tradeName}</div>
                      <div className="text-[11px] text-slate-500">{pharm.address}</div>
                    </div>
                    {pharm.isCreditBlocked && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Blocked
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Outstanding:</span>
                      <span className="font-bold font-mono text-rose-700">৳{pharm.currentBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Credit Limit:</span>
                      <span className="font-bold font-mono text-slate-800">৳{pharm.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
                      <div
                        className={`h-full ${utilization > 85 ? "bg-rose-500" : "bg-indigo-600"}`}
                        style={{ width: `${Math.min(100, utilization)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 flex justify-between">
                    <span>Credit Period: {pharm.creditDaysLimit} days</span>
                    <span className="text-indigo-700 font-bold">৳{available.toLocaleString()} room</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
