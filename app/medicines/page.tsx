"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Loader2,
  Package,
  Layers,
  Building2,
  Filter,
  SlidersHorizontal,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { VirtualizedMedicineList } from "@/components/medicines/VirtualizedMedicineList";
import { IMedicine } from "@/types/domain";

export default function MedicineListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState("ALL");
  const [selectedManufacturer, setSelectedManufacturer] = useState("ALL");

  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [page, setPage] = useState(1);
  const [totalDatabase, setTotalDatabase] = useState(41302);
  const [totalFiltered, setTotalFiltered] = useState(41302);
  const [hasMore, setHasMore] = useState(true);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 300ms Debounce on Search Query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch medicines from server database
  const fetchMedicines = useCallback(
    async (
      pageNum: number,
      query: string,
      form: string,
      mfg: string,
      isNewSearch: boolean = false
    ) => {
      if (isNewSearch) {
        setIsSearching(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          paginated: "true",
          page: String(pageNum),
          limit: "50",
        });

        if (query.trim()) params.set("q", query.trim());
        if (form && form !== "ALL") params.set("dosageForm", form);
        if (mfg && mfg !== "ALL") params.set("manufacturer", mfg);

        const res = await fetch(`/api/medicines?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load medicines from database");
        const data = await res.json();

        setTotalDatabase(data.total || 41302);
        setTotalFiltered(data.totalFiltered || 0);
        setHasMore(data.hasMore ?? false);

        if (isNewSearch) {
          setMedicines(data.medicines || []);
          setPage(1);
        } else {
          setMedicines((prev) => [...prev, ...(data.medicines || [])]);
          setPage(pageNum);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
      } finally {
        setIsInitialLoading(false);
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Trigger search on debounced query or filter change
  useEffect(() => {
    fetchMedicines(1, debouncedQuery, selectedForm, selectedManufacturer, true);
  }, [debouncedQuery, selectedForm, selectedManufacturer, fetchMedicines]);

  // Load next 50 rows on scroll
  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isSearching) return;
    fetchMedicines(page + 1, debouncedQuery, selectedForm, selectedManufacturer, false);
  }, [hasMore, isLoadingMore, isSearching, page, debouncedQuery, selectedForm, selectedManufacturer, fetchMedicines]);

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const dosageForms = [
    "ALL",
    "TABLET",
    "CAPSULE",
    "INJECTION",
    "SYRUP",
    "SUSPENSION",
    "DROPS",
    "OINTMENT",
  ];

  const topManufacturers = [
    "ALL",
    "Square",
    "Incepta",
    "Beximco",
    "Renata",
    "Opsonin",
    "ACI",
    "ACME",
    "Aristopharma",
    "Healthcare",
    "Popular",
    "Eskayef",
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* =================================================================== */}
      {/* 🟢 TOP HERO & DATABASE COUNTER HEADER                               */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-[#044a40] via-[#065F52] to-[#0a7a6a] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-lg text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-emerald-100 border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-xs">
                <Database className="w-3.5 h-3.5 text-emerald-300" />
                <span>DGDA Master Medicine Catalog</span>
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Indexed & Verified</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Medicine Directory (~41,000 SKUs)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
              Complete pharmaceutical price master with real-time prefix-ranked search, DGDA registration numbers, wholesale trade price (TP), and retail MRP.
            </p>
          </div>

          {/* Database Counter Stat Box */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shrink-0 flex flex-col justify-center min-w-[200px]">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
              Total Database Inventory
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
              {totalDatabase.toLocaleString()}
              <span className="text-xs font-semibold text-emerald-200 ml-1">medicines</span>
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-1 flex items-center gap-1">
              <span>Lazy loaded in 50-row chunks</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🔍 SEARCH BAR & FILTERS SECTION                                      */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, generic name, or company (e.g. Napa, Paracetamol, Square, Seclo)..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
          />

          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Result Counter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          
          {/* Quick Dosage Form Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Form:</span>
            </span>

            {dosageForms.map((form) => (
              <button
                key={form}
                onClick={() => setSelectedForm(form)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedForm === form
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {form === "ALL" ? "All Forms" : form}
              </button>
            ))}
          </div>

          {/* Company Quick Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Company:</span>
            </span>

            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              {topManufacturers.map((mfg) => (
                <option key={mfg} value={mfg}>
                  {mfg === "ALL" ? "All Companies (340+)" : mfg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Search Result Counter (Requirement 3) */}
        <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {debouncedQuery ? (
              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Found <strong>{totalFiltered.toLocaleString()}</strong> results for &ldquo;{debouncedQuery}&rdquo;{" "}
                <span className="text-slate-500 font-normal">
                  (out of {totalDatabase.toLocaleString()} medicines in database)
                </span>
              </span>
            ) : (
              <span className="text-slate-600">
                Displaying <strong>{totalFiltered.toLocaleString()}</strong> medicines in database
                {selectedForm !== "ALL" && ` · Form: ${selectedForm}`}
                {selectedManufacturer !== "ALL" && ` · Company: ${selectedManufacturer}`}
              </span>
            )}
          </div>

          {isSearching && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 📋 VIRTUALIZED LIST / LOADING / NO MEDICINES FOUND                   */}
      {/* =================================================================== */}
      {isInitialLoading ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <h3 className="font-extrabold text-slate-800 text-base">
            Connecting to Medicine Database...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Indexing 41,302 pharmaceutical records with prefix ranking and price master data.
          </p>
        </div>
      ) : medicines.length === 0 ? (
        // Requirement 5: Show "No medicine found" when there are no results
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Package className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-slate-900 text-lg">
              No medicine found
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              No pharmaceutical product matches &ldquo;<strong>{debouncedQuery || selectedForm || selectedManufacturer}</strong>&rdquo;.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 text-left max-w-md space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span>Helpful Search Tips:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-500">
              <li>Check spelling (e.g. &ldquo;Napa&rdquo;, &ldquo;Seclo&rdquo;, &ldquo;Sergel&rdquo;)</li>
              <li>Try searching generic name directly (e.g. &ldquo;Paracetamol&rdquo;, &ldquo;Omeprazole&rdquo;, &ldquo;Azithromycin&rdquo;)</li>
              <li>Search pharmaceutical manufacturer (e.g. &ldquo;Square&rdquo;, &ldquo;Beximco&rdquo;, &ldquo;Incepta&rdquo;)</li>
              <li>Reset dosage form filter to &ldquo;All Forms&rdquo;</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setDebouncedQuery("");
              setSelectedForm("ALL");
              setSelectedManufacturer("ALL");
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            Reset Filters & View All Medicines
          </button>
        </div>
      ) : (
        // Virtualized List rendering lazy-loaded 50 rows per scroll
        <VirtualizedMedicineList
          medicines={medicines}
          totalFiltered={totalFiltered}
          totalDatabase={totalDatabase}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      )}

    </div>
  );
}
