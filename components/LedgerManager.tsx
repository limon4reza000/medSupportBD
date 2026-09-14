"use client";

import React, { useState, useEffect } from "react";
import { IPharmacy, TransactionType } from "@/types/domain";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Building,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  pharmacyId: string;
  orderId?: string;
  transactionType: TransactionType;
  amount: number;
  previousBalance: number;
  newBalance: number;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
}

interface LedgerManagerProps {
  pharmacy: IPharmacy;
  onRefreshPharmacy: () => void;
}

export const LedgerManager: React.FC<LedgerManagerProps> = ({
  pharmacy,
  onRefreshPharmacy,
}) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<string>("bKash Merchant");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ledger?pharmacyId=${pharmacy.id}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setEntries(json);
      }
    } catch (err) {
      console.error("Failed to load ledger", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [pharmacy.id]);

  const handleSimulatePayment = async () => {
    if (paymentAmount <= 0) return;
    setIsSubmitting(true);

    try {
      // Direct settlement simulation
      const newBalance = Math.max(0, pharmacy.currentBalance - paymentAmount);
      const newEntry: LedgerEntry = {
        id: `PAY-${Date.now()}`,
        pharmacyId: pharmacy.id,
        transactionType: TransactionType.PAYMENT_CREDIT,
        amount: paymentAmount,
        previousBalance: pharmacy.currentBalance,
        newBalance,
        referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
        notes: `Settlement via ${paymentMethod}`,
        createdAt: new Date().toISOString(),
      };

      setEntries((prev) => [newEntry, ...prev]);
      pharmacy.currentBalance = newBalance;
      onRefreshPharmacy();
    } finally {
      setIsSubmitting(false);
    }
  };

  const utilizationPercent = Math.min(
    100,
    Math.round((pharmacy.currentBalance / pharmacy.creditLimit) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="premium-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#025540] to-[#036b51] flex items-center justify-center shadow-md">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Pharmacy Ledger & Real-Time Credit Control
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
              Maintains an immutable double-entry financial transaction log for {pharmacy.tradeName}, tracking order invoice debits, payment credit settlements, and credit headroom.
            </p>
          </div>

          <button
            onClick={fetchLedger}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#025540] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Ledger Transaction History Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#025540]" />
                Transaction Statement ({entries.length} Records)
              </h3>
              <span className="text-xs text-slate-500 font-mono font-bold">
                License: {pharmacy.drugLicenseNo}
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {entries.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-700">No ledger entries found</p>
                </div>
              ) : (
                entries.map((entry) => {
                  const isDebit = entry.transactionType === TransactionType.INVOICE_DEBIT;

                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isDebit
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isDebit ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 font-mono text-sm">
                              {entry.referenceNumber}
                            </span>
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                isDebit
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {isDebit ? "INVOICE DEBIT" : "PAYMENT SETTLEMENT"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{entry.notes}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p
                          className={`text-sm font-black ${
                            isDebit ? "text-red-600" : "text-[#025540]"
                          }`}
                        >
                          {isDebit ? "+" : "-"}৳{entry.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Balance: ৳{entry.newBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Account Summary & Payment Settlement Simulator */}
        <div className="lg:col-span-4 space-y-4">
          <div className="premium-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#025540]" />
              Account Balance & Credit Exposure
            </h3>

            {/* Metrics */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-2.5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Credit Limit:</span>
                <strong className="text-slate-900 font-bold">৳{pharmacy.creditLimit.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Current Outstanding:</span>
                <strong className="text-amber-700 font-bold">৳{pharmacy.currentBalance.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Available Headroom:</span>
                <strong className="text-[#025540] font-black">
                  ৳{Math.max(0, pharmacy.creditLimit - pharmacy.currentBalance).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 font-medium mb-1.5">
                <span>Credit Utilization:</span>
                <strong className="text-slate-900 font-mono font-bold">{utilizationPercent}%</strong>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    utilizationPercent > 90
                      ? "bg-red-500"
                      : utilizationPercent > 70
                      ? "bg-amber-500"
                      : "bg-[#025540]"
                  }`}
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
            </div>

            {/* Payment Settlement Simulation Form */}
            <div className="pt-3.5 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-[#025540]" />
                Receive Settlement / Clear Balance
              </h4>

              <div>
                <label className="text-[11px] text-slate-500 font-bold block mb-1">Payment Amount (৳):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-[#025540] focus:ring-2 focus:ring-[#025540]/10"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-bold block mb-1">Payment Channel:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#025540]"
                >
                  <option value="bKash Merchant">bKash Merchant Pay</option>
                  <option value="Nagad Pay">Nagad Direct Settlement</option>
                  <option value="Bank Cheque Deposit">Bank Cheque / BEFTN</option>
                  <option value="Cash at Depot Counter">Cash at Depot Counter</option>
                </select>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isSubmitting || paymentAmount <= 0}
                className="w-full py-3 rounded-2xl bg-[#025540] hover:bg-[#036b51] text-white font-extrabold text-xs shadow-md shadow-[#025540]/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <span>Post Settlement & Restore Credit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
