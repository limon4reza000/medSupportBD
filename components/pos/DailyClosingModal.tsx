"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Printer,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Lock,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

interface DailyClosingModalProps {
  onClose: () => void;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({ onClose }) => {
  const { posSales, recordDailyClosing, currentPharmacy, currentUser } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [openingCash, setOpeningCash] = useState<number>(3000);
  const [actualDrawerCash, setActualDrawerCash] = useState<number>(3000);
  const [closingNotes, setClosingNotes] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Filter sales for selected date
  const filteredSales = posSales.filter((s) => s.date.startsWith(selectedDate));

  const totalBills = filteredSales.length;
  const grossSales = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
  const totalDiscount = filteredSales.reduce((acc, s) => acc + s.discountAmount, 0);
  const totalVat = filteredSales.reduce((acc, s) => acc + s.vatAmount, 0);
  const netRevenue = filteredSales.reduce((acc, s) => acc + s.netTotal, 0);

  const cashSales = filteredSales.reduce((acc, s) => acc + (s.cashPaid || 0), 0);
  const bkashSales = filteredSales
    .filter((s) => s.paymentMethod === "BKASH")
    .reduce((acc, s) => acc + s.digitalPaid, 0);
  const nagadSales = filteredSales
    .filter((s) => s.paymentMethod === "NAGAD")
    .reduce((acc, s) => acc + s.digitalPaid, 0);
  const dueSales = filteredSales.reduce((acc, s) => acc + (s.dueAmount || 0), 0);

  // Cost calculation
  const totalCost = filteredSales.reduce((acc, s) => {
    const saleCost = s.items.reduce(
      (iAcc, it) => iAcc + (it.costPricePerPiece || 0) * it.looseUnits,
      0
    );
    return acc + saleCost;
  }, 0);

  const grossProfit = Math.max(0, netRevenue - totalCost);
  const profitMarginPercent = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0;

  const expectedDrawerCash = openingCash + cashSales;
  const cashDifference = actualDrawerCash - expectedDrawerCash;

  const handleSaveClosing = () => {
    recordDailyClosing({
      date: selectedDate,
      totalBills,
      grossSales,
      totalDiscount,
      totalVat,
      netRevenue,
      cashSales,
      bkashSales,
      nagadSales,
      dueSales,
      totalCostOfGoods: totalCost,
      grossProfit,
      openingCash,
      expectedDrawerCash,
      actualDrawerCash,
      cashDifference,
      notes: closingNotes,
    });
    setIsSaved(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">Daily Closing Z-Report</h2>
              <p className="text-xs text-emerald-100/80">
                End-of-day register reconciliation, cash balance audit & revenue breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Filter & Print Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Register Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Z-Report</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-900">
          
          {/* Pharmacy & Register Header */}
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <h3 className="font-black text-xl text-slate-900">{currentPharmacy.tradeName}</h3>
            <p className="text-xs text-slate-500">{currentPharmacy.address}</p>
            <div className="text-xs font-mono text-emerald-800 font-bold">
              CLOSING REPORT: {selectedDate} • Terminal #01 (Main Counter)
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Bills Cut</span>
              <div className="text-xl font-black font-mono text-slate-900 mt-0.5">{totalBills}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Net Revenue</span>
              <div className="text-xl font-black font-mono text-emerald-800 mt-0.5">
                ৳{netRevenue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Gross Profit</span>
              <div className="text-xl font-black font-mono text-blue-800 mt-0.5">
                ৳{grossProfit.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">{profitMarginPercent}% Margin</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Total Discounts</span>
              <div className="text-xl font-black font-mono text-amber-800 mt-0.5">
                ৳{totalDiscount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Payment Method Collection Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment Channel Collections</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">💵 Cash In Hand</span>
                <strong className="text-slate-900 font-mono text-sm">৳{cashSales.toFixed(2)}</strong>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-pink-600 font-bold block">📱 bKash Merchant</span>
                <strong className="text-slate-900 font-mono text-sm">৳{bkashSales.toFixed(2)}</strong>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-orange-600 font-bold block">🟠 Nagad Collection</span>
                <strong className="text-slate-900 font-mono text-sm">৳{nagadSales.toFixed(2)}</strong>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-rose-600 font-bold block">📑 Credit / Due Sales</span>
                <strong className="text-rose-700 font-mono text-sm">৳{dueSales.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Cash Drawer Reconciliation */}
          <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Physical Cash Drawer Reconciliation</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Opening Float / Change (৳)
                </label>
                <input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Expected Drawer Cash (৳)
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono font-black text-slate-800">
                  ৳{expectedDrawerCash.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">Opening (৳{openingCash}) + Cash Sales (৳{cashSales})</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Actual Counted Drawer Cash (৳)
                </label>
                <input
                  type="number"
                  value={actualDrawerCash}
                  onChange={(e) => setActualDrawerCash(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Discrepancy indicator */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Cash Discrepancy (Over / Short):</span>
              <div
                className={`text-sm font-mono font-black ${
                  cashDifference === 0
                    ? "text-emerald-700"
                    : cashDifference > 0
                    ? "text-blue-700"
                    : "text-rose-700"
                }`}
              >
                {cashDifference === 0
                  ? "৳0.00 (Balanced)"
                  : cashDifference > 0
                  ? `+৳${cashDifference.toFixed(2)} (Overage)`
                  : `-৳${Math.abs(cashDifference).toFixed(2)} (Shortage)`}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Closing Remarks / Auditor Notes:
              </label>
              <textarea
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="e.g. Verified by Pharmacist Tariqul, deposit scheduled for tomorrow morning."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Audit Verification Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div className="pt-8 border-t border-dashed border-slate-300">
              <span>Cashier / Pharmacist Signature</span>
            </div>
            <div className="pt-8 border-t border-dashed border-slate-300">
              <span>Store Owner / Supervisor Signature</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveClosing}
            disabled={isSaved}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
              isSaved
                ? "bg-slate-400 text-white cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98"
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isSaved ? "Register Closed & Saved" : "Save & Close Register (Z-Report)"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
