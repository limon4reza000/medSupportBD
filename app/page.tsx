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
  Box,
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
  Check,
  LayoutGrid,
  Info,
  Calendar,
  BarChart3,
  User,
  Settings,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit, IMedicine } from "@/types/domain";
import { getMedicineTypeBadge } from "@/lib/medicineUtils";

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
      {/* 🟢 HERO & CREDIT HEALTH SECTION                                     */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* =================================================================== */}
        {/* 1. HERO OPERATIONAL OVERVIEW CARD (2 Cols)                          */}
        {/* =================================================================== */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#014232] via-[#02523e] to-[#04624b] rounded-[28px] p-6 sm:p-7 border border-emerald-500/20 shadow-xl flex flex-col justify-between relative overflow-hidden text-white">
          
          {/* Subtle Ambient Background Highlights */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-300/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Info Badges & Hero Content */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3 max-w-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#023326] text-emerald-200 border border-emerald-600/40 flex items-center gap-1.5 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3] text-emerald-400" />
                  <span>Authorized Pharmacy Terminal</span>
                </span>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#023326] text-emerald-200 border border-emerald-600/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Ordering Active</span>
                </span>

                <span className="text-xs text-emerald-200/70 font-mono font-medium ml-auto hidden sm:inline-block">
                  Lic: <strong className="text-white font-semibold">{currentPharmacy.drugLicenseNo || "DL-DHK-2022-88219"}</strong>
                </span>
              </div>

              {/* Main Welcome Heading */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Welcome back,<br />
                  <span className="text-[#34d399] font-black">
                    {currentPharmacy.tradeName || "Green Care Pharmacy"}!
                  </span>
                </h1>
                <p className="text-xs text-emerald-100/90 mt-2 max-w-md leading-relaxed font-normal">
                  Manage your pharmacy business smarter with real-time stock, near-expiry alerts, seamless procurement, trade bonuses and AI-assisted ordering — all in one powerful platform.
                </p>
              </div>

              {/* Explore All Features button */}
              <div className="pt-1">
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-emerald-50 text-xs font-black shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <span>Explore All Features</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Side: 3D Medicine Bottle Illustration */}
            <div className="relative shrink-0 flex items-center justify-center md:justify-end">
              <img
                src="/images/hero-medicine.png"
                alt="3D Medicine Protection"
                className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link
              href="/pos"
              className="p-3 rounded-2xl bg-[#00c48c]/20 hover:bg-[#00c48c]/30 border border-[#00c48c]/30 text-white transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00c48c] text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-black truncate">Daily Sales (POS)</div>
                <div className="text-[10px] text-emerald-200/80 font-medium flex items-center gap-0.5">
                  Start New Sale <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </Link>

            <button
              onClick={() => setIsQuickOrderOpen(true)}
              className="p-3 rounded-2xl bg-[#10b981]/25 hover:bg-[#10b981]/35 border border-[#10b981]/40 text-white transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-black truncate">Fast Order</div>
                <div className="text-[10px] text-emerald-200/80 font-medium flex items-center gap-0.5">
                  Create Order <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </button>

            <Link
              href="/ai-order"
              className="p-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/30 text-white transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-black truncate">AI Slip Parser</div>
                <div className="text-[10px] text-purple-200/80 font-medium flex items-center gap-0.5">
                  Upload & Process <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-700/60 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-black truncate">Search Medicines</div>
                <div className="text-[10px] text-emerald-200/80 font-medium flex items-center gap-0.5">
                  Quick Lookup <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CREDIT HEALTH CARD (Financial Headroom Widget)                   */}
        {/* =================================================================== */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden text-slate-900">
          
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
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>Available Credit Headroom</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600 mt-0.5 tracking-tight">
                ৳85,500.00
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">
                  Used: <strong className="text-slate-900 font-bold">৳34,500</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Limit: <strong className="text-slate-800">৳120,000</strong>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">29% used</span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full p-0.5 overflow-hidden border border-slate-200/60 shadow-inner">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: "29%" }}
                />
              </div>
            </div>

            {/* Micro Financial Metadata 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Credit Utilization</div>
                  <div className="font-black text-slate-800 text-xs">29%</div>
                </div>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Due Date</div>
                  <div className="font-bold text-blue-800 text-xs">18 Sep 2026</div>
                </div>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overdue Amount</div>
                  <div className="font-bold text-slate-900 text-xs">৳0.00</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Last Payment</div>
                  <div className="font-bold text-slate-800 text-[11px] truncate">৳12,000 (05 Sep)</div>
                </div>
                <CreditCard className="w-4 h-4 text-purple-400" />
              </div>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/credit"
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 transition-colors group"
            >
              <span>View Credit Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/transactions"
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 transition-colors group"
            >
              <span>Ledger Statements</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🚀 INTEGRATED PHARMACY MANAGEMENT SYSTEMS (8 Enterprise Modules)   */}
      {/* =================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                Integrated Pharmacy Management Systems
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Everything you need to run your pharmacy business, in one powerful platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              8 Enterprise Modules Active
            </span>
            <Link
              href="/settings"
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Modules</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Daily Sales POS",
              desc: "Fast billing, returns and thermal printing.",
              href: "/pos",
              btnText: "Open POS",
              image: "/images/module-pos.png",
              iconBg: "bg-emerald-500",
              cardBg: "bg-[#ebfbf3] border-[#cbf0dd] hover:border-emerald-400 hover:shadow-emerald-100/50",
              icon: ShoppingCart,
            },
            {
              title: "Medicine Stock",
              desc: "Batch tracking, expiry alerts and stock control.",
              href: "/inventory",
              btnText: "Manage Stock",
              image: "/images/module-stock.png",
              iconBg: "bg-blue-500",
              cardBg: "bg-[#edf6ff] border-[#d4e7fe] hover:border-blue-400 hover:shadow-blue-100/50",
              icon: Boxes,
            },
            {
              title: "Company Orders",
              desc: "Send orders to manufacturers via app.",
              href: "/distributor-orders",
              btnText: "Create Order",
              image: "/images/module-truck.png",
              iconBg: "bg-orange-500",
              cardBg: "bg-[#fff7ee] border-[#fedcc2] hover:border-orange-400 hover:shadow-orange-100/50",
              icon: Truck,
            },
            {
              title: "Customer Due",
              desc: "Baki khata, customer ledger & SMS alerts.",
              href: "/customer-due",
              btnText: "View Customers",
              image: "/images/module-customer.png",
              iconBg: "bg-pink-500",
              cardBg: "bg-[#fef2f6] border-[#fcd5e5] hover:border-pink-400 hover:shadow-pink-100/50",
              icon: User,
            },
            {
              title: "Staff & Payroll",
              desc: "Attendance, salary and auto payroll.",
              href: "/employees",
              btnText: "Manage Staff",
              image: "/images/module-staff.png",
              iconBg: "bg-purple-500",
              cardBg: "bg-[#f7f2fe] border-[#eddcff] hover:border-purple-400 hover:shadow-purple-100/50",
              icon: Users,
            },
            {
              title: "Reports & BI",
              desc: "Sales trends, top brands and net profit insights.",
              href: "/reports",
              btnText: "View Reports",
              image: "/images/module-reports.png",
              iconBg: "bg-cyan-500",
              cardBg: "bg-[#edf8fd] border-[#d2f0fd] hover:border-cyan-400 hover:shadow-cyan-100/50",
              icon: BarChart3,
            },
            {
              title: "Expenses",
              desc: "Rent, electricity, OPEX and full expense tracking.",
              href: "/expenses",
              btnText: "Track Expenses",
              image: "/images/module-expenses.png",
              iconBg: "bg-amber-500",
              cardBg: "bg-[#fff9ea] border-[#fef2b8] hover:border-amber-400 hover:shadow-amber-100/50",
              icon: DollarSign,
            },
            {
              title: "MR Portal",
              desc: "Private territory management for field team.",
              href: "/mr-portal",
              btnText: "Open Portal",
              image: "/images/module-mr.png",
              iconBg: "bg-blue-600",
              cardBg: "bg-[#edf6fd] border-[#d1e7fd] hover:border-blue-400 hover:shadow-blue-100/50",
              icon: Briefcase,
            },
          ].map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`${mod.cardBg} rounded-2xl p-4 border hover:shadow-lg transition-all flex items-center justify-between gap-3 group relative overflow-hidden`}
            >
              <div className="flex-1 space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${mod.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                    <mod.icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors pt-1">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  <span>{mod.btnText}</span>
                </div>
              </div>

              {/* 3D Illustration Graphic */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
                <img
                  src={mod.image}
                  alt={mod.title}
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 rounded-xl"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 💛 ACTIVE TRADE BONUSES & VOLUME SCHEMES                            */}
      {/* =================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white font-bold shadow-sm">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                Active Trade Bonuses & Volume Schemes
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Take advantage of limited-time offers and volume schemes from top manufacturers.
              </p>
            </div>
          </div>
          <Link
            href="/trade-offers"
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
          >
            <span>View All Offers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Napa Extra */}
          <div className="bg-gradient-to-br from-[#fffdf7] to-[#fff8eb] p-4 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                  BUY X GET Y FREE
                </span>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Promo
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2.5 gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Monsoon Health Surge</h3>
                  <div className="text-xs font-bold text-amber-900 mt-1 leading-snug">
                    Buy 10 Boxes Napa Extra, Get 1 Box Free
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Applies to: <span className="font-medium text-slate-700">Napa Extra (500mg + 65mg)</span>
                  </div>
                </div>
                <img
                  src="/images/trade-napa.jpg"
                  alt="Napa Extra Promo"
                  className="w-20 h-20 object-contain drop-shadow-md shrink-0 group-hover:scale-105 transition-transform rounded-xl"
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-amber-900/80 font-medium flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-amber-700" />
                Auto-applied in cart
              </span>
              <button
                onClick={() => {
                  const med = medicines.find((m) => m.brandName.toLowerCase().includes("napa")) || medicines[0];
                  addToCart({ medicineId: med.id, orderedUnit: PackagingUnit.BOX, orderedQty: 10, medicine: med });
                  router.push("/cart");
                }}
                className="font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Apply Offer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2: Seclo 20 */}
          <div className="bg-gradient-to-br from-[#fffdfa] to-[#fff3f0] p-4 rounded-2xl border border-rose-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 bg-rose-200/80 px-2.5 py-0.5 rounded-md border border-rose-300">
                  SLAB DISCOUNT
                </span>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Promo
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2.5 gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Gastric Care Volume Offer</h3>
                  <div className="text-xs font-bold text-rose-900 mt-1 leading-snug">
                    5.0% Instant Trade Discount on &gt;= 20 Strips Seclo 20
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Applies to: <span className="font-medium text-slate-700">Seclo 20 (20mg)</span>
                  </div>
                </div>
                <img
                  src="/images/trade-seclo.jpg"
                  alt="Seclo 20 Promo"
                  className="w-20 h-20 object-contain drop-shadow-md shrink-0 group-hover:scale-105 transition-transform rounded-xl"
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-rose-900/80 font-medium flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-rose-700" />
                Auto-applied in cart
              </span>
              <button
                onClick={() => {
                  const med = medicines.find((m) => m.brandName.toLowerCase().includes("seclo")) || medicines[2];
                  addToCart({ medicineId: med.id, orderedUnit: PackagingUnit.STRIP, orderedQty: 20, medicine: med });
                  router.push("/cart");
                }}
                className="font-bold text-rose-900 hover:text-rose-950 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Apply Offer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Monas 10 */}
          <div className="bg-gradient-to-br from-[#f8fdfb] to-[#edfcf5] p-4 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  BONUS RATIO
                </span>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Promo
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2.5 gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Allergy Season Bonus</h3>
                  <div className="text-xs font-bold text-emerald-900 mt-1 leading-snug">
                    5% Bonus Loose Pieces on Monas 10
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Applies to: <span className="font-medium text-slate-700">Monas 10 (10mg)</span>
                  </div>
                </div>
                <img
                  src="/images/trade-monas.jpg"
                  alt="Monas 10 Promo"
                  className="w-20 h-20 object-contain drop-shadow-md shrink-0 group-hover:scale-105 transition-transform rounded-xl"
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-900/80 font-medium flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-emerald-700" />
                Auto-applied in cart
              </span>
              <button
                onClick={() => {
                  const med = medicines.find((m) => m.brandName.toLowerCase().includes("monas")) || medicines[4];
                  addToCart({ medicineId: med.id, orderedUnit: PackagingUnit.BOX, orderedQty: 5, medicine: med });
                  router.push("/cart");
                }}
                className="font-bold text-emerald-900 hover:text-emerald-950 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Apply Offer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {catalogMedicines.map((med, index) => {
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

              const typeInfo = getMedicineTypeBadge(med);
              const productImageSrc = `/images/med-product-${(index % 8) + 1}.png`;

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-[24px] p-5 flex flex-col justify-between group border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${typeInfo.badgeClass}`}>
                        {typeInfo.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] text-[10px] font-bold flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        <span>Stock Ready</span>
                      </span>
                    </div>

                    {/* 3D Product Image Container */}
                    <div className="h-36 sm:h-40 w-full flex items-center justify-center my-1 relative overflow-hidden">
                      <img
                        src={productImageSrc}
                        alt={med.brandName}
                        className="h-full w-auto max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                      />
                    </div>

                    {/* Brand & Generic Info */}
                    <div className="mt-1">
                      <Link
                        href={`/products/${med.id}`}
                        className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug"
                        title={med.brandName}
                      >
                        {med.brandName}
                      </Link>
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        {med.strength && med.strength !== "Standard" ? med.strength : "1000 gm"}
                      </div>
                      <div className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">
                        {med.genericName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                        {med.manufacturer || "AB Life Science"}
                      </div>
                    </div>

                    {/* Packaging Specification */}
                    <div className="my-3 p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                          <span>Box Pack:</span>
                        </span>
                        <strong className="text-slate-800 font-bold">
                          {stripsPerBox} strips × {piecesPerStrip} pcs
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>Available:</span>
                        </span>
                        <strong className="text-emerald-600 font-bold">
                          {availableBoxes} Boxes ({displayStockPieces} pcs)
                        </strong>
                      </div>
                    </div>

                    {/* Running Trade Scheme Badge (if any) */}
                    {activeOffer && (
                      <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{activeOffer.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-1">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">TRADE PRICE</div>
                        <div className="text-base sm:text-lg font-black font-mono text-slate-900 leading-tight">
                          ৳{boxTradePrice}
                          <span className="text-[11px] font-normal text-slate-400 font-sans ml-1">/ Box</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">MRP</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-slate-400 line-through leading-tight">
                          ৳{boxMrp}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/products/${med.id}`}
                        className="px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:border-slate-300"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Details</span>
                      </Link>

                      <button
                        onClick={() => handleQuickAdd(med, PackagingUnit.BOX)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 ${typeInfo.btnClass}`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>+ 1 Box</span>
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
