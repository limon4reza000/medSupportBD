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
      <div className="glass-card rounded-xl p-4 border border-[#047857]/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
              Warehouse Stock (Depot-01)
            </p>
            <h3 className="text-2xl font-bold text-white mt-1 font-mono">
              {totalLooseStock.toLocaleString()}{" "}
              <span className="text-xs font-normal text-emerald-300/80">loose units</span>
            </h3>
            <p className="text-[11px] text-emerald-200/60 mt-1">Across {medicines.length} verified SKU lines</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#025540] flex items-center justify-center border border-[#10b981]/30">
            <Package className="w-5 h-5 text-[#34d399]" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-emerald-300 gap-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
          <span>FIFO near-expiry auto allocation active</span>
        </div>
      </div>

      {/* 2. Pharmacy Credit Ceiling & Exposure */}
      <div className="glass-card rounded-xl p-4 border border-[#047857]/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
              Available Credit Headroom
            </p>
            <h3 className="text-2xl font-bold text-white mt-1 font-mono">
              ৳{availableCredit.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-200/60 mt-1">
              Used: ৳{pharmacy.currentBalance.toLocaleString()} of ৳{pharmacy.creditLimit.toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#025540] flex items-center justify-center border border-[#10b981]/30">
            <ShieldAlert className="w-5 h-5 text-[#34d399]" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-emerald-300 gap-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Max Credit Term: {pharmacy.creditDaysLimit} Days</span>
        </div>
      </div>

      {/* 3. Dynamic Trade Schemes */}
      <div className="glass-card rounded-xl p-4 border border-[#047857]/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
              Active Trade Schemes
            </p>
            <h3 className="text-2xl font-bold text-white mt-1 font-mono">
              {activeOffersCount}{" "}
              <span className="text-xs font-normal text-emerald-300/80">promotions</span>
            </h3>
            <p className="text-[11px] text-emerald-200/60 mt-1">10+1 Napa Extra, 5% Seclo Slab</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#025540] flex items-center justify-center border border-[#10b981]/30">
            <Sparkles className="w-5 h-5 text-[#34d399]" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-[#6ee7b7] gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
          <span>Auto-calculated bonus on checkout</span>
        </div>
      </div>

      {/* 4. Near-Expiry FIFO Watchlist */}
      <div className="glass-card rounded-xl p-4 border border-[#047857]/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
              Near-Expiry Watchlist
            </p>
            <h3 className="text-2xl font-bold text-amber-300 mt-1 font-mono">
              {nearExpiryBatches.length}{" "}
              <span className="text-xs font-normal text-emerald-200/80">batches</span>
            </h3>
            <p className="text-[11px] text-emerald-200/60 mt-1">Expiring within 90 days</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-950/40 flex items-center justify-center border border-amber-500/30">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-amber-300 gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Priority FIFO dispatch forced</span>
        </div>
      </div>
    </div>
  );
};
