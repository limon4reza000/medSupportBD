"use client";

import React from "react";
import {
  Printer,
  X,
  FileText,
  Share2,
  Building2,
  Phone,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { IDistributorOrder } from "@/types/domain";
import { useApp } from "@/lib/context/AppContext";

interface InvoicePdfModalProps {
  order: IDistributorOrder | null;
  onClose: () => void;
}

export const InvoicePdfModal: React.FC<InvoicePdfModalProps> = ({ order, onClose }) => {
  const { currentPharmacy } = useApp();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `*PURCHASE ORDER: ${order.poNumber}*\nCompany: ${order.companyName}\nDate: ${new Date(
        order.orderDate
      ).toLocaleDateString()}\nTotal Amount: ৳${order.totalAmount.toLocaleString()}\nItems:\n` +
        order.items
          .map((it, idx) => `${idx + 1}. ${it.brandName} (${it.strength}) - ${it.orderedQty} ${it.unit}`)
          .join("\n")
    );
    const phone = order.mrPhone ? order.mrPhone.replace(/[^0-9]/g, "") : "";
    const clean = phone.startsWith("88") ? phone : `88${phone}`;
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Control Bar (Non-printed) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Purchase Order Invoice PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to MR</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable A4 Sheet */}
        <div className="flex-1 overflow-y-auto p-8 text-slate-900 bg-white font-sans text-xs space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-300">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block mb-2">
                OFFICIAL B2B PURCHASE ORDER
              </span>
              <h2 className="text-2xl font-black text-slate-900">{currentPharmacy.tradeName}</h2>
              <p className="text-slate-500 mt-1">{currentPharmacy.address}</p>
              <p className="text-slate-500">Phone: {currentPharmacy.phone}</p>
              <div className="text-slate-700 font-semibold mt-1">
                Drug License: <span className="font-mono">{currentPharmacy.drugLicenseNo}</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-mono text-lg font-black text-slate-900">{order.poNumber}</div>
              <div className="text-slate-500">
                PO Date: <strong>{new Date(order.orderDate).toLocaleDateString()}</strong>
              </div>
              <div className="inline-block mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "CONFIRMED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  STATUS: {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier (Company & MR) Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SUPPLIER / DISTRIBUTOR:
              </span>
              <h4 className="font-black text-sm text-slate-900 mt-1">{order.companyName}</h4>
              <p className="text-slate-600 mt-0.5">Assigned Depot Dispatch Center</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                MEDICAL REPRESENTATIVE (MR):
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">{order.mrName}</h4>
              <p className="text-slate-600 font-mono mt-0.5">{order.mrPhone}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-center">Ordered Qty</th>
                  <th className="py-2.5 px-3 text-right">Trade Rate (৳)</th>
                  <th className="py-2.5 px-3 text-right">Line Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {it.brandName} <span className="font-normal text-slate-500">({it.strength})</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{it.unit}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                      {it.orderedQty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ৳{it.tradePricePerUnit.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      ৳{it.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Trade Value:</span>
                <span className="font-mono font-bold">৳{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className="font-bold text-slate-900">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-700 font-bold">৳{order.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold pt-2 border-t border-slate-200 text-sm">
                <span>Outstanding Balance:</span>
                <span className="font-mono">৳{(order.totalAmount - order.paidAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div className="pt-8 border-t border-dashed border-slate-300">
              <span>Prepared By (Pharmacy Purchase Officer)</span>
            </div>
            <div className="pt-8 border-t border-dashed border-slate-300">
              <span>Accepted & Signed By (Company MR / Depot Officer)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
