"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tag,
  Gift,
  Percent,
  Calendar,
  ArrowRight,
  Boxes,
  Plus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function TradeOffersPage() {
  const router = useRouter();
  const { offers, medicines, addToCart } = useApp();

  const handleApplyOffer = (offer: any) => {
    const med = medicines.find((m) => m.id === offer.medicineId);
    if (med) {
      addToCart({
        medicineId: med.id,
        orderedUnit: offer.qualifyingUnit,
        orderedQty: offer.minQualifyingQty,
      });
      router.push("/cart");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-400" />
            <span>Active Manufacturer Trade Schemes & Bonuses</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Dynamic quantity volume offers (10+1 FREE), tiered slab discounts, and bonus pieces.
          </p>
        </div>

        <Link
          href="/products"
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Boxes className="w-4 h-4" />
          <span>Browse All Medicines</span>
        </Link>
      </div>

      {/* Trade Offers Grid (Pure White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map((offer) => {
          const med = medicines.find((m) => m.id === offer.medicineId);
          const isFreeBoxScheme = offer.schemeType === "BUY_X_GET_Y_FREE";

          return (
            <div
              key={offer.id}
              className="premium-card p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    {offer.schemeType.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    Active
                  </span>
                </div>

                <h2 className="text-base font-black text-slate-900 mt-3 leading-snug">
                  {offer.title}
                </h2>

                {med && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Qualifying Product:</span>
                      <strong className="text-slate-900">{med.brandName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Generic & Strength:</span>
                      <span className="text-slate-700">{med.genericName} ({med.strength})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Minimum Quantity:</span>
                      <strong className="text-emerald-800 font-mono">
                        {offer.minQualifyingQty} {offer.qualifyingUnit}(s)
                      </strong>
                    </div>
                  </div>
                )}

                {/* Scheme Benefit Highlight */}
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-emerald-700" />
                    <span>Scheme Benefit:</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {isFreeBoxScheme
                      ? `Buy ${offer.minQualifyingQty} ${offer.qualifyingUnit}(s) and receive ${offer.bonusQty} ${offer.bonusUnit} 100% FREE. Bonus stock is auto-deducted from warehouse.`
                      : offer.discountPercent
                      ? `Get ${offer.discountPercent}% instant cash trade discount applied on order subtotal.`
                      : `Receive ${offer.bonusQty} bonus loose pieces.`}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Valid till: {typeof offer.endDate === "string" ? offer.endDate : "2026-10-31"}</span>
                </div>

                <button
                  onClick={() => handleApplyOffer(offer)}
                  className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
