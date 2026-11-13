"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  Phone,
  FileText,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Search,
  Receipt,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "@/types/domain";

interface OrderItem {
  id: string;
  orderNumber: string;
  challanNumber?: string;
  companyName: string;
  status: OrderStatus;
  grossAmount: number;
  tradeDiscountAmount: number;
  vatAmount: number;
  netPayableAmount: number;
  totalLoosePieces: number;
  totalBonusPieces: number;
  assignedMPO?: { name: string; phone: string; territory?: string };
  vanPlate?: string;
  driverPhone?: string;
  deliveryNotes?: string;
  createdAt: string;
  items?: {
    medicineId: string;
    brandName?: string;
    medicineName?: string;
    orderedQty?: number;
    orderedBoxes?: number;
    unitTradePrice: number;
    bonusLooseUnits?: number;
    subtotal?: number;
    netItemTotal?: number;
  }[];
}

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvoice?: (orderId: string) => void;
  onOpenReturn?: (order: OrderItem) => void;
}

const STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "ALLOCATED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "DELIVERED", label: "Delivered" },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.DRAFT:
    case OrderStatus.SUBMITTED:
    case OrderStatus.PENDING_CREDIT_APPROVAL:
      return 0;
    case OrderStatus.ALLOCATED:
    case OrderStatus.APPROVED:
      return 1;
    case OrderStatus.PROCESSING:
    case OrderStatus.PACKED:
      return 2;
    case OrderStatus.DISPATCHED:
      return 3;
    case OrderStatus.DELIVERED:
    case OrderStatus.COMPLETED:
      return 4;
    default:
      return 1;
  }
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenInvoice,
  onOpenReturn,
}) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DELIVERED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchOrders = () => {
    setIsLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: newStatus === OrderStatus.DELIVERED
            ? "Delivery verified and signed by Pharmacy Owner"
            : "Order cancelled by pharmacy procurement user",
          changedBy: "Dr. Rafiqul Islam (Pharmacy Owner)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(
          newStatus === OrderStatus.DELIVERED
            ? `Order confirmed delivered! Medicines have been added to your local stockroom.`
            : `Order has been cancelled.`
        );
        fetchOrders();
        setTimeout(() => setActionSuccessMsg(""), 4000);
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating order status.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ACTIVE") {
      if (o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED) return false;
    } else if (filter === "DELIVERED") {
      if (o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED) return false;
    } else if (filter === "CANCELLED") {
      if (o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.orderNumber.toLowerCase().includes(q);
      const matchComp = o.companyName.toLowerCase().includes(q);
      const matchChallan = o.challanNumber?.toLowerCase().includes(q);
      if (!matchNo && !matchComp && !matchChallan) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Order Tracking & Lifecycle</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 uppercase">
                  Real-time GxP
                </span>
              </div>
              <p className="text-xs text-slate-500">Track company dispatches, cold-chain couriers & delivery receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-50/70">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by order #, challan, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
            />
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: "ALL", label: "All Orders" },
              { id: "ACTIVE", label: "In Transit" },
              { id: "DELIVERED", label: "Delivered" },
              { id: "CANCELLED", label: "Cancelled" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === f.id
                    ? "bg-[#139485] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Loading orders from database...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No orders found in this view</p>
              <p className="text-xs text-slate-400">Use "Place Order" to browse pharmaceutical catalogs and cut orders.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REJECTED;
              const isDelivered = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED;
              const isDispatched = order.status === OrderStatus.DISPATCHED;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5 hover:border-teal-200 transition-all"
                >
                  {/* Order Top Banner */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{order.orderNumber}</span>
                        {order.challanNumber && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Challan: {order.challanNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-teal-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{order.companyName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Ordered: {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-right">
                      {isCancelled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                          Cancelled
                        </span>
                      ) : isDelivered ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                          Delivered
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 uppercase animate-pulse">
                          {order.status}
                        </span>
                      )}
                      <div className="text-sm font-black text-slate-900 mt-1">
                        ৳{Number(order.netPayableAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* 5-Stage Stepper Progression */}
                  {!isCancelled && (
                    <div className="pt-2 pb-1">
                      <div className="flex items-center justify-between relative">
                        {/* Connecting background bar */}
                        <div className="absolute left-3 right-3 top-3.5 h-1 bg-slate-100 -z-0" />
                        <div
                          className="absolute left-3 top-3.5 h-1 bg-[#139485] -z-0 transition-all duration-300"
                          style={{ width: `${(currentStep / (STEPS.length - 1)) * 95}%` }}
                        />

                        {STEPS.map((st, idx) => {
                          const isPassed = idx <= currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div key={st.key} className="flex flex-col items-center gap-1 z-10">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                  isPassed
                                    ? "bg-[#139485] text-white shadow-xs"
                                    : "bg-slate-200 text-slate-400"
                                } ${isCurrent ? "ring-4 ring-teal-100 scale-105" : ""}`}
                              >
                                {isPassed ? "✓" : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-bold ${
                                  isPassed ? "text-teal-900" : "text-slate-400"
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items Summary Strip */}
                  {order.items && order.items.length > 0 && (
                    <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                      {order.items.slice(0, 3).map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {it.brandName || it.medicineName}
                          </span>
                          <span className="font-bold text-slate-600">
                            {it.orderedQty || it.orderedBoxes || 1} Boxes
                            {it.bonusLooseUnits && it.bonusLooseUnits > 0 ? (
                              <span className="text-[10px] font-black text-emerald-600 ml-1">
                                (+{Math.ceil(it.bonusLooseUnits / 100)} Free)
                              </span>
                            ) : null}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-[10px] text-slate-400 font-bold text-right pt-0.5">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned MPO & Driver info */}
                  {(order.assignedMPO || order.vanPlate) && (
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                      {order.assignedMPO && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-bold">MPO:</span>
                          <span className="font-bold text-slate-800">{order.assignedMPO.name}</span>
                          <a
                            href={`tel:${order.assignedMPO.phone}`}
                            className="text-teal-600 hover:text-teal-800"
                            title={`Call MPO: ${order.assignedMPO.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {order.vanPlate && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-bold">Courier:</span>
                          <span className="font-mono text-[11px] font-bold text-slate-700">{order.vanPlate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {onOpenInvoice && (
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(order.id)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          <span>Invoice</span>
                        </button>
                      )}

                      {isDelivered && onOpenReturn && (
                        <button
                          type="button"
                          onClick={() => onOpenReturn(order)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Return Claim</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Cancel action if still pending or processing */}
                      {!isCancelled && !isDelivered && currentStep < 3 && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, OrderStatus.CANCELLED)}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold border border-rose-200 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Confirm Receipt action if dispatched */}
                      {isDispatched && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Delivery & Restock</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
