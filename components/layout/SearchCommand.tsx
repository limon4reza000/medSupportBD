"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Plus,
  Check,
  Eye,
  Tag,
  Boxes,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { IMedicine, PackagingUnit } from "@/types/domain";
import { getMedicineTypeBadge } from "@/lib/medicineUtils";

export const SearchCommand: React.FC = () => {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    batches,
    offers,
    addToCart,
    setIsQuickOrderOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [catalogMedicines, setCatalogMedicines] = useState<IMedicine[]>([]);
  const [totalFiltered, setTotalFiltered] = useState<number>(41302);
  const [totalCatalog, setTotalCatalog] = useState<number>(41302);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [isSearchOpen]);

  // Debounce search query (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch medicines from full 41,302 dataset
  const fetchMedicines = useCallback(
    async (query: string, pageNum: number, isNew: boolean) => {
      try {
        if (isNew) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = new URLSearchParams({
          paginated: "true",
          page: pageNum.toString(),
          limit: "40",
        });

        if (query.trim()) {
          params.set("q", query.trim());
        }

        const res = await fetch(`/api/medicines?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTotalCatalog(data.total || 41302);
          setTotalFiltered(data.totalFiltered ?? (data.total || 41302));
          setHasMore(data.hasMore ?? false);
          setPage(pageNum);

          if (isNew) {
            setCatalogMedicines(data.medicines || []);
          } else {
            setCatalogMedicines((prev) => [...prev, ...(data.medicines || [])]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch medicines in search modal:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Trigger search on open or debouncedQuery change
  useEffect(() => {
    if (isSearchOpen) {
      fetchMedicines(debouncedQuery, 1, true);
    }
  }, [isSearchOpen, debouncedQuery, fetchMedicines]);

  // Infinite scroll listener for results list
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 80) {
      if (hasMore && !isLoading && !isLoadingMore) {
        fetchMedicines(debouncedQuery, page + 1, false);
      }
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading && !isLoadingMore) {
      fetchMedicines(debouncedQuery, page + 1, false);
    }
  };

  if (!isSearchOpen) return null;

  const handleQuickAdd = (med: IMedicine, unit: PackagingUnit) => {
    addToCart({ medicineId: med.id, orderedUnit: unit, orderedQty: 1, medicine: med });
    setAddedItemMap((prev) => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [med.id]: false }));
    }, 1500);
  };

  const handleNavigate = (path: string) => {
    setIsSearchOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Main Dialog Container - Full Screen Desktop Search Command Center */}
      <div className="relative w-full max-w-2xl lg:max-w-[96vw] xl:max-w-[1550px] h-[94vh] bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900 flex flex-col">
        
        {/* Search Input Header */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          {isLoading ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 mr-3 shrink-0 animate-spin" />
          ) : (
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 mr-3 shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            placeholder="Search 41,000+ medicines by brand, generic, manufacturer, SKU (e.g. Napa, Paracetamol, Seclo)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base lg:text-lg text-slate-900 placeholder-slate-400 outline-none font-medium"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 mr-2 shrink-0"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 mr-3 shrink-0 text-xs text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
            <span>ESC</span>
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors ml-1 shrink-0"
            title="Close Search"
            aria-label="Close Search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 min-h-[220px]"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <div className="text-sm font-semibold">Searching 41,302 medicines across catalog...</div>
            </div>
          ) : catalogMedicines.length === 0 ? (
            <div className="text-center py-16">
              <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800">No matching medicines found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try searching by generic name (e.g. Paracetamol, Omeprazole), brand name (e.g. Napa, Seclo), or company (e.g. Square, Beximco)
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {catalogMedicines.map((med: any) => {
                const medBatches = med.batches || batches.filter((b) => b.medicineId === med.id);
                const totalStockPieces =
                  med.availableStockPieces ??
                  medBatches.reduce((acc: number, b: any) => acc + b.availableLooseUnits, 0);

                const piecesPerStrip = med.piecesPerStrip || 10;
                const stripsPerBox = med.stripsPerBox || 10;
                const boxPieces = piecesPerStrip * stripsPerBox;
                const stockBoxes = (totalStockPieces / boxPieces).toFixed(1);

                const activeOffer =
                  med.activeOffer || offers.find((o) => o.medicineId === med.id && o.isActive);

                const boxTradePrice = (
                  med.tradePricePerPiece * boxPieces
                ).toFixed(2);

                const isAdded = !!addedItemMap[med.id];

                return (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-white hover:bg-emerald-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNavigate(`/products/${med.id}`)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {med.brandName}
                        </span>
                        {(() => {
                          const typeInfo = getMedicineTypeBadge(med);
                          return (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${typeInfo.badgeClass}`}>
                              {typeInfo.label}
                            </span>
                          );
                        })()}
                        {med.strength && med.strength !== "Standard" && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {med.strength}
                          </span>
                        )}
                        {activeOffer && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            PROMO SCHEME
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        <span className="text-slate-700 font-medium">{med.genericName}</span> —{" "}
                        {med.manufacturer}
                      </div>

                      <div className="flex items-center gap-3 text-xs mt-1.5 text-slate-600 flex-wrap">
                        <span>
                          Trade: <strong className="text-slate-900">৳{boxTradePrice}</strong>/Box
                        </span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={
                            totalStockPieces > 200
                              ? "text-emerald-700 font-semibold"
                              : "text-amber-700 font-semibold"
                          }
                        >
                          Stock: {stockBoxes} Boxes ({totalStockPieces.toLocaleString()} pcs)
                        </span>
                      </div>
                    </div>

                    {/* Actions: View Product, Matrix Quick Order, Add to Cart */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleNavigate(`/products/${med.id}`)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="View Medicine Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setIsQuickOrderOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Open Quick Matrix Order"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Matrix</span>
                      </button>

                      <button
                        onClick={() => handleQuickAdd(med, PackagingUnit.BOX)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-[#025540] hover:bg-[#036b51] text-white hover:scale-105 active:scale-95"
                        }`}
                        title="Add 1 Box to Cart"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>+1 Box</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more button inside list */}
            {hasMore && (
              <div className="pt-4 pb-2 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading More Medicines...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Load More Medicines (+40 SKUs)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
        </div>

        {/* Footer info matching design */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <button
            onClick={() => handleNavigate("/medicines")}
            className="hover:text-emerald-700 font-semibold flex items-center gap-1 text-slate-700 hover:underline"
          >
            Explore Full Catalog (41k+) <ArrowRight className="w-3 h-3" />
          </button>
          <div className="font-medium text-slate-600">
            {searchQuery ? (
              <span>
                Found <strong>{totalFiltered.toLocaleString()}</strong> results (showing {catalogMedicines.length})
              </span>
            ) : (
              <span>
                Showing <strong>{catalogMedicines.length}</strong> of{" "}
                <strong>{totalFiltered.toLocaleString()}</strong> items
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
