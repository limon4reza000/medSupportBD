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
  X,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/domain";
import { OverviewCards, OverviewCardsData } from "./OverviewCards";
import { RecentActivitiesStream, ActivityItem } from "./RecentActivitiesStream";
import { AnalyticsFilters } from "./AnalyticsFilters";
import {
  MonthlyPurchaseBarChart,
  CompanyDistributionChart,
  TopMedicinesRankingChart,
  SalesVsPurchaseComparisonCard,
  DynamicBarChart,
  DynamicLineChart,
} from "./DashboardCharts";

interface DashboardAnalyticsData {
  overviewCards?: OverviewCardsData;
  filters?: {
    period: string;
    analyticsType: string;
    companyId: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  barChart?: {
    title: string;
    yAxisLabel: string;
    categories: string[];
    series: { label: string; data: number[] }[];
  };
  lineChart?: {
    title: string;
    timePoints: string[];
    lines: { name: string; color: string; data: number[]; isStandby: boolean }[];
  };
  recentActivities?: ActivityItem[];

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
  onOpenAuth?: () => void;
}

export default function BusinessAnalyticsScreen({
  onBack,
  onNavigateToMap,
  onNavigateToCart,
  onOpenAuth,
}: BusinessAnalyticsScreenProps) {
  const { user, token, loginWithOtp } = useAuth();
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [selectedType, setSelectedType] = useState("purchase");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState("2026-11-01");
  const [customEnd, setCustomEnd] = useState("2026-11-12");

  // Modals & Drawers
  const [activeCardModal, setActiveCardModal] = useState<"purchase" | "sales" | "balance" | null>(null);
  const [isReorderDrawerOpen, setIsReorderDrawerOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/dashboard/analytics?period=${selectedPeriod}&type=${selectedType}&companyId=${encodeURIComponent(selectedCompany)}`;
      if (selectedPeriod === "custom") {
        url += `&startDate=${customStart}T00:00:00Z&endDate=${customEnd}T23:59:59Z`;
      }
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("medgo_session_token") : null);
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch(url, { credentials: "include", headers });
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
  }, [selectedPeriod, selectedType, selectedCompany, customStart, customEnd, token]);

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await loginWithOtp("01711409821", "531472", UserRole.PHARMACY_OWNER);
      if (res.success) {
        fetchAnalytics();
      } else {
        setError(res.error || "Demo login failed.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-slate-200" />
              ))}
            </div>
            <div className="h-28 bg-white rounded-xl animate-pulse border border-slate-200" />
            <div className="h-44 bg-white rounded-xl animate-pulse border border-slate-200" />
          </div>
        )}

        {/* Error / Auth Required State */}
        {error && (
          error.toLowerCase().includes("authentication") || error.toLowerCase().includes("sign in") ? (
            <div className="bg-white border border-teal-200/90 rounded-2xl p-5 shadow-sm space-y-4 text-center my-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-[#139485]">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Pharmacy Owner Authentication Required
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Access to sensitive wholesale procurement figures, credit limits, and expiry risk intelligence requires an authenticated session.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-w-xs mx-auto">
                <button
                  onClick={handleQuickDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#139485] hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>1-Click Demo Login as Dr. Rafiqul Islam</span>
                </button>

                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Sign In with Phone OTP
                  </button>
                )}
              </div>
            </div>
          ) : (
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
          )
        )}

        {data && (
          <>
            {/* Privacy Shield Active Banner if Masked */}
            {isMasked && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold">Privacy Shield Active:</span> Financial metrics are masked for counter staff role. Log in as Pharmacy Owner to view balances.
                </div>
              </div>
            )}

            {/* =========================================================================
                TIER 1: FOUR OVERVIEW CARDS
                ========================================================================= */}
            <OverviewCards
              cards={data.overviewCards}
              isMasked={isMasked}
              onCardClick={(cardType) => {
                if (cardType === "inventory") {
                  setIsReorderDrawerOpen(true);
                } else {
                  setActiveCardModal(cardType);
                }
              }}
            />

            {/* =========================================================================
                TIER 2: ANALYTICS FILTERS
                ========================================================================= */}
            <AnalyticsFilters
              selectedPeriod={selectedPeriod}
              onSelectPeriod={setSelectedPeriod}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
              periodLabel={data?.filters?.label || data?.filter?.label}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
              onResetFilters={() => {
                setSelectedPeriod("monthly");
                setSelectedType("purchase");
                setSelectedCompany("all");
              }}
            />

            {/* =========================================================================
                TIER 3: BAR CHART — BUSINESS ANALYTICS
                ========================================================================= */}
            <DynamicBarChart chart={data.barChart} isMasked={isMasked} isLoading={loading} />

            {/* =========================================================================
                TIER 4: LINE CHART — BUSINESS PERFORMANCE TRENDS
                ========================================================================= */}
            <DynamicLineChart chart={data.lineChart} isMasked={isMasked} isLoading={loading} />

            {/* =========================================================================
                TIER 5: RECENT ACTIVITIES
                ========================================================================= */}
            <RecentActivitiesStream activities={data.recentActivities} isMasked={isMasked} />
          </>
        )}
      </div>

      {/* Card Detail Modals */}
      {activeCardModal === "purchase" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Total Purchase Summary</h3>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                <span className="text-[10px] text-teal-700 font-semibold uppercase">
                  {data?.overviewCards?.totalPurchase.periodLabel} Procurement
                </span>
                <div className="text-xl font-bold text-teal-900">
                  {isMasked ? "••••••" : `৳${(data?.overviewCards?.totalPurchase.amount ?? 0).toLocaleString()}`}
                </div>
                <p className="text-[11px] text-teal-700">{data?.overviewCards?.totalPurchase.summary}</p>
              </div>
              {data?.overviewCards?.totalPurchase.totalYear !== undefined && (
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg text-slate-700">
                  <span>Year-to-Date (YTD) Spend:</span>
                  <span className="font-bold text-slate-900">
                    {isMasked ? "••••••" : `৳${(data?.overviewCards?.totalPurchase.totalYear ?? 0).toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-2 pt-2">
              {onNavigateToCart && (
                <button
                  onClick={() => {
                    setActiveCardModal(null);
                    onNavigateToCart();
                  }}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Place New Order
                </button>
              )}
              <button
                onClick={() => setActiveCardModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCardModal === "sales" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Retail Sales Integration</h3>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-blue-700 font-semibold uppercase">Status</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    POS Standby
                  </span>
                </div>
                <p className="text-[11px] text-blue-900 font-medium mt-1">
                  Retail counter dispensing activates when customer sales are logged at the counter terminal.
                </p>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                In Phase 1, wholesale procurement, digital ledger reconciliation, and FEFO inventory tracking are live. As counter sales occur, daily sales, profit margins, and top selling rankings will automatically appear here.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveCardModal(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCardModal === "balance" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Outstanding Balance & Credit</h3>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-700 font-semibold uppercase">Outstanding Due</span>
                <div className="text-xl font-bold text-amber-900">
                  {isMasked ? "••••••" : `৳${(data?.overviewCards?.outstandingBalance.amount ?? 0).toLocaleString()}`}
                </div>
                <p className="text-[11px] text-amber-700">{data?.overviewCards?.outstandingBalance.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-medium">Credit Limit</span>
                  <span className="font-bold text-slate-800">
                    {isMasked ? "••••••" : `৳${(data?.overviewCards?.outstandingBalance.creditLimit ?? 0).toLocaleString()}`}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-medium">Pending Invoices</span>
                  <span className="font-bold text-slate-800">
                    {data?.overviewCards?.outstandingBalance.pendingInvoicesCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveCardModal(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

              {new Date(customStart) > new Date(customEnd) ? (
                <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  ⚠️ Start date cannot be after end date.
                </p>
              ) : new Date(customEnd).getTime() - new Date(customStart).getTime() > 365 * 24 * 60 * 60 * 1000 ? (
                <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  ⚠️ Date range query cannot exceed 365 days.
                </p>
              ) : null}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                disabled={
                  new Date(customStart) > new Date(customEnd) ||
                  new Date(customEnd).getTime() - new Date(customStart).getTime() > 365 * 24 * 60 * 60 * 1000
                }
                onClick={() => {
                  setIsCustomModalOpen(false);
                  fetchAnalytics();
                }}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
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
