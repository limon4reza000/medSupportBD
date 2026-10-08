"use client";

import React, { useState } from "react";
import { X, DollarSign, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

interface RecordCompanyPaymentModalProps {
  onClose: () => void;
  defaultCompanyId?: string;
}

export const RecordCompanyPaymentModal: React.FC<RecordCompanyPaymentModalProps> = ({
  onClose,
  defaultCompanyId,
}) => {
  const { companies, recordCompanyPayment } = useApp();

  const [companyId, setCompanyId] = useState(defaultCompanyId || companies[0]?.id || "");
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [notes, setNotes] = useState("");

  const selectedCompany = companies.find((c) => c.id === companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || amount <= 0) return;
    recordCompanyPayment(companyId, amount, paymentMethod, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-300" />
            <h3 className="font-black text-base">Record Payment to Distributor</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Pharma Company *</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Due: ৳{c.dueBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedCompany && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between text-xs">
              <span className="text-slate-500">Current Outstanding Due:</span>
              <strong className="font-mono text-rose-700 font-black">
                ৳{selectedCompany.dueBalance.toLocaleString()}
              </strong>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Payment Amount (৳) *</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
            >
              <option value="BANK_TRANSFER">Bank Transfer / Cheque</option>
              <option value="CASH">Cash to MR</option>
              <option value="BKASH">bKash Merchant</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Notes / Voucher Reference</label>
            <input
              type="text"
              placeholder="e.g. Cheque #88391 DBBL Dhanmondi Branch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Confirm Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
