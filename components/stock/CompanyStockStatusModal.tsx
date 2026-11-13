"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Warehouse,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Building2,
  Search,
  ShoppingCart,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

interface StockStatusItem {
  id: string;
  brandName: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  stripsPerBox: number;
  piecesPerStrip: number;
  tradePricePerPiece: number;
  tradePricePerBox: number;
  availableStockBoxes: number;
  availableStockPieces: number;
  nextBatchExpiry: string;
  inStockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  activeOffer?: any;
}

interface CompanyStockStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToOrder?: (medicineId: string) => void;
  onAddToCart?: (medicineId: string, qty: number) => void;
}

const TOP_COMPANIES = [
  "ALL",
  "Square Pharmaceuticals PLC",
  "Beximco Pharmaceuticals Ltd.",
  "Incepta Pharmaceuticals Ltd.",
  "Renata Limited",
  "The ACME Laboratories Ltd.",
  "Healthcare Pharmaceuticals Ltd.",
];

export const CompanyStockStatusModal: React.FC<CompanyStockStatusModalProps> = ({
  isOpen,
  onClose,
  onSelectToOrder,
  onAddToCart,
}) => {
  const { addToCart } = useApp();
  const [items, setItems] = useState<StockStatusItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const fetchStock = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCompany !== "ALL") params.append("companyId", selectedCompany);
    if (stockFilter !== "ALL") params.append("stockFilter", stockFilter);
    if (searchQuery.trim()) params.append("query", searchQuery.trim());

    fetch(`/api/stock-status?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setItems(data.items);
        }
      })
      .catch((err) => console.error("Error fetching company stock status:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchStock();
    }
  }, [isOpen, selectedCompany, stockFilter]);

  if (!isOpen) return null;

  const handleQuickAdd = (item: StockStatusItem) => {
    if (onAddToCart) {
      onAddToCart(item.id, 5);
    } else {
      addToCart({
        medicineId: item.id,
        orderedQty: 5,
        orderedUnit: "BOX" as any,
        unitTradePrice: item.tradePricePerBox,
      } as any);
    }
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <Warehouse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Company Depot Stock Status</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 uppercase">
                  Live Depot Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">Real-time availability, FEFO batch expiry dates & warehouse stock health</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Header */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search brand, generic, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchStock()}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              />
            </div>
            <button
              type="button"
              onClick={fetchStock}
              className="px-3 py-1.5 rounded-xl bg-[#139485] text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>

          {/* Company Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Company:</span>
            {TOP_COMPANIES.map((comp) => {
              const label = comp === "ALL" ? "All Depots" : comp.split(" ")[0];
              const isSelected = selectedCompany === comp;
              return (
                <button
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-[#139485] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Stock Health Badges */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Health:</span>
            {[
              { id: "ALL", label: "All Items" },
              { id: "IN_STOCK", label: "In Stock (>15 Boxes)" },
              { id: "LOW_STOCK", label: "Low Stock (1-15 Boxes)" },
              { id: "OUT_OF_STOCK", label: "Out of Stock" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id as any)}
                className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                  stockFilter === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock List Table */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Scanning central depot warehouses...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No medicines match the selected filter</p>
              <p className="text-xs text-slate-400">Try selecting another company depot or resetting search terms.</p>
            </div>
          ) : (
            items.map((item) => {
              const isAdded = addedId === item.id;
              const isOut = item.inStockStatus === "OUT_OF_STOCK" || item.availableStockBoxes === 0;
              const isLow = item.inStockStatus === "LOW_STOCK" || (item.availableStockBoxes > 0 && item.availableStockBoxes <= 15);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-200 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {item.manufacturer}
                      </span>
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock ({item.availableStockBoxes} Boxes)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In Stock ({item.availableStockBoxes} Boxes)</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900">{item.brandName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {item.genericName} • {item.strength} ({item.dosageForm})
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>Pack: <strong>{item.stripsPerBox}×{item.piecesPerStrip}s</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Next Expiry: <strong>{item.nextBatchExpiry}</strong>
                      </span>
                      <span>•</span>
                      <span>Box TP: <strong className="text-teal-800">৳{item.tradePricePerBox}</strong></span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {!isOut ? (
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        disabled={isAdded}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-[#139485] hover:bg-teal-700 text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Order 5 Boxes</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed"
                      >
                        Stock Exhausted
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
