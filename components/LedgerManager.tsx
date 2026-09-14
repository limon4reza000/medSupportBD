"use client";

import React, { useState, useEffect } from "react";
import { IPharmacy, TransactionType } from "@/types/domain";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
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
      <div className="glass-panel rounded-2xl p-6 border border-[#10b981]/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#025540] border border-[#10b981] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#34d399]" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Pharmacy Ledger & Real-Time Credit Control
              </h2>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              Maintains an immutable double-entry financial transaction log for {pharmacy.tradeName}, tracking order invoice debits, payment credit settlements, and credit headroom.
            </p>
          </div>

          <button
            onClick={fetchLedger}
            className="px-3 py-2 rounded-xl bg-[#023528] border border-[#047857]/60 text-xs font-semibold text-white hover:bg-[#025540] flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#34d399] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Ledger Transaction History Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-[#047857]/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#047857]/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-[#34d399]" />
                Transaction Statement ({entries.length} Records)
              </h3>
              <span className="text-xs text-emerald-300 font-mono">
                License: {pharmacy.drugLicenseNo}
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {entries.length === 0 ? (
                <div className="py-12 text-center text-emerald-300/60">
                  <p className="text-xs font-semibold text-white">No ledger entries found</p>
                </div>
              ) : (
                entries.map((entry) => {
                  const isDebit = entry.transactionType === TransactionType.INVOICE_DEBIT;

                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-[#011e17] border border-[#047857]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isDebit
                              ? "bg-red-950/80 text-red-400 border border-red-500/40"
                              : "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
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
                            <span className="font-bold text-white font-mono">
                              {entry.referenceNumber}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                                isDebit
                                  ? "bg-red-950 text-red-300 border border-red-500/40"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                              }`}
                            >
                              {isDebit ? "INVOICE DEBIT" : "PAYMENT SETTLEMENT"}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-300/70 mt-0.5">{entry.notes}</p>
                          <span className="text-[10px] text-emerald-400/50">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p
                          className={`text-sm font-bold ${
                            isDebit ? "text-red-400" : "text-[#34d399]"
                          }`}
                        >
                          {isDebit ? "+" : "-"}৳{entry.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-emerald-300/70">
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
          <div className="glass-panel rounded-2xl p-5 border border-[#10b981]/40 space-y-4">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#047857]/40 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34d399]" />
              Account Balance & Credit Exposure
            </h3>

            {/* Metrics */}
            <div className="p-3.5 bg-[#01140f] rounded-xl border border-[#047857]/50 text-xs font-mono space-y-2">
              <div className="flex justify-between text-emerald-200">
                <span>Total Credit Limit:</span>
                <strong className="text-white font-bold">৳{pharmacy.creditLimit.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Current Outstanding:</span>
                <strong className="text-amber-300 font-bold">৳{pharmacy.currentBalance.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Available Headroom:</span>
                <strong className="text-[#34d399] font-bold">
                  ৳{Math.max(0, pharmacy.creditLimit - pharmacy.currentBalance).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-emerald-200 mb-1">
                <span>Credit Utilization:</span>
                <strong className="text-white font-mono">{utilizationPercent}%</strong>
              </div>
              <div className="w-full bg-[#01140f] h-2.5 rounded-full overflow-hidden border border-[#047857]/30">
                <div
                  className={`h-full transition-all duration-500 ${
                    utilizationPercent > 90
                      ? "bg-red-500"
                      : utilizationPercent > 70
                      ? "bg-amber-400"
                      : "bg-[#10b981]"
                  }`}
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
            </div>

            {/* Payment Settlement Simulation Form */}
            <div className="pt-3 border-t border-[#047857]/40 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-[#34d399]" />
                Receive Settlement / Clear Balance
              </h4>

              <div>
                <label className="text-[11px] text-emerald-300 block mb-1">Payment Amount (৳):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#01140f] border border-[#047857]/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="text-[11px] text-emerald-300 block mb-1">Payment Channel:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#01140f] border border-[#047857]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#025540] hover:from-[#34d399] hover:to-[#047857] text-white font-bold text-xs shadow-md shadow-[#10b981]/20 flex items-center justify-center gap-1.5 transition-all"
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
