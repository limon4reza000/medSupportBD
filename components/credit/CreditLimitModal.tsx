"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Receipt,
  Search,
} from "lucide-react";
import { TransactionType } from "@/types/domain";

interface CreditData {
  pharmacy: {
    id: string;
    tradeName: string;
    drugLicenseNo: string;
    creditLimit: number;
    currentBalance: number;
    availableCredit: number;
    utilizationPercent: number;
    creditDaysLimit: number;
    isCreditBlocked: boolean;
  };
  companyBalances: {
    companyName: string;
    allocatedLimit: number;
    outstandingDue: number;
    creditDays: number;
    daysOverdue: number;
    status: string;
  }[];
  ledger: {
    id: string;
    transactionType: TransactionType;
    amount: number;
    previousBalance: number;
    newBalance: number;
    referenceNumber: string;
    notes?: string;
    createdAt: string;
  }[];
}

interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditLimitModal: React.FC<CreditLimitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<CreditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<"BKASH" | "NAGAD" | "BANK" | "CASH">("BKASH");
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  const fetchCredit = () => {
    setIsLoading(true);
    fetch("/api/credit")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
          setPayAmount(resData.pharmacy.currentBalance);
        }
      })
      .catch((err) => console.error("Error fetching credit:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchCredit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSettlePayment = async () => {
    if (!data || payAmount <= 0) return;
    setIsSubmittingPay(true);
    try {
      const res = await fetch("/api/credit/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          paymentMethod: payMethod,
          notes: `Wholesale dues settlement via ${payMethod}`,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setPaySuccessMsg(`Settlement of ৳${payAmount.toLocaleString()} successful! Available credit restored.`);
        fetchCredit();
        setTimeout(() => {
          setIsPaying(false);
          setPaySuccessMsg("");
        }, 1800);
      } else {
        alert(resData.error || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing payment.");
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const pharmacy = data?.pharmacy;
  const utilization = pharmacy?.utilizationPercent || 28.8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Wholesale Credit Facility</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  Verified Good Standing
                </span>
              </div>
              <p className="text-xs text-slate-500">B2B revolving credit limit, distributor balances & ledger audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading || !pharmacy ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Auditing credit ledger...</span>
            </div>
          ) : (
            <>
              {/* Top Summary Facility Widget */}
              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Approved Facility Limit
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-400">
                    Cycle: {pharmacy.creditDaysLimit} Days
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black tracking-tight">৳{pharmacy.creditLimit.toLocaleString()}</div>
                    <span className="text-[11px] text-slate-400 font-medium">{pharmacy.tradeName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaying(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#139485] hover:bg-teal-600 text-white text-xs font-black shadow-xs active:scale-95 transition-transform"
                  >
                    Pay Wholesale Dues
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-rose-300">Used: ৳{pharmacy.currentBalance.toLocaleString()} ({utilization}%)</span>
                    <span className="text-emerald-300">Available: ৳{pharmacy.availableCredit.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        utilization > 80 ? "bg-rose-500" : utilization > 50 ? "bg-amber-400" : "bg-[#139485]"
                      }`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Company-Wise Credit Sub-Limits */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Company-Wise Outstanding Dues</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active Portfolios</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {data.companyBalances.map((comp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="font-bold text-slate-800 line-clamp-1">{comp.companyName.split(" ")[0]}</div>
                      <div className="text-[11px] text-slate-500">Limit: ৳{comp.allocatedLimit.toLocaleString()}</div>
                      <div className="text-sm font-black text-teal-800 pt-0.5">
                        Due: ৳{comp.outstandingDue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        ● 0 Days Overdue
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Ledger Audit Trail */}
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Recent Ledger Transactions</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{data.ledger.length} Records</span>
                </h3>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {data.ledger.map((tx) => {
                      const isDebit = tx.transactionType === TransactionType.INVOICE_DEBIT;
                      const isCredit = tx.transactionType === TransactionType.PAYMENT_CREDIT;
                      const isReturn = tx.transactionType === TransactionType.RETURN_CREDIT;

                      return (
                        <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                isDebit
                                  ? "bg-rose-100 text-rose-700"
                                  : isCredit
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-teal-100 text-teal-700"
                              }`}
                            >
                              {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900">{tx.referenceNumber}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">{tx.notes || tx.transactionType}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-black ${
                                isDebit ? "text-rose-600" : "text-emerald-600"
                              }`}
                            >
                              {isDebit ? "+" : "-"}৳{tx.amount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Bal: ৳{tx.newBalance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SETTLE WHOLESALE DUES MODAL                                   */}
      {/* ------------------------------------------------------------- */}
      {isPaying && pharmacy && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Settle Wholesale Dues</h3>
              <button
                type="button"
                onClick={() => setIsPaying(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Outstanding Balance:</span>
                <span className="font-black text-rose-600">৳{pharmacy.currentBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Current Available Credit:</span>
                <span className="font-black text-teal-800">৳{pharmacy.availableCredit.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Channel Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Select Payment Channel:</span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: "BKASH", label: "bKash", color: "bg-[#D12053] text-white" },
                  { id: "NAGAD", label: "Nagad", color: "bg-[#F7941D] text-white" },
                  { id: "BANK", label: "Bank", color: "bg-[#139485] text-white" },
                  { id: "CASH", label: "Cash", color: "bg-emerald-600 text-white" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayMethod(m.id as any)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      payMethod === m.id
                        ? `${m.color} shadow-xs ring-2 ring-slate-900`
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Settlement Amount (৳):</span>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                min={1}
                max={pharmacy.currentBalance}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              />
            </div>

            {paySuccessMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{paySuccessMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSettlePayment}
              disabled={isSubmittingPay || payAmount <= 0}
              className="w-full py-3 rounded-2xl bg-[#139485] hover:bg-teal-700 text-white text-xs font-black shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmittingPay ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Execute Settlement of ৳{payAmount.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
