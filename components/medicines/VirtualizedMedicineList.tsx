"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Pill,
  Building2,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Loader2,
  Package,
} from "lucide-react";
import { IMedicine, DosageForm } from "@/types/domain";
import { getMedicineTypeBadge } from "@/lib/medicineUtils";

interface VirtualizedMedicineListProps {
  medicines: IMedicine[];
  totalFiltered: number;
  totalDatabase: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onSelectMedicine?: (medicine: IMedicine) => void;
}

const ITEM_HEIGHT = 104; // Height per card in px
const OVERSCAN = 5; // Extra cards to render above/below viewport

export const VirtualizedMedicineList: React.FC<VirtualizedMedicineListProps> = ({
  medicines,
  totalFiltered,
  totalDatabase,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onSelectMedicine,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(650);

  // Measure container height on mount & resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight || 650);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Handle scroll and infinite loading trigger
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const currentScroll = containerRef.current.scrollTop;
    setScrollTop(currentScroll);

    const scrollBottom = currentScroll + containerRef.current.clientHeight;
    const threshold = medicines.length * ITEM_HEIGHT - 350;

    if (scrollBottom >= threshold && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [medicines.length, hasMore, isLoadingMore, onLoadMore]);

  // Compute virtual window range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const total = medicines.length * ITEM_HEIGHT;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const end = Math.min(
      medicines.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    return {
      startIndex: start,
      endIndex: end,
      totalHeight: total,
    };
  }, [medicines.length, scrollTop, containerHeight]);

  const visibleMedicines = useMemo(() => {
    if (medicines.length === 0) return [];
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (medicines[i]) {
        items.push({
          item: medicines[i],
          index: i,
          top: i * ITEM_HEIGHT,
        });
      }
    }
    return items;
  }, [medicines, startIndex, endIndex]);

  const getFormBadgeStyle = (form: string) => {
    const upper = form?.toUpperCase() || "";
    if (upper === "TABLET") return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (upper === "CAPSULE") return "bg-blue-50 text-blue-800 border-blue-200";
    if (upper === "INJECTION") return "bg-purple-50 text-purple-800 border-purple-200";
    if (upper === "SYRUP") return "bg-amber-50 text-amber-800 border-amber-200";
    if (upper === "SUSPENSION") return "bg-orange-50 text-orange-800 border-orange-200";
    if (upper === "DROPS") return "bg-cyan-50 text-cyan-800 border-cyan-200";
    if (upper === "OINTMENT") return "bg-rose-50 text-rose-800 border-rose-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="flex flex-col flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Scrollable Virtualized Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain relative focus:outline-none"
        style={{ minHeight: "520px", maxHeight: "72vh" }}
      >
        {/* Phantom scroll height spacer */}
        <div style={{ height: `${totalHeight}px`, position: "relative", width: "100%" }}>
          {visibleMedicines.map(({ item, index, top }) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: `${top}px`,
                left: 0,
                right: 0,
                height: `${ITEM_HEIGHT}px`,
                padding: "4px 12px",
              }}
            >
              <Link
                href={`/products/${item.id}`}
                onClick={() => onSelectMedicine?.(item)}
                className="w-full h-full bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-3 sm:px-4 sm:py-3 transition-all flex items-center justify-between gap-3 group shadow-xs hover:shadow-md cursor-pointer"
              >
                {/* Left: Brand, Generic, Company */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Icon Indicator */}
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 group-hover:bg-emerald-100/60 transition-all">
                    <Pill className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    {/* Brand Name & Form & Strength Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {item.brandName}
                      </h4>

                      {(() => {
                        const typeInfo = getMedicineTypeBadge(item);
                        return (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${typeInfo.badgeClass}`}
                          >
                            {typeInfo.label}
                          </span>
                        );
                      })()}

                      {item.strength && item.strength !== "Standard" && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.strength}
                        </span>
                      )}

                      {item.darNo && (
                        <span className="hidden md:inline-flex text-[9px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          DAR: {item.darNo}
                        </span>
                      )}
                    </div>

                    {/* Generic Name */}
                    <div className="text-xs text-slate-700 font-medium truncate flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">Generic:</span>
                      <span className="text-slate-600 truncate">{item.genericName}</span>
                    </div>

                    {/* Manufacturer */}
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{item.manufacturer}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Action */}
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 text-right">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-600 font-semibold uppercase">
                      Retail MRP
                    </div>
                    <div className="text-sm sm:text-base font-black font-mono text-slate-900">
                      ৳{Number(item.mrpPerPiece || 0).toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-600"> /pc</span>
                    </div>
                    {item.tradePricePerPiece && (
                      <div className="text-[10px] font-semibold text-emerald-800 font-mono">
                        TP: ৳{Number(item.tradePricePerPiece).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center border border-slate-200 group-hover:border-emerald-600 transition-all shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Loading More Spinner at Bottom */}
        {isLoadingMore && (
          <div className="p-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/50 border-t border-emerald-100">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading next 50 medicines from database...</span>
          </div>
        )}

        {/* End of results indicator */}
        {!hasMore && medicines.length > 0 && (
          <div className="p-4 text-center text-xs text-slate-600 font-medium border-t border-slate-100">
            ✅ All {totalFiltered.toLocaleString()} matching records loaded (from {totalDatabase.toLocaleString()} medicines).
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Loaded <strong>{medicines.length.toLocaleString()}</strong> of{" "}
            <strong>{totalFiltered.toLocaleString()}</strong> rows (50 per lazy-load)
          </span>
        </div>

        <div className="text-[11px] text-slate-600 hidden sm:block">
          Virtualized DOM: Only ~15 visible rows active in memory
        </div>
      </div>
    </div>
  );
};
