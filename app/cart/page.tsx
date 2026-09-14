"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Building2,
  Boxes,
  Lock,
  RotateCw,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export default function CartPage() {
  const router = useRouter();
  const {
    currentPharmacy,
    calculatedCart,
    cartItemCount,
    cartTotalAmount,
    cartTotalBonusPieces,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    remainingCreditAfterCart,
    isCreditSufficient,
  } = useApp();

  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const availableCredit = Math.max(0, currentPharmacy.creditLimit - currentPharmacy.currentBalance);
  const totalGross = calculatedCart.reduce((acc, i) => acc + i.grossPrice, 0);
  const totalDiscount = calculatedCart.reduce((acc, i) => acc + i.discountAmount, 0);
  const totalVat = calculatedCart.reduce((acc, i) => acc + i.vatAmount, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const result = await checkout(deliveryNotes);
    setIsProcessing(false);

    if (result.success && result.order) {
      setSuccessOrder(result.order);
    } else {
      setErrorMessage(result.error || "Checkout could not be completed.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <span>Active Order Cart</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Normalized packaging quantities, calculated trade bonuses, and real-time credit gating.
          </p>
        </div>

        {calculatedCart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-200 hover:text-white flex items-center gap-1 bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-400/30 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* SUCCESS CHECKOUT MODAL / BANNER */}
      {successOrder && (
        <div className="premium-card p-6 border-emerald-400 bg-emerald-50/50 animate-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">
                  Order Successfully Placed & Batches Allocated!
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                  {successOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Authoritative MySQL transaction committed with Redis stock locking. Batch-level FEFO allocations recorded in depot dispatch queue.
              </p>
              <div className="pt-3 flex items-center gap-3">
                <Link
                  href={`/orders/${successOrder.id}`}
                  className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Order & Invoice</span>
                </Link>
                <Link
                  href="/products"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="premium-card p-4 border-rose-300 bg-rose-50/70 text-rose-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <strong>Checkout Gated:</strong> {errorMessage}
          </div>
        </div>
      )}

      {calculatedCart.length === 0 && !successOrder ? (
        <div className="premium-card p-12 text-center space-y-4">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your cart is currently empty</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Browse our pharmaceutical catalog or use the AI prescription parser to quickly populate your order.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="px-4 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md"
            >
              Browse Medicine Catalog
            </Link>
            <Link
              href="/ai-order"
              className="px-4 py-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-xs font-bold transition-all"
            >
              AI Slip Parser
            </Link>
          </div>
        </div>
      ) : calculatedCart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {calculatedCart.map((item) => (
              <div
                key={`${item.medicineId}-${item.orderedUnit}`}
                className="premium-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {item.medicine.brandName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.medicine.strength}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {item.orderedUnit}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.medicine.genericName} • {item.medicine.manufacturer}
                  </div>

                  {/* Bonus & Discount Details */}
                  <div className="flex items-center gap-3 text-xs mt-2 flex-wrap">
                    <span className="text-slate-600 font-mono">
                      {item.totalLoosePieces} loose pieces billed
                    </span>
                    {item.bonusLooseUnits > 0 && (
                      <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        +{item.bonusLooseUnits} bonus pieces FREE
                      </span>
                    )}
                    {item.discountAmount > 0 && (
                      <span className="text-emerald-700 font-semibold">
                        -{item.discountPercentage}% trade discount
                      </span>
                    )}
                  </div>
                </div>

                {/* Right controls: Stepper & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => updateCartQty(item.medicineId, item.orderedQty - 1, item.orderedUnit)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-mono font-bold text-slate-900">
                      {item.orderedQty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.medicineId, item.orderedQty + 1, item.orderedUnit)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm font-black font-mono text-slate-900">
                      ৳{item.netItemTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ৳{item.unitTradePrice.toFixed(2)}/{item.orderedUnit}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.medicineId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Delivery Instructions */}
            <div className="premium-card p-4 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Depot Dispatch & Delivery Instructions:</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Urgent morning delivery before 11 AM; deliver to Back Counter entrance."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Right Col: Financial Breakdown & Checkout Gating (Pure White Card) */}
          <div className="premium-card p-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
                Order Billing Summary
              </h2>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Item Total ({cartItemCount} units):</span>
                  <span className="font-mono font-bold text-slate-900">৳{totalGross.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Trade Schemes Discount:</span>
                    <span className="font-mono">-৳{totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {cartTotalBonusPieces > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg">
                    <span>Total Free Bonus Pieces:</span>
                    <span className="font-mono">+{cartTotalBonusPieces} pieces</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Pharma VAT:</span>
                  <span className="font-mono">৳{totalVat.toFixed(2)}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-black text-sm text-slate-900">Total Payable:</span>
                  <span className="text-2xl font-black font-mono text-emerald-800">
                    ৳{cartTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Credit Headroom Validation Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Credit Gating Audit</span>
                  </span>
                  {isCreditSufficient ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                      Exceeds Limit
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Available Credit:</span>
                    <strong className="font-mono">৳{availableCredit.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining After Order:</span>
                    <strong className={`font-mono ${remainingCreditAfterCart >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                      ৳{remainingCreditAfterCart.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isProcessing || !isCreditSufficient}
                className={`w-full py-4 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isProcessing
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : !isCreditSufficient
                    ? "bg-rose-600 text-white cursor-not-allowed opacity-90"
                    : "bg-[#025540] hover:bg-[#036b51] text-white hover:scale-105 active:scale-95"
                }`}
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Acquiring Redis Lock & Allocating Batches...</span>
                  </>
                ) : !isCreditSufficient ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Blocked: Insufficient Credit</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cut Order & Allocate FEFO Batches</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-center text-slate-400">
                Atomic Redis lock ensures zero race conditions across simultaneous pharmacy checkouts.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
