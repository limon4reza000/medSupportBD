"use client";

import React, { useState } from "react";
import {
  Printer,
  Share2,
  Copy,
  Check,
  X,
  Phone,
  Calendar,
  User,
  CreditCard,
  QrCode,
  DollarSign,
  Send,
} from "lucide-react";
import { IPosSale, PackagingUnit } from "@/types/domain";
import { useApp } from "@/lib/context/AppContext";

interface ThermalReceiptModalProps {
  sale: IPosSale | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ sale, onClose }) => {
  const { currentPharmacy, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const getReceiptPlainText = () => {
    const lines = [
      `==============================`,
      `${currentPharmacy.tradeName.toUpperCase()}`,
      `${currentPharmacy.address}`,
      `Phone: ${currentPharmacy.phone}`,
      `Lic No: ${currentPharmacy.drugLicenseNo}`,
      `==============================`,
      `INVOICE: ${sale.invoiceNo}`,
      `DATE: ${new Date(sale.date).toLocaleString("en-BD")}`,
      `CUSTOMER: ${sale.customerName || "Walking Customer"} (${sale.customerPhone || "N/A"})`,
      `SERVED BY: ${sale.servedBy}`,
      `------------------------------`,
      `ITEMS:`,
      ...sale.items.map(
        (it, idx) =>
          `${idx + 1}. ${it.brandName} (${it.strength})\n   ${it.qty} ${it.unit} x ৳${it.unitPrice.toFixed(2)} = ৳${it.total.toFixed(2)}`
      ),
      `------------------------------`,
      `Subtotal:      ৳${sale.subtotal.toFixed(2)}`,
      sale.discountAmount > 0 ? `Discount:     -৳${sale.discountAmount.toFixed(2)}` : null,
      `VAT / Tax:     ৳${sale.vatAmount.toFixed(2)}`,
      `NET TOTAL:     ৳${sale.netTotal.toFixed(2)}`,
      `------------------------------`,
      `Payment Mode:  ${sale.paymentMethod}`,
      sale.cashPaid > 0 ? `Cash Paid:     ৳${sale.cashPaid.toFixed(2)}` : null,
      sale.digitalPaid > 0 ? `Digital Paid:  ৳${sale.digitalPaid.toFixed(2)}` : null,
      sale.dueAmount > 0 ? `DUE AMOUNT:    ৳${sale.dueAmount.toFixed(2)}` : null,
      sale.changeGiven > 0 ? `Change Return: ৳${sale.changeGiven.toFixed(2)}` : null,
      `==============================`,
      `Get Well Soon! Powered by MedSupply BD`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getReceiptPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getReceiptPlainText());
    const phone = sale.customerPhone ? sale.customerPhone.replace(/[^0-9]/g, "") : "";
    const cleanPhone = phone.startsWith("88") ? phone : phone.startsWith("01") ? `88${phone}` : phone;
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Non-printed) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Thermal POS Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCopyText}
            className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Scrollable Printable Thermal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-900 font-mono text-xs leading-relaxed bg-white">
          <div className="w-full max-w-[340px] mx-auto border border-dashed border-slate-300 p-4 rounded-xl bg-slate-50/50 print:border-none print:p-0">
            
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h2 className="font-black text-base text-slate-900 tracking-tight font-sans">
                {currentPharmacy.tradeName}
              </h2>
              <p className="text-[10px] text-slate-500 leading-tight">
                {currentPharmacy.address}
              </p>
              <p className="text-[10px] text-slate-500">
                Hotline: <strong className="text-slate-800">{currentPharmacy.phone}</strong>
              </p>
              <div className="text-[9px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200">
                Drug Lic: {currentPharmacy.drugLicenseNo}
              </div>
            </div>

            {/* Bill Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <strong className="text-slate-900">{sale.invoiceNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date/Time:</span>
                <span className="text-slate-700">{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-900 font-bold">{sale.customerName || "Walking Customer"}</span>
              </div>
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-800">{sale.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Served By:</span>
                <span className="text-slate-700">{sale.servedBy}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-2">
              <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase">
                <span>Item & Pack</span>
                <span>Qty x Rate</span>
                <span>Total</span>
              </div>

              {sale.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="font-bold text-slate-900">
                    {it.brandName} <span className="text-[10px] text-slate-500 font-normal">({it.strength})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[10px] text-slate-500">
                      {it.qty} {it.unit} @ ৳{it.unitPrice.toFixed(2)}
                      {it.discountPercent > 0 && <span className="text-rose-600"> (-{it.discountPercent}%)</span>}
                    </span>
                    <strong className="text-slate-900">৳{it.total.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>৳{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Discount:</span>
                  <span>-৳{sale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax (2.4%):</span>
                <span>৳{sale.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>NET TOTAL:</span>
                <span>৳{sale.netTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                  {sale.paymentMethod}
                </span>
              </div>
              {sale.cashPaid > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Cash Paid:</span>
                  <span>৳{sale.cashPaid.toFixed(2)}</span>
                </div>
              )}
              {sale.digitalPaid > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Digital ({sale.digitalTxnId || "Online"}):</span>
                  <span>৳{sale.digitalPaid.toFixed(2)}</span>
                </div>
              )}
              {sale.dueAmount > 0 && (
                <div className="flex justify-between text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                  <span>Due (Ledger):</span>
                  <span>৳{sale.dueAmount.toFixed(2)}</span>
                </div>
              )}
              {sale.changeGiven > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Change Given:</span>
                  <span>৳{sale.changeGiven.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode Graphic & Footer Note */}
            <div className="pt-3 text-center space-y-2">
              <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
                ||||| | |||| ||| |||||| | ||||| ||||
              </div>
              <p className="text-[10px] text-slate-600 font-medium">
                Thank you! Wishing you a speedy recovery.
              </p>
              <div className="text-[8px] text-slate-400">
                MedSupply BD Smart Pharmacy OS • No returns without receipt
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Done Button */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
          >
            Close & Start Next Sale
          </button>
        </div>

      </div>
    </div>
  );
};
