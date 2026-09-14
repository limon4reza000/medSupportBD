"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  X,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export const QuickOrderModal: React.FC = () => {
  const router = useRouter();
  const {
    isQuickOrderOpen,
    setIsQuickOrderOpen,
    medicines,
    addToCart,
  } = useApp();

  const [quantities, setQuantities] = useState<Record<string, { qty: number; unit: PackagingUnit }>>({});
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isQuickOrderOpen) return null;

  const handleQtyChange = (medId: string, delta: number, defaultUnit: PackagingUnit = PackagingUnit.BOX) => {
    setQuantities((prev) => {
      const current = prev[medId] || { qty: 0, unit: defaultUnit };
      const nextQty = Math.max(0, current.qty + delta);
      return {
        ...prev,
        [medId]: { ...current, qty: nextQty },
      };
    });
  };

  const handleUnitChange = (medId: string, unit: PackagingUnit) => {
    setQuantities((prev) => {
      const current = prev[medId] || { qty: 1, unit: PackagingUnit.BOX };
      return {
        ...prev,
        [medId]: { ...current, unit },
      };
    });
  };

  const handleAddAllToCart = () => {
    let count = 0;
    Object.entries(quantities).forEach(([medicineId, { qty, unit }]) => {
      if (qty > 0) {
        addToCart({ medicineId, orderedUnit: unit, orderedQty: qty });
        count += qty;
      }
    });

    if (count > 0) {
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        setIsQuickOrderOpen(false);
        setQuantities({});
        router.push("/cart");
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={() => setIsQuickOrderOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#014232] to-[#025540] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-[#01382a] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight">Fast Order Matrix</h2>
              <p className="text-xs text-emerald-200/80">Batch-cut high velocity items directly into cart</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickOrderOpen(false)}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#036b51]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Matrix Table */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {medicines.map((med) => {
            const current = quantities[med.id] || { qty: 0, unit: PackagingUnit.BOX };
            const unitPrice =
              current.unit === PackagingUnit.BOX
                ? med.tradePricePerPiece * med.piecesPerStrip * med.stripsPerBox
                : current.unit === PackagingUnit.STRIP
                ? med.tradePricePerPiece * med.piecesPerStrip
                : med.tradePricePerPiece;

            const itemSubtotal = unitPrice * current.qty;

            return (
              <div
                key={med.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{med.brandName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                      {med.strength}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {med.genericName} • {med.manufacturer}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono font-medium mt-1">
                    Trade Price: ৳{unitPrice.toFixed(2)} / {current.unit}
                  </div>
                </div>

                {/* Packaging & Stepper */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Unit Selector */}
                  <select
                    value={current.unit}
                    onChange={(e) => handleUnitChange(med.id, e.target.value as PackagingUnit)}
                    className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={PackagingUnit.BOX}>Box ({med.piecesPerStrip * med.stripsPerBox} pcs)</option>
                    <option value={PackagingUnit.STRIP}>Strip ({med.piecesPerStrip} pcs)</option>
                    <option value={PackagingUnit.PIECE}>Piece (Loose)</option>
                  </select>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => handleQtyChange(med.id, -1, current.unit)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold font-mono text-slate-900">
                      {current.qty}
                    </span>
                    <button
                      onClick={() => handleQtyChange(med.id, 1, current.unit)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="w-20 text-right font-mono font-bold text-xs text-slate-900">
                    ৳{itemSubtotal.toFixed(0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Click Add to Cart to batch export all configured quantities into your active cart.
          </div>
          <button
            onClick={handleAddAllToCart}
            disabled={successMessage}
            className="px-5 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {successMessage ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Export Selected into Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
