"use client";

import React, { useState } from "react";
import {
  X,
  PackagePlus,
  PackageMinus,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Plus,
  Minus,
} from "lucide-react";
import { IPharmacyStock } from "@/types/domain";

interface StockAdjustModalProps {
  stockItem: IPharmacyStock | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  stockItem,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [actionType, setActionType] = useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");
  const [adjustQty, setAdjustQty] = useState(1);
  const [reason, setReason] = useState("Local purchase intake / manual restock");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !stockItem) return null;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const delta = actionType === "STOCK_IN" ? adjustQty : -adjustQty;

    try {
      const res = await fetch("/api/pharmacy/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: stockItem.pharmacyId,
          stockId: stockItem.id,
          quantityDelta: delta,
          movementType: actionType === "STOCK_IN" ? "MANUAL_IN" : "AUDIT_ADJUSTMENT",
          reason: notes ? `${reason} (${notes})` : reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to adjust stock.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error updating stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <form
        onSubmit={handleAdjust}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-200"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#139485] flex items-center justify-center font-bold">
              {actionType === "STOCK_IN" ? <PackagePlus className="w-4 h-4" /> : <PackageMinus className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-black text-slate-900">Adjust Physical Stockroom</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Medicine Info */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
          <div className="font-black text-slate-900">{stockItem.brandName}</div>
          <div className="text-[11px] text-slate-500">
            {stockItem.genericName} • Batch: <span className="font-mono font-bold text-slate-700">{stockItem.batchNumber}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
            <span className="text-slate-500">Current Stockroom Balance:</span>
            <span className="text-teal-800">{stockItem.quantity} Boxes</span>
          </div>
        </div>

        {/* Action Type Selector */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setActionType("STOCK_IN");
              setReason("Local purchase intake / manual restock");
            }}
            className={`py-2 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all ${
              actionType === "STOCK_IN"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Stock In (+)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActionType("STOCK_OUT");
              setReason("Damaged / broken ampoule disposal");
            }}
            className={`py-2 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all ${
              actionType === "STOCK_OUT"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Minus className="w-4 h-4" />
            <span>Stock Out (-)</span>
          </button>
        </div>

        {/* Quantity Stepper */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700">Quantity (Boxes):</span>
          <input
            type="number"
            min={1}
            max={actionType === "STOCK_OUT" ? stockItem.quantity : 500}
            value={adjustQty}
            onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
          />
        </div>

        {/* Reason Code */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700">Audit Reason Code:</span>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
          >
            {actionType === "STOCK_IN" ? (
              <>
                <option value="Local purchase intake / manual restock">Local purchase intake / manual restock</option>
                <option value="Physical audit inventory surplus reconcile">Physical audit inventory surplus reconcile</option>
                <option value="Customer retail return intake">Customer retail return intake</option>
              </>
            ) : (
              <>
                <option value="Damaged / broken ampoule disposal">Damaged / broken ampoule disposal</option>
                <option value="Expired batch quarantined disposal">Expired batch quarantined disposal</option>
                <option value="Internal hospital / clinic dispense">Internal hospital / clinic dispense</option>
                <option value="Physical inventory audit discrepancy shortage">Physical inventory audit discrepancy shortage</option>
              </>
            )}
          </select>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || adjustQty <= 0}
          className={`w-full py-3 rounded-2xl text-white text-xs font-black shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
            actionType === "STOCK_IN"
              ? "bg-[#139485] hover:bg-teal-700"
              : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>
              Confirm {actionType === "STOCK_IN" ? "Addition of" : "Deduction of"} {adjustQty} Boxes
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
