"use client";

import React from "react";
import { IBatch, IMedicine, IPharmacy, ITradeOffer } from "@/types/domain";
import { Package, ShieldAlert, Sparkles, TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";
import { BatchFifoEngine } from "@/services/batchFifoEngine";

interface MetricsOverviewProps {
  medicines: IMedicine[];
  batches: IBatch[];
  offers: ITradeOffer[];
  pharmacy: IPharmacy;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  medicines,
  batches,
  offers,
  pharmacy,
}) => {
  const totalLooseStock = BatchFifoEngine.getTotalAvailableStock(batches);

  // Near-expiry batches (< 90 days)
  const now = new Date();
  const nearExpiryBatches = batches.filter((b) => {
    const diff = new Date(b.expiryDate).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 90;
  });

  const activeOffersCount = offers.filter((o) => o.isActive).length;
  const availableCredit = Math.max(0, pharmacy.creditLimit - pharmacy.currentBalance);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Available Loose Stock */}
      <div className="premium-card p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#025540]"></span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Depot Inventory
              </p>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 font-mono tracking-tight">
              {totalLooseStock.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Loose pieces across {medicines.length} verified SKUs
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#025540] to-[#036b51] flex items-center justify-center text-white shadow-lg shadow-[#025540]/20 group-hover:scale-105 transition-transform duration-200">
            <Package className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-[#025540] font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            FIFO Dispatch Active
          </span>
          <span className="text-slate-400 font-medium">Depot-01</span>
        </div>
      </div>

      {/* 2. Pharmacy Credit Ceiling & Exposure */}
      <div className="premium-card p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#025540]"></span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Credit Headroom
              </p>
            </div>
            <h3 className="text-2xl font-black text-[#025540] mt-1.5 font-mono tracking-tight">
              ৳{availableCredit.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Used: ৳{pharmacy.currentBalance.toLocaleString()} / ৳{pharmacy.creditLimit.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#025540] to-[#036b51] flex items-center justify-center text-white shadow-lg shadow-[#025540]/20 group-hover:scale-105 transition-transform duration-200">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-[#025540] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Limit Approved
          </span>
          <span className="text-slate-400 font-medium">Max {pharmacy.creditDaysLimit} Days</span>
        </div>
      </div>

      {/* 3. Dynamic Trade Schemes */}
      <div className="premium-card p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#025540]"></span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Live Trade Bonus
              </p>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 font-mono tracking-tight">
              {activeOffersCount}{" "}
              <span className="text-xs font-semibold text-slate-400">active</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              10+1 Napa Extra, 5% Seclo Slab
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#025540] to-[#036b51] flex items-center justify-center text-white shadow-lg shadow-[#025540]/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-[#025540] font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Auto Calculated
          </span>
          <span className="text-slate-400 font-medium">Instant Discount</span>
        </div>
      </div>

      {/* 4. Near-Expiry FIFO Watchlist */}
      <div className="premium-card p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Near-Expiry Alert
              </p>
            </div>
            <h3 className="text-2xl font-black text-amber-700 mt-1.5 font-mono tracking-tight">
              {nearExpiryBatches.length}{" "}
              <span className="text-xs font-semibold text-slate-400">batches</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Expiring within 90 days
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-200">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-amber-700 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Priority Dispatch
          </span>
          <span className="text-slate-400 font-medium">Zero Waste</span>
        </div>
      </div>
    </div>
  );
};
