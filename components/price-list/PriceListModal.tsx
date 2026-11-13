"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Printer,
  Download,
  Building2,
  Search,
  ShoppingCart,
  Percent,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

interface PriceItem {
  id: string;
  brandName: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  packSize: string;
  unitTradePrice: number;
  unitMrp: number;
  boxTradePrice: number;
  boxMrp: number;
  marginPercent: number;
  vatPercent: number;
}

interface PriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const PriceListModal: React.FC<PriceListModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { addToCart } = useApp();
  const [items, setItems] = useState<PriceItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const fetchPriceList = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCompany !== "ALL") params.append("companyId", selectedCompany);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());

    fetch(`/api/price-list?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.priceList)) {
          setItems(data.priceList);
        }
      })
      .catch((err) => console.error("Error fetching price list:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchPriceList();
    }
  }, [isOpen, selectedCompany]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (selectedCompany !== "ALL") params.append("companyId", selectedCompany);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());
    params.append("export", "csv");
    window.open(`/api/price-list?${params.toString()}`, "_blank");
  };

  const handleQuickAdd = (item: PriceItem) => {
    if (onAddToCart) {
      onAddToCart(item.id, 5);
    } else {
      addToCart({
        medicineId: item.id,
        orderedQty: 5,
        orderedUnit: "BOX" as any,
        unitTradePrice: item.boxTradePrice,
      } as any);
    }
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">B2B Trade Price List & Margins</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 uppercase">
                  DGDA Tariff
                </span>
              </div>
              <p className="text-xs text-slate-500">Official Maximum Retail Price (MRP), Trade Price (TP) & Chemist Margins</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Print Price List"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-[#139485] hover:bg-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by brand name, generic, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPriceList()}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              />
            </div>
            <button
              type="button"
              onClick={fetchPriceList}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
            >
              Filter
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Company:</span>
            {TOP_COMPANIES.map((comp) => {
              const label = comp === "ALL" ? "All Companies" : comp.split(" ")[0];
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
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Generating verified price list...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No items match your search criteria</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-700 font-black text-[10px] uppercase sticky top-0 border-b border-slate-200 z-10 backdrop-blur-xs">
                <tr>
                  <th className="p-3">Brand & Generic Name</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Pack Hierarchy</th>
                  <th className="p-3 text-right">Box TP</th>
                  <th className="p-3 text-right">Box MRP</th>
                  <th className="p-3 text-center">Margin</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isAdded = addedId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900 text-xs">{item.brandName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.genericName} • {item.strength} ({item.dosageForm})
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-700 font-semibold">{item.manufacturer.split(" ")[0]}</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium text-[11px]">
                        {item.packSize}
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-black text-teal-800">৳{item.boxTradePrice}</div>
                        <div className="text-[10px] text-slate-400">৳{item.unitTradePrice.toFixed(2)}/pc</div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-bold text-slate-900">৳{item.boxMrp}</div>
                        <div className="text-[10px] text-slate-400">৳{item.unitMrp.toFixed(2)}/pc</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {item.marginPercent}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item)}
                          disabled={isAdded}
                          className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all shadow-2xs active:scale-95 ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#139485] hover:bg-teal-700 text-white"
                          }`}
                        >
                          {isAdded ? "Added!" : "Order"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-between text-xs text-slate-500 px-5">
          <span>Displaying {items.length} medicines</span>
          <span>Standard Pharmaceutical VAT of 2.4% included</span>
        </div>

      </div>
    </div>
  );
};
