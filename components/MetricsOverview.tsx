"use client";

import React from "react";
import { IBatch, IMedicine, IPharmacy, ITradeOffer } from "@/types/domain";
import { Package, ShieldAlert, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
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
      <div className="glass-card rounded-2xl p-4 bg-white text-slate-900 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Warehouse Stock (Depot-01)
            </p>
            <h3 className="text-2xl font-bold text-[#025540] mt-1 font-mono">
              {totalLooseStock.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-slate-600">loose units</span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 font-medium">Across {medicines.length} verified SKU lines</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#025540] flex items-center justify-center text-white shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-[#025540] gap-1.5 font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-[#025540]" />
          <span>FIFO near-expiry auto allocation active</span>
        </div>
      </div>

      {/* 2. Pharmacy Credit Ceiling & Exposure */}
      <div className="glass-card rounded-2xl p-4 bg-white text-slate-900 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Available Credit Headroom
            </p>
            <h3 className="text-2xl font-bold text-[#025540] mt-1 font-mono">
              ৳{availableCredit.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 font-medium">
              Used: ৳{pharmacy.currentBalance.toLocaleString()} of ৳{pharmacy.creditLimit.toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#025540] flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-[#025540] gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#025540]"></span>
          <span>Max Credit Term: {pharmacy.creditDaysLimit} Days</span>
        </div>
      </div>

      {/* 3. Dynamic Trade Schemes */}
      <div className="glass-card rounded-2xl p-4 bg-white text-slate-900 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Trade Schemes
            </p>
            <h3 className="text-2xl font-bold text-[#025540] mt-1 font-mono">
              {activeOffersCount}{" "}
              <span className="text-xs font-semibold text-slate-600">promotions</span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 font-medium">10+1 Napa Extra, 5% Seclo Slab</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#025540] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-[#025540] gap-1.5 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#025540]" />
          <span>Auto-calculated bonus on checkout</span>
        </div>
      </div>

      {/* 4. Near-Expiry FIFO Watchlist */}
      <div className="glass-card rounded-2xl p-4 bg-white text-slate-900 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Near-Expiry Watchlist
            </p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1 font-mono">
              {nearExpiryBatches.length}{" "}
              <span className="text-xs font-semibold text-slate-600">batches</span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 font-medium">Expiring within 90 days</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-300 shadow-md">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-amber-700 gap-1.5 font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Priority FIFO dispatch forced</span>
        </div>
      </div>
    </div>
  );
};
