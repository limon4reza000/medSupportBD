"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Package,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export const SearchCommand: React.FC = () => {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    medicines,
    batches,
    offers,
    addToCart,
    setIsQuickOrderOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
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
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      med.brandName.toLowerCase().includes(q) ||
      med.genericName.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q) ||
      med.strength.toLowerCase().includes(q) ||
      med.code.toLowerCase().includes(q) ||
      med.dosageForm.toLowerCase().includes(q)
    );
  });

  const handleQuickAdd = (medicineId: string, unit: PackagingUnit) => {
    addToCart({ medicineId, orderedUnit: unit, orderedQty: 1 });
    setAddedItemMap((prev) => ({ ...prev, [medicineId]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [medicineId]: false }));
    }, 1500);
  };

  const handleNavigate = (path: string) => {
    setIsSearchOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Main Dialog Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-emerald-700 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search medicines, generics, brands, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12">
              <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching medicines found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by generic (e.g. Paracetamol) or dosage form (e.g. Tablet)</p>
            </div>
          ) : (
            filteredMedicines.map((med) => {
              const medBatches = batches.filter((b) => b.medicineId === med.id);
              const totalStockPieces = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
              const activeOffer = offers.find((o) => o.medicineId === med.id && o.isActive);
              const boxTradePrice = (med.tradePricePerPiece * med.piecesPerStrip * med.stripsPerBox).toFixed(2);
              const isAdded = !!addedItemMap[med.id];

              return (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-white hover:bg-emerald-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleNavigate(`/products/${med.id}`)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {med.brandName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {med.strength} • {med.dosageForm}
                      </span>
                      {activeOffer && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          PROMO SCHEME
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      <span className="text-slate-700 font-medium">{med.genericName}</span> — {med.manufacturer}
                    </div>

                    <div className="flex items-center gap-3 text-xs mt-1.5 text-slate-600 flex-wrap">
                      <span>Trade: <strong className="text-slate-900">৳{boxTradePrice}</strong>/Box</span>
                      <span className="text-slate-300">•</span>
                      <span className={totalStockPieces > 200 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                        Stock: {(totalStockPieces / (med.piecesPerStrip * med.stripsPerBox)).toFixed(1)} Boxes ({totalStockPieces} pcs)
                      </span>
                    </div>
                  </div>

                  {/* Actions: View Product, Add to Cart, Quick Order */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleNavigate(`/products/${med.id}`)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
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
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Matrix</span>
                    </button>

                    <button
                      onClick={() => handleQuickAdd(med.id, PackagingUnit.BOX)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-[#025540] hover:bg-[#036b51] text-white hover:scale-105 active:scale-95"
                      }`}
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
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            onClick={() => handleNavigate("/products")}
            className="hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            Explore Full Catalog <ArrowRight className="w-3 h-3" />
          </button>
          <div>
            Showing {filteredMedicines.length} of {medicines.length} items
          </div>
        </div>

      </div>
    </div>
  );
};
