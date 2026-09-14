"use client";

import React, { useState } from "react";
import {
  IBatch,
  IMedicine,
  IPharmacy,
  ITradeOffer,
  PackagingUnit,
} from "@/types/domain";
import { PackagingEngine } from "@/services/packagingEngine";
import { BatchFifoEngine } from "@/services/batchFifoEngine";
import { CreditLedgerEngine } from "@/services/creditLedgerEngine";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Gift,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface CartItem {
  medicine: IMedicine;
  orderedUnit: PackagingUnit;
  orderedQty: number;
}

interface OrderCuttingTerminalProps {
  medicines: IMedicine[];
  batches: IBatch[];
  offers: ITradeOffer[];
  pharmacy: IPharmacy;
  onOrderSuccess: (orderData: any) => void;
  externalCartItems?: CartItem[];
  onClearExternalCart?: () => void;
}

export const OrderCuttingTerminal: React.FC<OrderCuttingTerminalProps> = ({
  medicines,
  batches,
  offers,
  pharmacy,
  onOrderSuccess,
  externalCartItems = [],
  onClearExternalCart,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartItem[]>(externalCartItems);
  const [selectedUnits, setSelectedUnits] = useState<Record<string, PackagingUnit>>({});
  const [inputQuantities, setInputQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync external items (e.g. from AI Slip Parser or Demand Forecast)
  React.useEffect(() => {
    if (externalCartItems.length > 0) {
      setCart(externalCartItems);
      if (onClearExternalCart) onClearExternalCart();
    }
  }, [externalCartItems, onClearExternalCart]);

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedCategory === "ALL") return matchesSearch;
    return matchesSearch && m.dosageForm === selectedCategory;
  });

  const getUnit = (medId: string): PackagingUnit => {
    return selectedUnits[medId] || PackagingUnit.BOX;
  };

  const getQty = (medId: string): number => {
    return inputQuantities[medId] || 1;
  };

  const handleUnitChange = (medId: string, unit: PackagingUnit) => {
    setSelectedUnits((prev) => ({ ...prev, [medId]: unit }));
  };

  const handleQtyChange = (medId: string, delta: number) => {
    setInputQuantities((prev) => {
      const current = prev[medId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [medId]: next };
    });
  };

  const addToCart = (medicine: IMedicine) => {
    const unit = getUnit(medicine.id);
    const qty = getQty(medicine.id);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.medicine.id === medicine.id && item.orderedUnit === unit
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].orderedQty += qty;
        return updated;
      }
      return [...prev, { medicine, orderedUnit: unit, orderedQty: qty }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const nextQty = updated[index].orderedQty + delta;
      if (nextQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index].orderedQty = nextQty;
      return updated;
    });
  };

  // Evaluate cart financial totals & trade bonuses
  const calculatedCartItems = cart.map((item) => {
    const activeOffer = offers.find((o) => o.medicineId === item.medicine.id && o.isActive);
    const tradeResult = PackagingEngine.evaluateTradeAndBonus(
      item.medicine,
      item.orderedUnit,
      item.orderedQty,
      activeOffer
    );

    // Get FIFO batch preview
    const medBatches = batches.filter((b) => b.medicineId === item.medicine.id);
    const totalLooseRequired = tradeResult.looseUnitsBilled + tradeResult.bonusLooseUnits;
    const fifoResult = BatchFifoEngine.allocateFifoStock(
      item.medicine.id,
      item.medicine.brandName,
      medBatches,
      totalLooseRequired
    );

    return {
      ...item,
      activeOffer,
      tradeResult,
      fifoResult,
    };
  });

  const cartGross = calculatedCartItems.reduce((sum, i) => sum + i.tradeResult.grossPrice, 0);
  const cartDiscount = calculatedCartItems.reduce((sum, i) => sum + i.tradeResult.discountAmount, 0);
  const cartVat = calculatedCartItems.reduce((sum, i) => sum + i.tradeResult.vatAmount, 0);
  const cartNetTotal = calculatedCartItems.reduce((sum, i) => sum + i.tradeResult.netItemTotal, 0);
  const totalBilledPieces = calculatedCartItems.reduce((sum, i) => sum + i.tradeResult.looseUnitsBilled, 0);
  const totalBonusPieces = calculatedCartItems.reduce((sum, i) => sum + i.tradeResult.bonusLooseUnits, 0);

  // Credit Safety check
  const creditAudit = CreditLedgerEngine.auditPharmacyCredit(
    pharmacy,
    cartNetTotal,
    "2026-08-20"
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        pharmacyId: pharmacy.id,
        depotId: "depot-dhk-01",
        salesRepId: "user-sr-01",
        items: cart.map((c) => ({
          medicineId: c.medicine.id,
          orderedUnit: c.orderedUnit,
          orderedQty: c.orderedQty,
        })),
        deliveryNotes: "Urgent Express Delivery via MedSupply Cold-Chain Van",
      };

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.details || json.error || "Failed to cut order");
      } else {
        setOrderReceipt(json.data);
        setCart([]);
        onOrderSuccess(json.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#047857]/50">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Brand (Napa, Seclo), Generic, or Manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#011b14] border border-[#047857]/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-[#10b981] transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {["ALL", "TABLET", "CAPSULE", "SYRUP", "INJECTION"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#025540] text-white border border-[#10b981] font-bold"
                  : "bg-[#01241b] text-emerald-200/70 border border-[#047857]/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Catalog Left (60%) vs Live Cart Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#34d399]" />
              Medicine Catalog ({filteredMedicines.length} Products Available)
            </h2>
            <span className="text-xs text-emerald-300/70">Prices exclusive of standard 2.4% VAT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicines.map((med) => {
              const medBatches = batches.filter((b) => b.medicineId === med.id);
              const availableStock = BatchFifoEngine.getTotalAvailableStock(medBatches);
              const activeOffer = offers.find((o) => o.medicineId === med.id && o.isActive);
              const selectedUnit = getUnit(med.id);
              const selectedQty = getQty(med.id);

              const piecesPerBox = med.piecesPerStrip * med.stripsPerBox;
              const unitLooseEquivalent =
                selectedUnit === PackagingUnit.BOX
                  ? piecesPerBox
                  : selectedUnit === PackagingUnit.STRIP
                  ? med.piecesPerStrip
                  : 1;

              const totalPiecesRequested = selectedQty * unitLooseEquivalent;

              return (
                <div
                  key={med.id}
                  className="glass-card rounded-xl p-4 border border-[#047857]/40 flex flex-col justify-between hover:border-[#10b981]/50 transition-all duration-200"
                >
                  <div>
                    {/* Brand Name & Active Offer Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                          {med.brandName}
                          <span className="text-[11px] font-normal px-1.5 py-0.5 rounded bg-[#025540] text-emerald-300 border border-[#047857]/60">
                            {med.strength}
                          </span>
                        </h3>
                        <p className="text-xs text-emerald-300/80 font-medium">{med.genericName}</p>
                        <p className="text-[10px] text-emerald-400/60 uppercase font-semibold mt-0.5">
                          {med.manufacturer}
                        </p>
                      </div>

                      {/* Stock Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          availableStock > 500
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                            : availableStock > 0
                            ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                            : "bg-red-950/80 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {availableStock.toLocaleString()} Loose Pcs In Stock
                      </span>
                    </div>

                    {/* Packaging Hierarchy Specs */}
                    <div className="mt-3 grid grid-cols-3 gap-1 bg-[#011e17] p-2 rounded-lg text-[10px] border border-[#047857]/30 text-emerald-200">
                      <div>
                        <span className="text-emerald-400/70 block">1 Strip</span>
                        <strong className="text-white">{med.piecesPerStrip} Pcs</strong>
                      </div>
                      <div>
                        <span className="text-emerald-400/70 block">1 Box</span>
                        <strong className="text-white">{med.stripsPerBox} Strips ({piecesPerBox} Pcs)</strong>
                      </div>
                      <div>
                        <span className="text-emerald-400/70 block">Trade Price</span>
                        <strong className="text-[#34d399]">৳{med.tradePricePerPiece}/pc</strong>
                      </div>
                    </div>

                    {/* Active Promotional Offer Banner */}
                    {activeOffer && (
                      <div className="mt-2.5 p-2 rounded-lg bg-gradient-to-r from-[#025540]/80 to-[#047857]/50 border border-[#10b981]/40 flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-[#6ee7b7] shrink-0" />
                        <p className="text-[10px] text-[#6ee7b7] font-semibold leading-tight">
                          {activeOffer.title}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Input Controls: Unit Selector & Quantity */}
                  <div className="mt-4 pt-3 border-t border-[#047857]/30 flex items-center justify-between gap-2">
                    {/* Unit Selector */}
                    <div className="flex rounded-lg bg-[#011b14] p-0.5 border border-[#047857]/40 text-xs">
                      {[
                        { unit: PackagingUnit.BOX, label: "Box" },
                        { unit: PackagingUnit.STRIP, label: "Strip" },
                        { unit: PackagingUnit.PIECE, label: "Piece" },
                      ].map((u) => (
                        <button
                          key={u.unit}
                          onClick={() => handleUnitChange(med.id, u.unit)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            selectedUnit === u.unit
                              ? "bg-[#025540] text-white border border-[#10b981]/50 font-bold"
                              : "text-emerald-300/70 hover:text-white"
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleQtyChange(med.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#011b14] border border-[#047857]/50 flex items-center justify-center hover:bg-[#023528] text-white"
                      >
                        <Minus className="w-3 h-3 text-emerald-300" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-white">
                        {selectedQty}
                      </span>
                      <button
                        onClick={() => handleQtyChange(med.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#011b14] border border-[#047857]/50 flex items-center justify-center hover:bg-[#023528] text-white"
                      >
                        <Plus className="w-3 h-3 text-emerald-300" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(med)}
                      disabled={availableStock <= 0}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#10b981] to-[#025540] hover:from-[#34d399] hover:to-[#047857] text-white font-bold text-xs shadow-md shadow-[#10b981]/20 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Cart & Transaction Checkout Station */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-[#10b981]/40 sticky top-24">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#047857]/40">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#34d399]" />
                Order Cutting Cart ({cart.length} Items)
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-emerald-300/60">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
                <p className="text-sm font-semibold text-white">Your order cart is empty</p>
                <p className="text-xs text-emerald-300/60 mt-1">
                  Select medicines from catalog or import from AI Prescription Scanner
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                
                {/* Cart Items List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {calculatedCartItems.map((item, idx) => (
                    <div
                      key={`${item.medicine.id}-${item.orderedUnit}-${idx}`}
                      className="p-3 rounded-xl bg-[#011e17] border border-[#047857]/40 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {item.medicine.brandName}
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#025540] text-emerald-300 border border-[#047857]/50">
                              {item.orderedQty} {item.orderedUnit}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-300/70">
                            {item.tradeResult.looseUnitsBilled} loose pieces billed
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold font-mono text-white text-sm">
                            ৳{item.tradeResult.netItemTotal.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-400/70">
                            (incl. ৳{item.tradeResult.vatAmount} VAT)
                          </p>
                        </div>
                      </div>

                      {/* Trade Bonus Pill */}
                      {item.tradeResult.bonusLooseUnits > 0 && (
                        <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-[#10b981]/50 text-[10px] text-[#6ee7b7] font-semibold flex items-center gap-1.5">
                          <Gift className="w-3 h-3 text-[#34d399]" />
                          <span>Bonus: +{item.tradeResult.bonusLooseUnits} Free Loose Pieces Awarded</span>
                        </div>
                      )}

                      {/* Near-Expiry FIFO Batch Allocation Preview */}
                      {item.fifoResult.allocations.length > 0 && (
                        <div className="p-2 rounded bg-[#01140f] border border-[#047857]/30 text-[10px] space-y-1">
                          <div className="flex items-center justify-between text-emerald-300/70 font-semibold">
                            <span>Near-Expiry FIFO Batch Assignment:</span>
                            <span className="text-[#34d399]">
                              {item.fifoResult.allocatedLooseUnits} Pcs Allocated
                            </span>
                          </div>
                          {item.fifoResult.allocations.map((alloc) => (
                            <div
                              key={alloc.batchId}
                              className="flex items-center justify-between text-white font-mono"
                            >
                              <span>
                                {alloc.batchNumber}{" "}
                                <span className={alloc.isNearExpiry ? "text-amber-400" : "text-emerald-400"}>
                                  (Exp: {String(alloc.expiryDate).slice(0, 7)} - {alloc.daysUntilExpiry}d left)
                                </span>
                              </span>
                              <strong className="text-emerald-300">{alloc.piecesAllocated} pcs</strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#047857]/30 text-[11px]">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQty(idx, -1)}
                            className="w-5 h-5 rounded bg-[#01241b] border border-[#047857]/40 flex items-center justify-center text-white"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-bold text-white">{item.orderedQty}</span>
                          <button
                            onClick={() => updateCartQty(idx, 1)}
                            className="w-5 h-5 rounded bg-[#01241b] border border-[#047857]/40 flex items-center justify-center text-white"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary Breakdown */}
                <div className="p-4 rounded-xl bg-[#01140f] border border-[#047857]/50 space-y-2 text-xs">
                  <div className="flex justify-between text-emerald-200">
                    <span>Gross Trade Amount:</span>
                    <span className="font-mono text-white">৳{cartGross.toLocaleString()}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-[#6ee7b7]">
                      <span>Trade Scheme Discounts:</span>
                      <span className="font-mono font-bold">-৳{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-200">
                    <span>Pharma VAT (2.4%):</span>
                    <span className="font-mono text-white">৳{cartVat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-300/80">
                    <span>Total Loose Units (Billed + Bonus):</span>
                    <span className="font-mono text-white">
                      {totalBilledPieces} + <strong className="text-[#6ee7b7]">+{totalBonusPieces} Free</strong> = {totalBilledPieces + totalBonusPieces} pcs
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#047857]/40 flex justify-between text-sm font-bold text-white">
                    <span>Net Invoice Payable:</span>
                    <span className="font-mono text-base text-[#34d399]">
                      ৳{cartNetTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Credit Risk Gating Box */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    creditAudit.isApproved
                      ? "bg-[#023528]/80 border-[#10b981]/50 text-emerald-100"
                      : "bg-red-950/80 border-red-500/60 text-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {creditAudit.isApproved ? (
                        <ShieldCheck className="w-4 h-4 text-[#34d399]" />
                      ) : (
                        <AlertOctagon className="w-4 h-4 text-red-400" />
                      )}
                      Credit Gating Check:
                    </span>
                    <span>
                      {creditAudit.isApproved ? "Approved (Within Limit)" : "BLOCKED BY POLICY"}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    {creditAudit.isApproved
                      ? `Projected balance ৳${creditAudit.projectedBalance.toLocaleString()} will remain within limit of ৳${creditAudit.creditLimit.toLocaleString()}.`
                      : creditAudit.rejectionReason}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950 border border-red-500 text-xs text-red-200 flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Checkout Failed</strong>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

                {/* Atomic Checkout Confirmation Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || !creditAudit.isApproved}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#025540] hover:from-[#34d399] hover:to-[#047857] text-white font-bold text-sm shadow-xl shadow-[#10b981]/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span>Acquiring Lock & Deducting FIFO Batches...</span>
                  ) : (
                    <>
                      <span>Cut & Confirm Order (Atomic Transaction)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Receipt Modal */}
      {orderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-[#10b981] shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-[#10b981] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#34d399]" />
              </div>
              <h3 className="text-lg font-bold text-white">Order Confirmed & Allocated</h3>
              <p className="text-xs text-emerald-300/80">
                Order #{orderReceipt.orderNumber} successfully cut and recorded in Ledger.
              </p>
            </div>

            <div className="p-3 bg-[#01140f] rounded-xl border border-[#047857]/50 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-emerald-200">
                <span>Pharmacy:</span>
                <strong className="text-white">{orderReceipt.pharmacyName}</strong>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Total Net Payable:</span>
                <strong className="text-[#34d399] text-sm">
                  ৳{orderReceipt.netPayableAmount.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Total Loose Pieces:</span>
                <span className="text-white">
                  {orderReceipt.totalLoosePieces} billed + {orderReceipt.totalBonusPieces} free
                </span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Ledger Tx Reference:</span>
                <span className="text-white">{orderReceipt.ledgerTxId}</span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>New Outstanding Balance:</span>
                <span className="text-white">
                  ৳{orderReceipt.creditSnapshot.newBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setOrderReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-[#025540] hover:bg-[#047857] text-white font-bold text-xs border border-[#10b981]/50 transition-all"
            >
              Close Receipt & Continue Cutting Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
