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
      <div className="glass-panel rounded-2xl p-6 border border-[#10b981]/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#025540] border border-[#10b981] flex items-center justify-center">
                <Pill className="w-4 h-4 text-[#34d399]" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Out-of-Stock Generic Alternative & Substitution Engine
              </h2>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              When a requested medicine is out of stock or low in warehouse inventory, instantly discover exact chemical generics and matching dosages with verified therapeutic bioequivalence ratings.
            </p>
          </div>

          {/* Medicine Selector */}
          <div className="flex items-center space-x-2 bg-[#023528] px-3 py-1.5 rounded-xl border border-[#047857]/50 text-xs">
            <span className="text-emerald-300 font-semibold">Select Target SKU:</span>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-2"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#01241b] text-white">
                  {m.brandName} ({m.genericName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-emerald-300">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#10b981]" />
          <p className="text-sm font-semibold text-white">Finding Generic Chemical Matches & Bioequivalence...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950 border border-red-500 text-xs text-red-200">
          {error}
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          {/* Target Medicine Status Box */}
          <div className="p-4 rounded-xl bg-[#01140f] border border-[#047857]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-emerald-400 text-[10px] uppercase font-semibold">Requested Medicine</span>
              <h3 className="text-base font-bold text-white">{data.requested_brand_name} ({data.strength})</h3>
              <p className="text-emerald-300/80 font-medium">Active Chemical: {data.generic_name}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  data.requested_out_of_stock
                    ? "bg-red-950 text-red-300 border border-red-500/50"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                }`}
              >
                {data.requested_out_of_stock ? "Low Stock / Near Stockout" : "Adequate Warehouse Stock"}
              </span>
            </div>
          </div>

          {/* Substitutes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alternatives.length === 0 ? (
              <div className="col-span-full py-16 text-center text-emerald-300/60 glass-card rounded-2xl">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
                <p className="text-sm font-semibold text-white">No alternate generics currently registered</p>
                <p className="text-xs text-emerald-300/60 mt-1">Check supplier catalogs for other brands.</p>
              </div>
            ) : (
              data.alternatives.map((alt) => (
                <div
                  key={alt.medicine_id}
                  className="glass-card rounded-xl p-5 border border-[#047857]/40 flex flex-col justify-between hover:border-[#10b981]/50 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-white">{alt.brand_name}</h3>
                        <p className="text-xs text-emerald-300/80 font-medium">{alt.generic_name}</p>
                        <p className="text-[10px] text-emerald-400/60 uppercase font-semibold mt-0.5">
                          {alt.manufacturer}
                        </p>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                        {alt.available_loose_units.toLocaleString()} Pcs Available
                      </span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-[#01140f] border border-[#047857]/30 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between text-emerald-200">
                        <span>Trade Price:</span>
                        <strong className="text-white">৳{alt.trade_price_per_piece}/pc</strong>
                      </div>
                      <div className="flex justify-between text-emerald-200">
                        <span>Price Variance:</span>
                        <span className={alt.price_difference_percent <= 0 ? "text-[#34d399] font-bold" : "text-amber-300"}>
                          {alt.price_difference_percent > 0 ? `+${alt.price_difference_percent}%` : `${alt.price_difference_percent}%`}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-[#047857]/30 text-[10px] text-[#6ee7b7] font-sans flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#34d399]" />
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
                    className="w-full py-2 rounded-lg bg-[#025540] hover:bg-[#047857] border border-[#10b981]/50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
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
