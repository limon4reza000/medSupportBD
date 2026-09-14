"use client";

import React, { useState, useEffect } from "react";
import { IDemandForecastResponse, IMedicine, PackagingUnit } from "@/types/domain";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
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
      <div className="glass-panel rounded-2xl p-6 border border-[#10b981]/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#025540] border border-[#10b981] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#34d399]" />
              </div>
              <h2 className="text-lg font-bold text-white">
                AI Demand Forecasting & Disease Spike Replenishment
              </h2>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              Synthesizes 30-day historical consumption velocity, monsoon disease surge indices (Dengue, Typhoid, Viral Fever), and local pharmacy demographics to automatically recommend optimal reorder quantities in Boxes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadForecast}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-[#023528] border border-[#047857]/60 text-xs font-semibold text-white hover:bg-[#025540] flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#34d399] ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Forecast</span>
            </button>

            {forecast && (
              <button
                onClick={handleOrderAllReplenishments}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#025540] hover:from-[#34d399] hover:to-[#047857] text-white font-bold text-xs shadow-md shadow-[#10b981]/20 flex items-center gap-1.5 transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                <span>One-Click Restock Cart (৳{forecast.total_recommended_investment.toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-emerald-300">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#10b981]" />
          <p className="text-sm font-semibold text-white">Running Predictive AI Models & Seasonal Coefficients...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950 border border-red-500 text-xs text-red-200">
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
                className="glass-card rounded-xl p-5 border border-[#047857]/40 flex flex-col justify-between hover:border-[#10b981]/50 transition-all space-y-4"
              >
                <div>
                  {/* Top Bar: Brand Name & Risk Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{rec.brand_name}</h3>
                      <p className="text-xs text-emerald-300/80 font-medium">{rec.generic_name}</p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        rec.risk_level === "CRITICAL_STOCKOUT"
                          ? "bg-red-950 text-red-300 border border-red-500/50"
                          : rec.risk_level === "LOW_STOCK"
                          ? "bg-amber-950 text-amber-300 border border-amber-500/50"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                      }`}
                    >
                      {rec.risk_level.replace("_", " ")}
                    </span>
                  </div>

                  {/* Seasonal Surge Multiplier Banner */}
                  {hasSpike && (
                    <div className="mt-3 p-2 rounded-lg bg-emerald-950/70 border border-[#10b981]/40 flex items-center justify-between text-[11px] text-[#6ee7b7]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-[#34d399]" />
                        Seasonal Disease Factor:
                      </span>
                      <strong className="font-mono text-[#34d399] font-bold">
                        +{Math.round((rec.seasonal_multiplier - 1) * 100)}% Surge ({rec.seasonal_multiplier}x)
                      </strong>
                    </div>
                  )}

                  {/* Trend Velocity Metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-2 bg-[#01140f] p-3 rounded-lg text-xs font-mono border border-[#047857]/30">
                    <div>
                      <span className="text-emerald-400/70 text-[10px] block font-sans">30-Day Historical</span>
                      <strong className="text-white">{rec.historical_30_day_consumption} pcs</strong>
                    </div>
                    <div>
                      <span className="text-emerald-400/70 text-[10px] block font-sans">AI Forecasted</span>
                      <strong className="text-[#34d399]">{rec.predicted_30_day_demand} pcs</strong>
                    </div>
                    <div>
                      <span className="text-emerald-400/70 text-[10px] block font-sans">Current Stock</span>
                      <strong className="text-white">{rec.current_stock_units} pcs</strong>
                    </div>
                    <div>
                      <span className="text-emerald-400/70 text-[10px] block font-sans">Safety Reserve</span>
                      <strong className="text-amber-300">{rec.safety_stock_units} pcs</strong>
                    </div>
                  </div>

                  {/* AI Rationale Text */}
                  <p className="mt-3 text-[11px] text-emerald-200/70 leading-relaxed bg-[#011e17] p-2.5 rounded-lg border border-[#047857]/20">
                    💡 <span className="text-white font-medium">{rec.ai_rationale}</span>
                  </p>
                </div>

                {/* Recommended Order Action */}
                <div className="pt-3 border-t border-[#047857]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-300/70 uppercase block font-semibold">
                      Recommended Restock
                    </span>
                    <strong className="text-base font-bold text-white font-mono">
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
                    className="px-3 py-1.5 rounded-lg bg-[#025540] hover:bg-[#047857] border border-[#10b981]/50 text-white font-bold text-xs flex items-center gap-1 transition-all"
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
