"use client";

import React, { useState, useEffect } from "react";
import { IDemandForecastResponse, IMedicine, PackagingUnit } from "@/types/domain";
import {
  TrendingUp,
  ArrowRight,
  RefreshCw,
  PackageCheck,
  Zap,
} from "lucide-react";
import { CartItem } from "./OrderCuttingTerminal";

interface AiDemandForecasterProps {
  medicines: IMedicine[];
  pharmacyId: string;
  onImportToCart: (items: CartItem[]) => void;
}

export const AiDemandForecaster: React.FC<AiDemandForecasterProps> = ({
  medicines,
  pharmacyId,
  onImportToCart,
}) => {
  const [forecast, setForecast] = useState<IDemandForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai/forecast?pharmacyId=${pharmacyId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load forecast data");
      } else {
        setForecast(json);
      }
    } catch (err: any) {
      setError(err.message || "Network error loading AI forecast.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [pharmacyId]);

  const handleOrderAllReplenishments = () => {
    if (!forecast) return;

    const cartItems: CartItem[] = [];

    for (const rec of forecast.recommendations) {
      if (rec.recommended_order_boxes > 0) {
        const med = medicines.find((m) => m.id === rec.medicine_id);
        if (med) {
          cartItems.push({
            medicine: med,
            orderedUnit: PackagingUnit.BOX,
            orderedQty: rec.recommended_order_boxes,
          });
        }
      }
    }

    if (cartItems.length > 0) {
      onImportToCart(cartItems);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#025540] flex items-center justify-center shadow-md">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                AI Demand Forecasting & Disease Spike Replenishment
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Synthesizes 30-day historical consumption velocity, monsoon disease surge indices (Dengue, Typhoid, Viral Fever), and local pharmacy demographics to automatically recommend optimal reorder quantities in Boxes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadForecast}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#025540] ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Forecast</span>
            </button>

            {forecast && (
              <button
                onClick={handleOrderAllReplenishments}
                className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                <span>One-Click Restock Cart (৳{forecast.total_recommended_investment.toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-white">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-white" />
          <p className="text-sm font-bold text-white">Running Predictive AI Models & Seasonal Coefficients...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
          {error}
        </div>
      )}

      {/* Recommendations Cards Grid */}
      {forecast && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.recommendations.map((rec) => {
            const hasSpike = rec.seasonal_multiplier > 1.0;

            return (
              <div
                key={rec.medicine_id}
                className="glass-card bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-md flex flex-col justify-between hover:border-[#025540] transition-all space-y-4"
              >
                <div>
                  {/* Top Bar: Brand Name & Risk Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{rec.brand_name}</h3>
                      <p className="text-xs text-slate-600 font-semibold">{rec.generic_name}</p>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        rec.risk_level === "CRITICAL_STOCKOUT"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : rec.risk_level === "LOW_STOCK"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {rec.risk_level.replace("_", " ")}
                    </span>
                  </div>

                  {/* Seasonal Surge Multiplier Banner */}
                  {hasSpike && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#025540]" />
                        Seasonal Disease Factor:
                      </span>
                      <strong className="font-mono text-[#025540] font-bold">
                        +{Math.round((rec.seasonal_multiplier - 1) * 100)}% Surge ({rec.seasonal_multiplier}x)
                      </strong>
                    </div>
                  )}

                  {/* Trend Velocity Metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs font-mono border border-slate-200 text-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-bold">30-Day Historical</span>
                      <strong className="text-slate-900 font-bold">{rec.historical_30_day_consumption} pcs</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-bold">AI Forecasted</span>
                      <strong className="text-[#025540] font-bold">{rec.predicted_30_day_demand} pcs</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-bold">Current Stock</span>
                      <strong className="text-slate-900 font-bold">{rec.current_stock_units} pcs</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-bold">Safety Reserve</span>
                      <strong className="text-amber-700 font-bold">{rec.safety_stock_units} pcs</strong>
                    </div>
                  </div>

                  {/* AI Rationale Text */}
                  <p className="mt-3 text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    💡 <span className="font-medium text-slate-900">{rec.ai_rationale}</span>
                  </p>
                </div>

                {/* Recommended Order Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">
                      Recommended Restock
                    </span>
                    <strong className="text-base font-bold text-slate-900 font-mono">
                      {rec.recommended_order_boxes} Boxes
                    </strong>
                  </div>

                  <button
                    onClick={() => {
                      const med = medicines.find((m) => m.id === rec.medicine_id);
                      if (med) {
                        onImportToCart([
                          {
                            medicine: med,
                            orderedUnit: PackagingUnit.BOX,
                            orderedQty: rec.recommended_order_boxes,
                          },
                        ]);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                  >
                    <span>Restock SKU</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
