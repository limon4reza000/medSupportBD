"use client";

import React, { useState, useEffect } from "react";
import { IGenericAlternativesResponse, IMedicine, PackagingUnit } from "@/types/domain";
import { Pill, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
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
      <div className="glass-panel bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#025540] flex items-center justify-center shadow-md">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Out-of-Stock Generic Alternative & Substitution Engine
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              When a requested medicine is out of stock or low in warehouse inventory, instantly discover exact chemical generics and matching dosages with verified therapeutic bioequivalence ratings.
            </p>
          </div>

          {/* Medicine Selector */}
          <div className="flex items-center space-x-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-bold">Select Target SKU:</span>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer pr-2"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-slate-900">
                  {m.brandName} ({m.genericName})
                </option>
              ))}
            </select>
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
          {error}
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          {/* Target Medicine Status Box */}
          <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Requested Medicine</span>
              <h3 className="text-base font-bold text-slate-900">{data.requested_brand_name} ({data.strength})</h3>
              <p className="text-slate-600 font-semibold">Active Chemical: {data.generic_name}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  data.requested_out_of_stock
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {data.requested_out_of_stock ? "Low Stock / Near Stockout" : "Adequate Warehouse Stock"}
              </span>
            </div>
          </div>

          {/* Substitutes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alternatives.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-md">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                <p className="text-sm font-bold text-slate-700">No alternate generics currently registered</p>
                <p className="text-xs text-slate-500 mt-1">Check supplier catalogs for other brands.</p>
              </div>
            ) : (
              data.alternatives.map((alt) => (
                <div
                  key={alt.medicine_id}
                  className="glass-card bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-md flex flex-col justify-between hover:border-[#025540] transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{alt.brand_name}</h3>
                        <p className="text-xs text-slate-600 font-semibold">{alt.generic_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                          {alt.manufacturer}
                        </p>
                      </div>

                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        {alt.available_loose_units.toLocaleString()} Pcs Available
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5 text-slate-800">
                      <div className="flex justify-between">
                        <span>Trade Price:</span>
                        <strong className="text-slate-900 font-bold">৳{alt.trade_price_per_piece}/pc</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Price Variance:</span>
                        <span className={alt.price_difference_percent <= 0 ? "text-[#025540] font-bold" : "text-amber-700 font-bold"}>
                          {alt.price_difference_percent > 0 ? `+${alt.price_difference_percent}%` : `${alt.price_difference_percent}%`}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-700 font-sans flex items-center gap-1 font-semibold">
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
                    className="w-full py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
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
