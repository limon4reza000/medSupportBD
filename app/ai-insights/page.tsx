"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ShoppingCart,
  Boxes,
  Activity,
  CheckCircle2,
  Calendar,
  RotateCw,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export default function AiInsightsPage() {
  const router = useRouter();
  const { currentPharmacy, addToCart } = useApp();

  const [forecastData, setForecastData] = useState<any[]>([]);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/ai/forecast?pharmacyId=${currentPharmacy.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setForecastData(data.data.recommendations || []);
            setTotalInvestment(data.data.total_recommended_investment || 0);
          }
        }
      } catch (e) {
        console.error("Forecast fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
  }, [currentPharmacy.id]);

  const handleOrderRecommendation = (item: any) => {
    addToCart({
      medicineId: item.medicine_id,
      orderedUnit: PackagingUnit.BOX,
      orderedQty: item.recommended_order_boxes,
    });
    router.push("/cart");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-300" />
            <span>AI Predictive Demand Forecaster & Reorder Assistant</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            30-day algorithmic consumption forecasting with local epidemic outbreak surge coefficients (Dengue, Monsoon Flu, Asthma).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-400/20 text-teal-200 border border-teal-300/30 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
            <span>Seasonal Surge Adjusted</span>
          </span>
        </div>
      </div>

      {/* Top Summary Cards (Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forecast Horizon</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">30 Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Historical moving average + Epidemic surge</div>
        </div>

        <div className="premium-card p-5 border-amber-300">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Stockout Risks Identified</div>
          <div className="text-2xl font-black font-mono text-amber-700 mt-1">
            {forecastData.filter((f) => f.risk_level === "CRITICAL_STOCKOUT").length} SKUs
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Immediate restock required</div>
        </div>

        <div className="premium-card p-5 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Recommended Restock Value</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            ৳{totalInvestment.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Protects 98.5% service level</div>
        </div>
      </div>

      {/* Forecast Recommendations List (Pure White Cards) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="premium-card p-12 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-700">Calculating seasonal consumption curves...</div>
          </div>
        ) : (
          forecastData.map((item, idx) => {
            const isCritical = item.risk_level === "CRITICAL_STOCKOUT";
            const isLow = item.risk_level === "LOW_STOCK";

            return (
              <div
                key={idx}
                className="premium-card p-5 transition-all hover:border-emerald-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-base text-slate-900">{item.brand_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {item.dosage_form}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCritical
                        ? "bg-rose-100 text-rose-800 animate-pulse"
                        : isLow
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {item.risk_level.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-bold text-teal-800 font-mono bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Multiplier: {item.seasonal_multiplier}x
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Chemical Generic: <strong className="text-slate-800">{item.generic_name}</strong>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-900">AI Rationale:</strong> {item.ai_rationale}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-slate-400">30d Consumption:</div>
                      <div className="font-mono font-bold text-slate-900">{item.historical_30_day_consumption} pcs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-slate-400">Current Depot Stock:</div>
                      <div className="font-mono font-bold text-slate-900">{item.current_stock_units} pcs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-slate-400">Predicted Demand:</div>
                      <div className="font-mono font-bold text-slate-900">{item.predicted_30_day_demand} pcs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-950 font-semibold">
                      <div className="text-emerald-700">Recommended Order:</div>
                      <div className="font-mono font-bold text-emerald-900">{item.recommended_order_boxes} Boxes</div>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex flex-col items-end justify-center gap-2">
                  <button
                    onClick={() => handleOrderRecommendation(item)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Order {item.recommended_order_boxes} Boxes</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Auto-applies running trade bonuses</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
