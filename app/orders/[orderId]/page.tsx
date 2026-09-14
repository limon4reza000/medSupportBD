"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Calendar,
  Layers,
  Tag,
  ShieldCheck,
  Package,
  Boxes,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { orders } = useApp();

  const order = orders.find((o) => o.id === orderId) || orders[0];

  const timelineSteps = [
    { title: "Order Cut & Stock Locked", time: "10:15 AM", status: "COMPLETED", desc: "Acquired Redis concurrency lock; verified credit ceiling" },
    { title: "FEFO Batch Allocated", time: "10:16 AM", status: "COMPLETED", desc: "Batches reserved in order of earliest expiration" },
    { title: "Depot Packing & Verification", time: "11:30 AM", status: "COMPLETED", desc: "Barcodes scanned and packaged with thermal seal" },
    { title: "Dispatched with MPO/Courier", time: "01:00 PM", status: order.status === "DELIVERED" ? "COMPLETED" : "CURRENT", desc: `Assigned to ${order.assignedSalesRep}` },
    { title: "Delivered & Signed by Pharmacy", time: order.status === "DELIVERED" ? "04:30 PM" : "Pending", status: order.status === "DELIVERED" ? "COMPLETED" : "PENDING", desc: "Physical delivery verification & e-signature" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* INVOICE & ORDER CARD (Pure White Card) */}
      <div className="premium-card p-6 sm:p-8 space-y-6">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#025540] text-white flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-black text-xl text-slate-900">MedSupply<span className="text-emerald-600">BD</span></span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Central Pharmaceutical Distribution Depot • DGDA Lic #DL-DHK-9901
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice & Delivery Memo</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">{order.orderNumber}</div>
            <div className="text-xs text-slate-500">
              Date: {new Date(order.orderDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Status: {order.status}
            </span>
          </div>
        </div>

        {/* Customer & SR Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Billed & Delivered To:</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{order.pharmacyName}</div>
            <div className="text-slate-600 mt-0.5">Dhanmondi, Dhaka • Lic: DL-DHK-2022-88219</div>
          </div>
          <div className="sm:text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Fulfillment Representative:</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{order.assignedSalesRep}</div>
            <div className="text-emerald-700 font-semibold mt-0.5">Expected Delivery: {order.expectedDelivery}</div>
          </div>
        </div>

        {/* Items & FEFO Allocations Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-emerald-700" />
            <span>Ordered Items & Batch-Level FEFO Breakdown</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Medicine & Generic</th>
                  <th className="py-2.5 px-3">Ordered Unit</th>
                  <th className="py-2.5 px-3">Billed / Bonus Pieces</th>
                  <th className="py-2.5 px-3">Allocated Batches (FEFO)</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.brandName}</div>
                      <div className="text-[11px] text-slate-500">{item.genericName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {item.orderedQty} {item.orderedUnit}(s)
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-900">{item.looseUnitsBilled} pcs</div>
                      {item.bonusLooseUnits > 0 && (
                        <div className="text-[10px] font-bold text-emerald-700">+{item.bonusLooseUnits} bonus pcs</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {item.batches.map((b, bIdx) => (
                          <div key={bIdx} className="text-[11px] font-mono text-slate-700">
                            <span className="font-bold text-emerald-800">{b.batchNumber}</span> ({b.piecesAllocated} pcs) • Exp: {b.expiryDate}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ৳{item.netItemTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Calculation */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-80 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Total:</span>
              <span className="font-mono font-bold text-slate-900">৳{order.grossAmount.toFixed(2)}</span>
            </div>
            {order.tradeDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Trade Scheme Bonus:</span>
                <span className="font-mono">-৳{order.tradeDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>VAT Amount:</span>
              <span className="font-mono">৳{order.vatAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
              <span className="font-black text-sm text-slate-900">Net Payable:</span>
              <span className="text-xl font-black font-mono text-emerald-800">
                ৳{order.netPayableAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER FULFILLMENT TIMELINE */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Authoritative Order Timeline</span>
          </h3>

          <div className="space-y-3">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  step.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : step.status === "CURRENT"
                    ? "bg-blue-100 text-blue-800 animate-pulse"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{step.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{step.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
