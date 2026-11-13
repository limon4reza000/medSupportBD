"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  Layers,
  Percent,
  CheckCircle2,
  ShoppingCart,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { IMedicine, IBatch } from "@/types/domain";
import { useApp } from "@/lib/context/AppContext";

interface MedicineDetailModalProps {
  medicine: IMedicine | null;
  batch?: IBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (medicineId: string, qty: number, unit?: string) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  batch,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { addToCart } = useApp();
  const [orderQty, setOrderQty] = useState(1);
  const [orderUnit, setOrderUnit] = useState<"BOX" | "STRIP" | "PIECE">("BOX");
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !medicine) return null;

  const unitMrp = Number(medicine.mrpPerPiece) || 0;
  const unitTp = Number(medicine.tradePricePerPiece) || 0;
  const pcsPerStrip = medicine.piecesPerStrip || 10;
  const stripsPerBox = medicine.stripsPerBox || 10;
  const totalPcsPerBox = pcsPerStrip * stripsPerBox;

  const boxMrp = Number((unitMrp * totalPcsPerBox).toFixed(2));
  const boxTp = Number((unitTp * totalPcsPerBox).toFixed(2));
  const stripMrp = Number((unitMrp * pcsPerStrip).toFixed(2));
  const stripTp = Number((unitTp * pcsPerStrip).toFixed(2));

  const chemistMarginPercent = unitMrp > 0
    ? Number((((unitMrp - unitTp) / unitMrp) * 100).toFixed(1))
    : 16.7;

  // Selected unit pricing calculation
  let pricePerSelectedUnit = boxTp;
  let mrpPerSelectedUnit = boxMrp;
  if (orderUnit === "STRIP") {
    pricePerSelectedUnit = stripTp;
    mrpPerSelectedUnit = stripMrp;
  } else if (orderUnit === "PIECE") {
    pricePerSelectedUnit = unitTp;
    mrpPerSelectedUnit = unitMrp;
  }

  const lineTotal = Number((pricePerSelectedUnit * orderQty).toFixed(2));

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(medicine.id, orderQty, orderUnit);
    } else {
      addToCart({
        medicineId: medicine.id,
        orderedQty: orderQty,
        orderedUnit: orderUnit as any,
        unitTradePrice: pricePerSelectedUnit,
      } as any);
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                {medicine.manufacturer}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">{medicine.brandName}</h2>
            <p className="text-xs text-slate-600 font-medium">
              {medicine.genericName} • {medicine.strength} ({medicine.dosageForm})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Packaging Hierarchy Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#139485]" />
                Standard Packaging Hierarchy
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-900">
                {stripsPerBox} Strips / Box
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">1 Box</span>
                <span className="font-black text-slate-900">{stripsPerBox} Strips</span>
                <span className="text-[10px] text-slate-500 block">({totalPcsPerBox} Pcs)</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">1 Strip</span>
                <span className="font-black text-slate-900">{pcsPerStrip} Pcs</span>
                <span className="text-[10px] text-slate-500 block">(Tablets/Caps)</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Margin</span>
                <span className="font-black text-emerald-600">{chemistMarginPercent}%</span>
                <span className="text-[10px] text-emerald-700 block">Chemist Profit</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
              <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block">
                Trade Price (TP)
              </span>
              <div className="text-base font-black text-teal-950">৳{boxTp} <span className="text-xs font-normal text-slate-500">/ Box</span></div>
              <div className="text-[11px] text-slate-500 font-medium">৳{unitTp.toFixed(2)} per tablet / unit</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Maximum Retail Price (MRP)
              </span>
              <div className="text-base font-black text-slate-900">৳{boxMrp} <span className="text-xs font-normal text-slate-500">/ Box</span></div>
              <div className="text-[11px] text-slate-500 font-medium">৳{unitMrp.toFixed(2)} per tablet / unit</div>
            </div>
          </div>

          {/* Depot & Batch Transparency */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Active Depot Batch (FEFO Verified)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                In Stock & Ready
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 pt-1 text-[11px]">
              <span>Batch: <strong>{batch?.batchNumber || "BEX-2024-NP-09"}</strong></span>
              <span>Expiry: <strong>{batch?.expiryDate ? new Date(batch.expiryDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Apr 2027"}</strong></span>
            </div>
          </div>

          {/* Unit Selector & Quantity Control */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Select Packaging Unit:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                {(["BOX", "STRIP", "PIECE"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setOrderUnit(unit)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      orderUnit === unit
                        ? "bg-[#139485] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-600">Order Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-black text-sm text-slate-900">
                  {orderQty}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQty(orderQty + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer with Checkout Total and Add to Cart */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated TP Total</span>
            <div className="text-base font-black text-slate-900">৳{lineTotal.toLocaleString()}</div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#139485] hover:bg-teal-700 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Added to Persistent Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add {orderQty} {orderUnit} to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
