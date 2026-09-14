"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building2,
  ArrowRight,
  TrendingUp,
  Receipt,
  RotateCw,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function CreditDashboardPage() {
  const { currentPharmacy, refreshData } = useApp();
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState("BKASH");
  const [isSettling, setIsSettling] = useState(false);
  const [settlementSuccess, setSettlementSuccess] = useState(false);

  const availableCredit = Math.max(0, currentPharmacy.creditLimit - currentPharmacy.currentBalance);
  const creditUtilizationPercent = Math.min(
    100,
    Math.round((currentPharmacy.currentBalance / currentPharmacy.creditLimit) * 100)
  );

  const handleSettlePayment = async () => {
    if (paymentAmount <= 0) return;
    setIsSettling(true);

    try {
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: currentPharmacy.id,
          amount: paymentAmount,
          method: paymentMethod,
          referenceNumber: `PAY-${Date.now()}`,
          notes: `${paymentMethod} payment settlement by pharmacy owner`,
        }),
      });

      if (res.ok) {
        setSettlementSuccess(true);
        await refreshData();
        setTimeout(() => setSettlementSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Payment settlement error:", e);
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Pharmacy Credit & Risk Dashboard</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Credit limits, revolving headroom, overdue invoice aging, and instant electronic repayment.
          </p>
        </div>

        <Link
          href="/transactions"
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4" />
          <span>Ledger Statement</span>
        </Link>
      </div>

      {/* TOP: Credit Gauges (Pure White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Approved Limit */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Credit Limit</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 mt-2">
              ৳{currentPharmacy.creditLimit.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            Terms: <strong>{currentPharmacy.creditDaysLimit} Days Revolving</strong>
          </div>
        </div>

        {/* Card 2: Available Headroom */}
        <div className="premium-card p-6 flex flex-col justify-between border-emerald-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Available Headroom</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active Order Headroom
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-emerald-700 mt-2">
              ৳{availableCredit.toLocaleString()}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
              <span>Utilization: {creditUtilizationPercent}%</span>
              <span>Headroom: {100 - creditUtilizationPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${creditUtilizationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Current Outstanding */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Outstanding</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                Unsettled Invoices
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 mt-2">
              ৳{currentPharmacy.currentBalance.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-4 pt-3 border-t border-slate-100 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 0 Days Overdue • No Penalty
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Aging Analysis & Instant Repayment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Aging Breakdown (Pure White Card) */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Invoice Aging & Risk Gating Analysis
            </h2>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Healthy
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-800">Current (0 - 30 Days)</div>
                <div className="text-[11px] text-slate-500">Normal billing period</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-900">৳{currentPharmacy.currentBalance.toLocaleString()}</div>
                <span className="text-[10px] text-emerald-700 font-semibold">100% in good standing</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between opacity-60">
              <div>
                <div className="font-bold text-xs text-slate-800">Overdue (31 - 60 Days)</div>
                <div className="text-[11px] text-slate-500">Subject to warning notice</div>
              </div>
              <div className="text-right font-mono font-bold text-slate-400">
                ৳0.00
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between opacity-60">
              <div>
                <div className="font-bold text-xs text-slate-800">Critical Overdue (60+ Days)</div>
                <div className="text-[11px] text-slate-500">Auto-blocks order checkout</div>
              </div>
              <div className="text-right font-mono font-bold text-slate-400">
                ৳0.00
              </div>
            </div>
          </div>
        </div>

        {/* Instant Repayment & Settlement (Pure White Card) */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Instant Balance Settlement
            </h2>
            <span className="text-[10px] font-bold text-slate-500">
              bKash / Bank Reconciliation
            </span>
          </div>

          {settlementSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Payment settled! Outstanding balance and credit headroom updated.</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Settlement Amount (৳):</label>
              <input
                type="number"
                min="500"
                step="500"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Payment Gateway / Channel:</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["BKASH", "NAGAD", "BANK_TRANSFER"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === m
                        ? "bg-[#025540] text-white border-[#025540]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {m.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSettlePayment}
              disabled={isSettling || paymentAmount <= 0}
              className="w-full py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSettling ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Processing Settlement...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Settle ৳{paymentAmount.toLocaleString()} Payment</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
