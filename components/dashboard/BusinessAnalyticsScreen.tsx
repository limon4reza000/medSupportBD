"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
  ChevronRight,
  Filter,
  Calendar,
  Building2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Lock,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardAnalyticsData {
  filter: {
    period: string;
    startDate: string;
    endDate: string;
    companyId: string;
    label: string;
  };
  financialOverview: {
    totalPurchasePeriod: number | null;
    totalPurchaseYear: number | null;
    purchaseGrowthPercent: number | null;
    totalOutstandingBalance: number | null;
    availableCreditLimit: number | null;
    totalCreditFacility: number | null;
    creditUtilizationPercent: number | null;
    totalPaymentsPeriod: number | null;
    pendingPaymentsAmount: number | null;
    pendingInvoicesCount: number;
    maskedNotice?: string;
  };
  salesAnalytics: {
    isAvailable: boolean;
    reason: string;
    message: string;
    totalSalesPeriod: number | null;
    totalSalesYear: number | null;
    salesGrowthPercent: number | null;
    topSellingMedicines: any[];
  };
  purchaseAnalytics: {
    monthlyPurchases: { month: string; year: number; amount: number; orderCount: number }[];
    companyPurchases: { companyId: string; companyName: string; amount: number | null; percentage: number }[];
    topPurchasedMedicines: {
      medicineId: string;
      name: string;
      genericName: string;
      companyName: string;
      boxes: number;
      totalAmount: number | null;
    }[];
    momComparison: {
      currentMonthAmount: number | null;
      previousMonthAmount: number | null;
      varianceAmount: number | null;
      variancePercent: number | null;
    };
  };
  inventoryInsights: {
    totalMedicinesCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    nearExpiryCount: number;
    expiredCount: number;
    reorderSuggestions: {
      medicineId: string;
      name: string;
      companyId: string;
      currentStock: number;
      suggestedBoxes: number;
      reason: string;
    }[];
  };
  orderOverview: {
    totalOrders: number;
    byStatus: {
      SUBMITTED: number;
      ALLOCATED: number;
      PACKED: number;
      DISPATCHED: number;
      DELIVERED: number;
      CANCELLED: number;
    };
    recentDispatched: {
      orderId: string;
      companyName: string;
      challanNo: string;
      vanPlate: string;
      driverPhone: string;
      dispatchedAt: string;
    }[];
  };
  rbac: {
    role: string;
    financesMasked: boolean;
  };
}

interface BusinessAnalyticsScreenProps {
  onBack: () => void;
  onNavigateToMap?: () => void;
  onNavigateToCart?: () => void;
}

export default function BusinessAnalyticsScreen({
  onBack,
  onNavigateToMap,
  onNavigateToCart,
}: BusinessAnalyticsScreenProps) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState("2026-11-01");
  const [customEnd, setCustomEnd] = useState("2026-11-12");

  // Reorder Drawer
  const [isReorderDrawerOpen, setIsReorderDrawerOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/dashboard/analytics?period=${selectedPeriod}&companyId=${encodeURIComponent(selectedCompany)}`;
      if (selectedPeriod === "custom") {
        url += `&startDate=${customStart}T00:00:00Z&endDate=${customEnd}T23:59:59Z`;
      }
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load dashboard analytics.");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to analytics engine.");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedCompany, customStart, customEnd]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fin = data?.financialOverview;
  const inv = data?.inventoryInsights;
  const orders = data?.orderOverview;
  const purchases = data?.purchaseAnalytics;
  const isMasked = data?.rbac?.financesMasked;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      {/* 1. Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Business Analytics
              </h1>
              <p className="text-[11px] text-teal-700 font-medium truncate max-w-[220px]">
                Green Care Pharmacy &bull; DL-DHK-2022-88219
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-3 space-y-4">
        {/* 2. Interactive Period & Company Filter Bar */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Time Horizon:</span>
            </span>
            <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {data?.filter?.label || "This Month"}
            </span>
          </div>

          {/* Period Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "this_month", label: "This Month" },
              { id: "last_month", label: "Last Month" },
              { id: "this_year", label: "This Year" },
              { id: "custom", label: "Custom 📅" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === "custom") {
                    setIsCustomModalOpen(true);
                  }
                  setSelectedPeriod(p.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${
                  selectedPeriod === p.id
                    ? "bg-[#139485] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Company Filter Dropdown */}
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Licensed Companies (45)</option>
              <option value="Square">Square Pharmaceuticals PLC</option>
              <option value="Beximco">Beximco Pharmaceuticals Ltd.</option>
              <option value="Incepta">Incepta Pharmaceuticals Ltd.</option>
              <option value="Renata">Renata Limited</option>
              <option value="Opsonin">Opsonin Pharma Ltd.</option>
              <option value="Eskayef">Eskayef Pharmaceuticals Ltd.</option>
              <option value="Aristopharma">Aristopharma Ltd.</option>
              <option value="ACME">The ACME Laboratories Ltd.</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="space-y-3">
            <div className="h-28 bg-white rounded-xl animate-pulse border border-slate-200" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-white rounded-xl animate-pulse border border-slate-200" />
              <div className="h-24 bg-white rounded-xl animate-pulse border border-slate-200" />
            </div>
            <div className="h-44 bg-white rounded-xl animate-pulse border border-slate-200" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-800">Analytics Error</p>
              <p>{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-2 inline-flex items-center space-x-1 text-teal-700 font-semibold underline"
              >
                <span>Retry Query</span>
              </button>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* 3. Role-Based Privacy Masking Banner */}
            {isMasked && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold">Privacy Shield Active:</span> Financial metrics are masked for counter staff role. Log in as Pharmacy Owner to view balances.
                </div>
              </div>
            )}

            {/* 4. Financial Overview KPI Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Total Purchase */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">Total Purchase</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {isMasked ? "••••••" : `৳${fin?.totalPurchasePeriod?.toLocaleString() ?? "0"}`}
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400">
                    {isMasked ? "••••••" : `৳${fin?.totalPurchaseYear?.toLocaleString() ?? "0"} YTD`}
                  </span>
                  {!isMasked && fin?.purchaseGrowthPercent !== null && (
                    <span
                      className={`font-semibold inline-flex items-center ${
                        (fin?.purchaseGrowthPercent ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {(fin?.purchaseGrowthPercent ?? 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {Math.abs(fin?.purchaseGrowthPercent ?? 0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Total Sales (Retail) - Unlinked State */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">Retail Sales</span>
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  POS Unlinked
                </div>
                <div className="mt-1 text-[10px] text-slate-400 leading-tight">
                  Activates when counter dispensing tickets are logged
                </div>
              </div>

              {/* Card 3: Outstanding Balance */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">Outstanding Balance</span>
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {isMasked ? "••••••" : `৳${fin?.totalOutstandingBalance?.toLocaleString() ?? "0"}`}
                </div>
                {/* Credit utilization bar */}
                {!isMasked && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Utilized</span>
                      <span>{fin?.creditUtilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (fin?.creditUtilizationPercent ?? 0) > 80
                            ? "bg-rose-500"
                            : (fin?.creditUtilizationPercent ?? 0) > 50
                            ? "bg-amber-500"
                            : "bg-teal-500"
                        }`}
                        style={{ width: `${Math.min(100, fin?.creditUtilizationPercent ?? 0)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: Available Credit Limit */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">Available Credit</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-lg font-bold text-emerald-700 tracking-tight">
                  {isMasked ? "••••••" : `৳${fin?.availableCreditLimit?.toLocaleString() ?? "0"}`}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {isMasked ? "••••••" : `Limit: ৳${fin?.totalCreditFacility?.toLocaleString() ?? "0"}`}
                </div>
              </div>
            </div>

            {/* 5. Inventory Insights & Health Badges */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Inventory Health & Alerts
                  </h2>
                </div>
                <button
                  onClick={() => setIsReorderDrawerOpen(true)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center space-x-1"
                >
                  <span>Reorder Suggestions ({inv?.reorderSuggestions.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Total SKUs */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">SKUs</span>
                  <span className="text-sm font-bold text-slate-800">{inv?.totalMedicinesCount}</span>
                </div>

                {/* Low Stock */}
                <div
                  onClick={() => setIsReorderDrawerOpen(true)}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-2 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <span className="block text-amber-700 text-[10px] uppercase font-semibold">Low Stock</span>
                  <span className="text-sm font-bold text-amber-800">{inv?.lowStockCount}</span>
                </div>

                {/* Out of Stock */}
                <div
                  onClick={() => setIsReorderDrawerOpen(true)}
                  className="bg-rose-50 border border-rose-200 rounded-lg p-2 cursor-pointer hover:bg-rose-100 transition-colors"
                >
                  <span className="block text-rose-700 text-[10px] uppercase font-semibold">Out Stock</span>
                  <span className="text-sm font-bold text-rose-800">{inv?.outOfStockCount}</span>
                </div>

                {/* Near Expiry (<90d) */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <span className="block text-orange-700 text-[10px] uppercase font-semibold">&lt; 90d Exp</span>
                  <span className="text-sm font-bold text-orange-800">{inv?.nearExpiryCount}</span>
                </div>
              </div>
            </div>

            {/* 6. Order Lifecycle Pipeline */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Order Lifecycle Pipeline ({orders?.totalOrders} Total)
                  </h2>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5">
                  <span className="block text-[10px] text-slate-500">Submitted</span>
                  <span className="font-bold text-slate-800">{orders?.byStatus?.SUBMITTED ?? 0}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg py-1.5">
                  <span className="block text-[10px] text-blue-700">Allocated</span>
                  <span className="font-bold text-blue-800">{orders?.byStatus?.ALLOCATED ?? 0}</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg py-1.5">
                  <span className="block text-[10px] text-indigo-700">Packed</span>
                  <span className="font-bold text-indigo-800">{orders?.byStatus?.PACKED ?? 0}</span>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-lg py-1.5">
                  <span className="block text-[10px] text-teal-700">Dispatched</span>
                  <span className="font-bold text-teal-800">{orders?.byStatus?.DISPATCHED ?? 0}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg py-1.5">
                  <span className="block text-[10px] text-emerald-700">Delivered</span>
                  <span className="font-bold text-emerald-800">{orders?.byStatus?.DELIVERED ?? 0}</span>
                </div>
              </div>

              {/* Active Delivery Van Snapshot */}
              {orders?.recentDispatched && orders.recentDispatched.length > 0 && (
                <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      <span className="text-xs font-bold text-teal-900">
                        {orders.recentDispatched[0].companyName}
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800">
                      Van: <span className="font-mono font-medium">{orders.recentDispatched[0].vanPlate}</span> &bull; Driver: {orders.recentDispatched[0].driverPhone}
                    </p>
                    <p className="text-[10px] text-teal-600">
                      Challan: {orders.recentDispatched[0].challanNo}
                    </p>
                  </div>
                  {onNavigateToMap && (
                    <button
                      onClick={onNavigateToMap}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                    >
                      Track Van
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 7. Purchase Analytics & Top SKUs */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Top Purchased Medicines in Period
              </h2>

              <div className="divide-y divide-slate-100">
                {purchases?.topPurchasedMedicines.map((m, idx) => (
                  <div key={m.medicineId || idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 max-w-[240px]">
                      <div className="font-bold text-slate-800 truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {m.genericName} &bull; {m.companyName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">
                        {m.boxes} Boxes
                      </div>
                      <div className="text-[11px] text-teal-700 font-medium">
                        {isMasked ? "••••••" : `৳${m.totalAmount?.toLocaleString() ?? "0"}`}
                      </div>
                    </div>
                  </div>
                ))}
                {(!purchases?.topPurchasedMedicines || purchases.topPurchasedMedicines.length === 0) && (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No medicine purchase records found in selected time horizon.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reorder Suggestions Slide-Over Drawer */}
      {isReorderDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Reorder Suggestions ({inv?.reorderSuggestions.length})
                </h3>
              </div>
              <button
                onClick={() => setIsReorderDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {inv?.reorderSuggestions.map((item) => (
                <div
                  key={item.medicineId}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">Supplier: {item.companyId}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {item.reason}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-600">
                      Suggested Qty: <span className="font-bold text-teal-800">{item.suggestedBoxes} Boxes</span>
                    </span>
                    {onNavigateToCart && (
                      <button
                        onClick={() => {
                          setIsReorderDrawerOpen(false);
                          onNavigateToCart();
                        }}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setIsReorderDrawerOpen(false)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range Picker Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Custom Date Horizon</span>
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Start Date:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">End Date:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsCustomModalOpen(false);
                  fetchAnalytics();
                }}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
              >
                Apply Range
              </button>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
