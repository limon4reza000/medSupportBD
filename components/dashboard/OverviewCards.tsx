"use client";

import React from "react";
import {
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Package,
} from "lucide-react";

export interface OverviewCardsData {
  totalPurchase: {
    amount: number | null;
    periodLabel: string;
    trendPercent: number | null;
    summary: string;
    totalYear?: number | null;
  };
  totalSales: {
    amount: number | null;
    isAvailable: boolean;
    periodLabel: string;
    summary: string;
  };
  outstandingBalance: {
    amount: number | null;
    creditLimit: number | null;
    utilizationPercent: number | null;
    pendingInvoicesCount: number;
    summary: string;
  };
  inventory: {
    totalStockItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    nearExpiryCount: number;
    expiredCount: number;
    summary: string;
  };
}

interface OverviewCardsProps {
  cards?: OverviewCardsData;
  isMasked?: boolean;
  onCardClick?: (cardType: "purchase" | "sales" | "balance" | "inventory") => void;
}

export function OverviewCards({
  cards,
  isMasked = false,
  onCardClick,
}: OverviewCardsProps) {
  if (!cards) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-slate-200" />
        ))}
      </div>
    );
  }

  const { totalPurchase, totalSales, outstandingBalance, inventory } = cards;

  return (
    <div className="grid grid-cols-2 gap-2" data-testid="overview-cards-container">
      {/* =========================================================================
          CARD 1: Total Purchase
          ========================================================================= */}
      <div
        onClick={() => onCardClick && onCardClick("purchase")}
        className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs relative overflow-hidden cursor-pointer hover:border-teal-400 hover:shadow-sm transition-all group flex flex-col justify-start"
        data-testid="card-total-purchase"
      >
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
            <span className="font-semibold text-slate-700">Total Purchase</span>
            <div className="w-5 h-5 rounded-md bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <ShoppingBag className="w-3 h-3" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            {isMasked ? "••••••" : `৳${(totalPurchase?.amount ?? 0).toLocaleString()}`}
          </div>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className="text-[9px] font-medium bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-100 leading-none">
              {totalPurchase?.periodLabel || "Period"}
            </span>
            {!isMasked && totalPurchase?.trendPercent !== null && totalPurchase?.trendPercent !== undefined && (
              <span
                className={`text-[9px] font-semibold inline-flex items-center leading-none ${
                  totalPurchase.trendPercent >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {totalPurchase.trendPercent >= 0 ? (
                  <TrendingUp className="w-2 h-2 mr-0.5" />
                ) : (
                  <TrendingDown className="w-2 h-2 mr-0.5" />
                )}
                {Math.abs(totalPurchase.trendPercent)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD 2: Total Sales
          ========================================================================= */}
      <div
        onClick={() => onCardClick && onCardClick("sales")}
        className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs relative overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-start"
        data-testid="card-total-sales"
      >
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
            <span className="font-semibold text-slate-700">Total Sales</span>
            <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800 tracking-tight leading-tight flex items-center space-x-1.5">
            {totalSales?.isAvailable ? (
              <span>{isMasked ? "••••••" : `৳${(totalSales.amount ?? 0).toLocaleString()}`}</span>
            ) : (
              <span className="text-slate-600 font-semibold text-xs">POS Standby</span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className="text-[9px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 leading-none">
              {totalSales?.periodLabel || "Period"}
            </span>
            <span className="text-[9px] text-slate-400 font-medium leading-none">Counter Dispensing</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD 3: Outstanding Balance
          ========================================================================= */}
      <div
        onClick={() => onCardClick && onCardClick("balance")}
        className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs relative overflow-hidden cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all group flex flex-col justify-start"
        data-testid="card-outstanding-balance"
      >
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
            <span className="font-semibold text-slate-700">Outstanding Balance</span>
            <div className="w-5 h-5 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CreditCard className="w-3 h-3" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            {isMasked ? "••••••" : `৳${(outstandingBalance?.amount ?? 0).toLocaleString()}`}
          </div>
          {/* Credit limit / utilization progress */}
          {!isMasked && (
            <div className="mt-1 space-y-0.5">
              <div className="flex justify-between text-[8.5px] text-slate-500 font-medium leading-none">
                <span>Utilized {outstandingBalance?.utilizationPercent ?? 0}%</span>
                <span>Limit ৳{((outstandingBalance?.creditLimit ?? 0) / 1000).toFixed(0)}k</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (outstandingBalance?.utilizationPercent ?? 0) > 80
                      ? "bg-rose-500"
                      : (outstandingBalance?.utilizationPercent ?? 0) > 50
                      ? "bg-amber-500"
                      : "bg-teal-500"
                  }`}
                  style={{ width: `${Math.min(100, outstandingBalance?.utilizationPercent ?? 0)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          CARD 4: Inventory
          ========================================================================= */}
      <div
        onClick={() => onCardClick && onCardClick("inventory")}
        className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs relative overflow-hidden cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all group flex flex-col justify-start"
        data-testid="card-inventory"
      >
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
            <span className="font-semibold text-slate-700">Inventory</span>
            <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Package className="w-3 h-3" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 tracking-tight leading-tight flex items-baseline space-x-1">
            <span>{(inventory?.totalStockItems ?? 0).toLocaleString()}</span>
            <span className="text-[10px] font-normal text-slate-500">Items</span>
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[9px]">
            {(inventory?.lowStockCount ?? 0) > 0 && (
              <span className="bg-amber-50 text-amber-700 px-1 py-0.5 rounded border border-amber-200 font-semibold leading-none">
                {inventory.lowStockCount} Low
              </span>
            )}
            {(inventory?.nearExpiryCount ?? 0) > 0 && (
              <span className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded border border-rose-200 font-semibold leading-none">
                {inventory.nearExpiryCount} Near Exp
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

