"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ShoppingCart,
  Zap,
  Sparkles,
  TrendingUp,
  Tag,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Layers,
  Plus,
  Boxes,
  Eye,
  Clock,
  DollarSign,
  AlertCircle,
  Truck,
  FileBarChart2,
  Briefcase,
  Users,
  Loader2,
  X,
  Database,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit, IMedicine } from "@/types/domain";

export default function HomePage() {
  const router = useRouter();
  const {
    medicines,
    batches,
    offers,
    currentPharmacy,
    addToCart,
    setIsSearchOpen,
    setIsQuickOrderOpen,
  } = useApp();

  const availableCredit = Math.max(0, currentPharmacy.creditLimit - currentPharmacy.currentBalance);
  const creditUtilizationPercent = Math.min(
    100,
    Math.round((currentPharmacy.currentBalance / currentPharmacy.creditLimit) * 100)
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // 41,000+ Medicine Catalog Dynamic State
  const [catalogMedicines, setCatalogMedicines] = useState<IMedicine[]>([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(41302);
  const [catalogFilteredTotal, setCatalogFilteredTotal] = useState(41302);
  const [catalogHasMore, setCatalogHasMore] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoadingMore, setCatalogLoadingMore] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [debouncedCatalogSearch, setDebouncedCatalogSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCatalogSearch(catalogSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogSearch]);

  const categories = [
    { id: "ALL", label: "All Catalog Medicines (41k+)" },
    { id: "TABLET", label: "Tablets" },
    { id: "CAPSULE", label: "Capsules" },
    { id: "INJECTION", label: "Injections" },
    { id: "SYRUP", label: "Syrups" },
    { id: "ANTIBIOTIC", label: "Antibiotics" },
    { id: "PPI", label: "Gastric & PPI" },
    { id: "ANALGESIC", label: "Pain & Fever" },
    { id: "ANTIHISTAMINE", label: "Allergy & Asthma" },
  ];

  const fetchCatalog = useCallback(
    async (pageNum: number, query: string, category: string, isNew: boolean = false) => {
      if (isNew) setCatalogLoading(true);
      else setCatalogLoadingMore(true);

      try {
        const params = new URLSearchParams({
          paginated: "true",
          page: String(pageNum),
          limit: "24",
        });

        if (query.trim()) {
          params.set("q", query.trim());
        }

        if (category === "TABLET" || category === "CAPSULE" || category === "INJECTION" || category === "SYRUP") {
          params.set("dosageForm", category);
        } else if (category === "ANTIBIOTIC") {
          if (!query.trim()) params.set("q", "Ciprocin");
        } else if (category === "PPI") {
          if (!query.trim()) params.set("q", "Omeprazole");
        } else if (category === "ANALGESIC") {
          if (!query.trim()) params.set("q", "Paracetamol");
        } else if (category === "ANTIHISTAMINE") {
          if (!query.trim()) params.set("q", "Montelukast");
        }

        const res = await fetch(`/api/medicines?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCatalogTotal(data.total || 41302);
          setCatalogFilteredTotal(data.totalFiltered || 0);
          setCatalogHasMore(data.hasMore ?? false);
          if (isNew) {
            setCatalogMedicines(data.medicines || []);
            setCatalogPage(1);
          } else {
            setCatalogMedicines((prev) => [...prev, ...(data.medicines || [])]);
            setCatalogPage(pageNum);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog on homepage:", err);
      } finally {
        setCatalogLoading(false);
        setCatalogLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCatalog(1, debouncedCatalogSearch, selectedCategory, true);
  }, [debouncedCatalogSearch, selectedCategory, fetchCatalog]);

  const handleLoadMore = () => {
    if (catalogHasMore && !catalogLoading && !catalogLoadingMore) {
      fetchCatalog(catalogPage + 1, debouncedCatalogSearch, selectedCategory, false);
    }
  };

  const handleQuickAdd = (med: IMedicine, unit: PackagingUnit) => {
    addToCart({ medicineId: med.id, orderedUnit: unit, orderedQty: 1, medicine: med });
    setAddedMap((prev) => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [med.id]: false }));
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* =================================================================== */}
      {/* 🟢 HERO & CREDIT HEALTH SECTION (Enterprise SaaS Redesign)          */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* =================================================================== */}
        {/* 1. HERO OPERATIONAL OVERVIEW CARD (2 Cols)                          */}
        {/* =================================================================== */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#044a40] via-[#065F52] to-[#0a7a6a] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between relative overflow-hidden text-white">
          
          {/* Subtle Ambient Background Highlights */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-300/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Info Badges */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-emerald-100 border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Authorized Pharmacy Terminal</span>
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Ordering Active</span>
              </span>

              <span className="text-xs text-emerald-100/70 font-mono font-medium ml-auto hidden sm:inline-block">
                Lic: <strong className="text-white font-semibold">{currentPharmacy.drugLicenseNo}</strong>
              </span>
            </div>

            {/* Main Welcome Heading */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-white bg-clip-text text-transparent">
                  {currentPharmacy.tradeName}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 max-w-2xl leading-relaxed font-normal">
                Manage real-time medicine procurement, near-expiry FEFO allocation, trade bonus optimization, and AI-assisted order cutting from a single platform.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <Link
              href="/pos"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white text-[#044a40] hover:bg-emerald-50 font-black text-xs shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98 group cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>Daily Sales (POS) Counter</span>
            </Link>

            <button
              onClick={() => setIsQuickOrderOpen(true)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-lg shadow-emerald-950/20 border border-emerald-400/30 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98 group cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-white group-hover:animate-bounce" />
              <span>Fast Order</span>
            </button>

            <Link
              href="/ai-order"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-950/20 border border-purple-400/30 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98 group"
            >
              <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
              <span>AI Slip Parser</span>
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span>Search Medicines</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CREDIT HEALTH CARD (FINANCIAL ERP WIDGET - 1 Col)                */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden text-slate-900">
          
          <div className="space-y-4">
            {/* Header Title & Status Badge */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-none">Credit Health</h3>
                  <span className="text-[10px] text-slate-400 font-medium">B2B Financial Headroom</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200/80 shrink-0">
                Active 30-Day Terms
              </span>
            </div>

            {/* Main Available Credit Metric */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Available Credit Headroom
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-700 mt-0.5 tracking-tight">
                ৳{availableCredit.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Premium Usage Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">
                  Used: <strong className="text-slate-900 font-bold">৳{currentPharmacy.currentBalance.toLocaleString()}</strong>
                </span>
                <span className="text-slate-500">
                  Limit: <strong className="text-slate-800">৳{currentPharmacy.creditLimit.toLocaleString()}</strong>
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full p-0.5 overflow-hidden border border-slate-200/60 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    creditUtilizationPercent > 80
                      ? "bg-gradient-to-r from-amber-500 to-rose-500"
                      : "bg-gradient-to-r from-blue-500 to-blue-700"
                  }`}
                  style={{ width: `${creditUtilizationPercent}%` }}
                />
              </div>
            </div>

            {/* Micro Financial Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase">Utilization</div>
                <div className="font-black text-slate-800 text-xs">{creditUtilizationPercent}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase">Next Due Date</div>
                <div className="font-bold text-blue-800 text-xs">18 Sep 2026</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase">Overdue Amount</div>
                <div className="font-bold text-emerald-700 text-xs">৳0.00</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase">Last Payment</div>
                <div className="font-bold text-slate-700 text-[11px] truncate">৳12,000 (05 Sep)</div>
              </div>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/credit"
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 transition-colors group"
            >
              <span>Credit Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/transactions"
              className="text-slate-500 hover:text-slate-900 font-semibold transition-colors"
            >
              Ledger Statements
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🚀 8-MODULE PHARMACY MANAGEMENT SUITE QUICK LAUNCHER               */}
      {/* =================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Integrated Pharmacy Management Systems</span>
          </span>
          <span className="text-slate-500 font-medium">8 Enterprise Modules Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              title: "Daily Sales POS",
              desc: "Fast Billing & Thermal Receipt",
              href: "/pos",
              icon: ShoppingCart,
              color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            },
            {
              title: "Medicine Stock",
              desc: "FEFO Lots & Expiry Alerts",
              href: "/inventory",
              icon: Boxes,
              color: "text-teal-700 bg-teal-50 border-teal-200",
            },
            {
              title: "Company Orders",
              desc: "Send to MR via WhatsApp",
              href: "/distributor-orders",
              icon: Truck,
              color: "text-blue-700 bg-blue-50 border-blue-200",
            },
            {
              title: "Customer Due",
              desc: "Baki Khata & SMS Reminders",
              href: "/customer-due",
              icon: CreditCard,
              color: "text-rose-700 bg-rose-50 border-rose-200",
            },
            {
              title: "Staff & Payroll",
              desc: "Attendance & Auto Deduction",
              href: "/employees",
              icon: Users,
              color: "text-indigo-700 bg-indigo-50 border-indigo-200",
            },
            {
              title: "Reports & BI",
              desc: "Sales Trends & Net Profit",
              href: "/reports",
              icon: FileBarChart2,
              color: "text-purple-700 bg-purple-50 border-purple-200",
            },
            {
              title: "Expenses",
              desc: "Rent, Electricity, OPEX",
              href: "/expenses",
              icon: DollarSign,
              color: "text-amber-700 bg-amber-50 border-amber-200",
            },
            {
              title: "MR Portal",
              desc: "Private Territory Panel",
              href: "/mr-portal",
              icon: Briefcase,
              color: "text-slate-800 bg-slate-100 border-slate-300",
            },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-2.5 ${mod.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-black text-xs text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                    {mod.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
                    {mod.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 💛 OFFER YELLOW SECTION: Trade Bonus & Volume Schemes Banner       */}
      {/* =================================================================== */}
      <div className="premium-card p-5 border-l-4 border-l-amber-500 bg-amber-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white font-bold shadow-sm">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="font-black text-sm text-slate-900 uppercase tracking-wide">
              Active Trade Bonuses & Volume Schemes
            </h2>
          </div>
          <Link
            href="/trade-offers"
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
          >
            View All ({offers.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {offers.map((offer) => {
            const med = medicines.find((m) => m.id === offer.medicineId);
            return (
              <div
                key={offer.id}
                className="p-3.5 rounded-xl border border-amber-300/80 bg-amber-100/50 hover:bg-amber-100 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300">
                      {offer.schemeType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 font-bold">Active Promo</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                    {offer.title}
                  </h3>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Applies to: <strong className="text-slate-900">{med?.brandName}</strong> ({med?.strength})
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[10px] text-amber-900 font-medium">Auto-applied in cart</span>
                  <button
                    onClick={() => {
                      if (med) {
                        addToCart({
                          medicineId: med.id,
                          orderedUnit: offer.qualifyingUnit,
                          orderedQty: offer.minQualifyingQty,
                        });
                        router.push("/cart");
                      }
                    }}
                    className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-1"
                  >
                    Apply Offer <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 💜 AI PURPLE SECTION: AI Prescription Parser & Demand Insights      */}
      {/* =================================================================== */}
      <div className="premium-card p-5 border-l-4 border-l-purple-600 bg-purple-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-purple-200 text-purple-900 border border-purple-300">
                  AI Smart Procurement Engine
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                AI Slip Parser & Demand Forecaster
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                Upload handwritten doctor prescriptions or pharmacy purchase slips to instantly convert them into FEFO-allocated orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ai-order"
              className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Upload Slip (OCR)</span>
            </Link>

            <Link
              href="/ai-insights"
              className="px-4 py-2.5 rounded-xl border border-purple-300 bg-white text-purple-900 hover:bg-purple-100 font-bold text-xs transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <span>AI Insights</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🟠 ALERT ORANGE SECTION: Near-Expiry FEFO Batch Warning            */}
      {/* =================================================================== */}
      <div className="premium-card p-5 border-l-4 border-l-orange-500 bg-orange-50/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500 text-white font-bold shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="font-black text-sm text-slate-900 uppercase tracking-wide">
              Near-Expiry FEFO Batch Priority Alerts
            </h2>
          </div>
          <Link
            href="/inventory/batches"
            className="text-xs font-bold text-orange-800 hover:text-orange-950 flex items-center gap-1"
          >
            Manage Batches <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-orange-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Napa Extra (Paracetamol)</div>
              <div className="text-[11px] text-slate-500">Batch: BN-2024-NAPA-01</div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-800 font-mono font-bold text-[10px]">
              Exp: 2026-11-30
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-orange-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Seclo 20 (Omeprazole)</div>
              <div className="text-[11px] text-slate-500">Batch: BN-2024-SEC-03</div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-800 font-mono font-bold text-[10px]">
              Exp: 2026-10-31
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-orange-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Ace Plus (Paracetamol)</div>
              <div className="text-[11px] text-slate-500">Batch: BN-2024-ACE-08</div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-800 font-mono font-bold text-[10px]">
              Exp: 2026-12-15
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🌿 MINT SECTION: FEFO Stock Availability & Catalog Marketplace     */}
      {/* =================================================================== */}
      <div className="space-y-4">
        
        {/* Filters & Live Search Header */}
        <div className="bg-white/10 p-4 rounded-3xl border border-emerald-500/20 backdrop-blur-md space-y-3">
          
          {/* Live Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-200">
                {catalogLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <Search className="w-4 h-4 text-emerald-200" />
                )}
              </div>

              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search 41,000+ medicines (e.g. Napa, Seclo, Zimax, Square)..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#01382a]/70 hover:bg-[#01382a] focus:bg-[#01382a] border border-emerald-400/30 rounded-2xl text-white placeholder:text-emerald-200/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all shadow-inner"
              />

              {catalogSearch && (
                <button
                  onClick={() => {
                    setCatalogSearch("");
                    setDebouncedCatalogSearch("");
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Catalog Full Link */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/medicines"
                className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all hover:scale-105"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-300" />
                <span>Virtualized Directory (41k)</span>
              </Link>
            </div>
          </div>

          {/* Category Pills & Live Result Count */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 border-t border-white/10">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-white text-[#01382a] shadow-md scale-105"
                      : "bg-[#014232] text-emerald-100 hover:bg-[#036b51] hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dynamic Counter */}
            <div className="text-xs text-emerald-100/90 font-semibold shrink-0">
              {debouncedCatalogSearch ? (
                <span>
                  Found <strong>{catalogFilteredTotal.toLocaleString()}</strong> results
                </span>
              ) : (
                <span>
                  Showing <strong>{catalogMedicines.length}</strong> of{" "}
                  <strong>{catalogFilteredTotal.toLocaleString()}</strong> medicines
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid (Pure White Cards Matching Screenshot) */}
        {catalogLoading && catalogMedicines.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center space-y-2 text-white">
            <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
            <div className="font-extrabold text-sm">Searching 41,000+ medicines...</div>
            <div className="text-xs text-emerald-200/80">Fetching matching products with prefix ranking</div>
          </div>
        ) : catalogMedicines.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">No medicine found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No product matched &ldquo;{debouncedCatalogSearch}&rdquo;. Try searching by generic name (e.g. Paracetamol, Omeprazole).
            </p>
            <button
              onClick={() => {
                setCatalogSearch("");
                setDebouncedCatalogSearch("");
                setSelectedCategory("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {catalogMedicines.map((med) => {
              const medBatches = batches.filter((b) => b.medicineId === med.id);
              const totalStockPieces = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
              const activeOffer = offers.find((o) => o.medicineId === med.id && o.isActive);
              const stripsPerBox = med.stripsPerBox || 10;
              const piecesPerStrip = med.piecesPerStrip || 10;
              const boxPieces = stripsPerBox * piecesPerStrip;
              const availableBoxes = totalStockPieces > 0 ? (totalStockPieces / boxPieces).toFixed(1) : "25.0";
              const displayStockPieces = totalStockPieces > 0 ? totalStockPieces : 2500;
              const boxTradePrice = (Number(med.tradePricePerPiece || 2.5) * boxPieces).toFixed(2);
              const boxMrp = (Number(med.mrpPerPiece || 3.0) * boxPieces).toFixed(2);
              const isAdded = !!addedMap[med.id];

              return (
                <div
                  key={med.id}
                  className="premium-card p-5 flex flex-col justify-between group bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-300"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        {med.dosageForm}
                      </span>
                      {displayStockPieces > 200 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Stock Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold flex items-center gap-1 border border-orange-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                        </span>
                      )}
                    </div>

                    {/* Brand & Generic Info */}
                    <div className="mt-3">
                      <Link
                        href={`/products/${med.id}`}
                        className="font-black text-base text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                      >
                        {med.brandName}
                      </Link>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">
                        {med.strength && med.strength !== "Standard" ? med.strength : "Standard Dosage"}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {med.genericName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        {med.manufacturer}
                      </div>
                    </div>

                    {/* Packaging Specification */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Box Pack:</span>
                        <strong className="text-slate-900">
                          {stripsPerBox} strips × {piecesPerStrip} pcs
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <strong className="text-emerald-700">
                          {availableBoxes} Boxes ({displayStockPieces} pcs)
                        </strong>
                      </div>
                    </div>

                    {/* Running Trade Scheme Badge */}
                    {activeOffer && (
                      <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{activeOffer.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Trade Price</div>
                        <div className="text-lg font-black font-mono text-slate-900">
                          ৳{boxTradePrice}
                          <span className="text-[10px] font-normal text-slate-500"> / Box</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">MRP</div>
                        <div className="text-xs font-bold font-mono text-slate-500 line-through">
                          ৳{boxMrp}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/products/${med.id}`}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Link>

                      <button
                        onClick={() => handleQuickAdd(med, PackagingUnit.BOX)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-[#10B981] hover:bg-[#059669] text-white hover:scale-105 active:scale-95"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+1 Box</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More (+24 Medicines) Action Button */}
        {catalogHasMore && catalogMedicines.length > 0 && (
          <div className="pt-4 flex flex-col items-center justify-center gap-2">
            <button
              onClick={handleLoadMore}
              disabled={catalogLoadingMore}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-[#044a40] font-black text-xs shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 border border-white/20 disabled:opacity-50"
            >
              {catalogLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Loading +24 More Medicines...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Load More Medicines (+24 SKUs)</span>
                </>
              )}
            </button>
            <div className="text-[11px] text-emerald-100/70 font-medium">
              Loaded {catalogMedicines.length} of {catalogFilteredTotal.toLocaleString()} available catalog medicines
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
