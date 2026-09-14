"use client";

import React, { useState, useEffect } from "react";
import { IGenericAlternativesResponse, IMedicine, PackagingUnit } from "@/types/domain";
import { Pill, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";
import { CartItem } from "./OrderCuttingTerminal";

interface GenericAlternativesFinderProps {
  medicines: IMedicine[];
  onImportToCart: (items: CartItem[]) => void;
}

export const GenericAlternativesFinder: React.FC<GenericAlternativesFinderProps> = ({
  medicines,
  onImportToCart,
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>("med-06"); // Default to Zimax 500 (low stock in seed)
  const [data, setData] = useState<IGenericAlternativesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlternatives = async (medId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai/alternatives?medicineId=${medId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load alternatives");
      } else {
        setData(json);
      }
    } catch (err: any) {
      setError(err.message || "Error fetching alternative generics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlternatives(selectedMedId);
  }, [selectedMedId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="premium-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#025540] to-[#036b51] flex items-center justify-center shadow-md">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Out-of-Stock Generic Alternative & Substitution Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
              When a requested medicine is out of stock or low in warehouse inventory, instantly discover exact chemical generics and matching dosages with verified therapeutic bioequivalence ratings.
            </p>
          </div>

          {/* Medicine Selector */}
          <div className="relative">
            <div className="flex items-center space-x-2 bg-slate-100/90 px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Target:</span>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white text-slate-900 font-medium">
                    {m.brandName} ({m.genericName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-white">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-white" />
          <p className="text-sm font-bold text-white">Finding Generic Chemical Matches & Bioequivalence...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          {/* Target Medicine Status Box */}
          <div className="premium-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-extrabold tracking-wider">Requested Medicine</span>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{data.requested_brand_name} ({data.strength})</h3>
              <p className="text-slate-500 font-medium">Active Chemical: {data.generic_name}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                  data.requested_out_of_stock
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                }`}
              >
                {data.requested_out_of_stock ? "Low Stock / Critical" : "Adequate Warehouse Stock"}
              </span>
            </div>
          </div>

          {/* Substitutes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alternatives.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 premium-card">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                <p className="text-sm font-bold text-slate-700">No alternate generics currently registered</p>
                <p className="text-xs text-slate-400 mt-1">Check supplier catalogs for other brands.</p>
              </div>
            ) : (
              data.alternatives.map((alt) => (
                <div
                  key={alt.medicine_id}
                  className="premium-card p-5 flex flex-col justify-between group space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{alt.brand_name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{alt.generic_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 tracking-wider">
                          {alt.manufacturer}
                        </p>
                      </div>

                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        {alt.available_loose_units.toLocaleString()} Pcs
                      </span>
                    </div>

                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-mono space-y-1.5 text-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trade Price:</span>
                        <strong className="text-slate-900 font-bold">৳{alt.trade_price_per_piece}/pc</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Price Variance:</span>
                        <span className={alt.price_difference_percent <= 0 ? "text-[#025540] font-black" : "text-amber-700 font-bold"}>
                          {alt.price_difference_percent > 0 ? `+${alt.price_difference_percent}%` : `${alt.price_difference_percent}%`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-700 font-sans flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#025540]" />
                        <span>{alt.bioequivalence_rating}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const med = medicines.find((m) => m.id === alt.medicine_id);
                      if (med) {
                        onImportToCart([
                          {
                            medicine: med,
                            orderedUnit: PackagingUnit.BOX,
                            orderedQty: 2,
                          },
                        ]);
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-[#025540] hover:bg-[#036b51] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
                  >
                    <span>Swap & Add to Order Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
