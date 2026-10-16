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
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  X,
} from "lucide-react";
import {
  ALL_PHARMA_COMPANIES,
  TOP_QUICK_PHARMA_COMPANIES,
  matchPharmaCompany,
} from "@/lib/data/pharmaCompanies";

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
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");
  const [cart, setCart] = useState<CartItem[]>(externalCartItems);
  const [selectedUnits, setSelectedUnits] = useState<Record<string, PackagingUnit>>({});
  const [inputQuantities, setInputQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pharmaCompanies = ALL_PHARMA_COMPANIES;

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

    const matchesCategory =
      selectedCategory === "ALL" || m.dosageForm === selectedCategory;

    const medMfg = m.manufacturer.toLowerCase();
    const matchesCompany =
      selectedCompany === "ALL" ||
      (selectedCompany === "ACI"
        ? medMfg.includes("aci") || medMfg.includes("advanced chemical")
        : selectedCompany === "Eskayef"
        ? medMfg.includes("eskayef") || medMfg.includes("sk+f") || medMfg.includes("skf")
        : medMfg.includes(selectedCompany.toLowerCase()));

    return matchesSearch && matchesCategory && matchesCompany;
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
  const simulatedOldestInvoice = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString();
  const creditAudit = CreditLedgerEngine.auditPharmacyCredit(
    pharmacy,
    cartNetTotal,
    simulatedOldestInvoice
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
        deliveryNotes: "Priority Express Dispatch via MedSupply Pharma Van",
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
      {/* Search, Category & Company Filter Bar */}
      <div className="premium-panel p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Brand (Napa, Seclo), Generic, or Manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#025540] focus:ring-2 focus:ring-[#025540]/10 font-medium transition-all"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {["ALL", "TABLET", "CAPSULE", "SYRUP", "INJECTION"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#025540] text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Company Pills & All-Companies Dropdown Filter */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-none flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Building2 className="w-3 h-3 text-[#025540]" />
              <span>Company:</span>
            </span>

            {TOP_QUICK_PHARMA_COMPANIES.map((comp) => {
              const isSelected = selectedCompany === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompany(comp.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? "bg-[#025540] text-white shadow-xs font-bold ring-2 ring-[#025540]/20"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {comp.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#025540]/20 transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Companies (46+ manufacturers)</option>
              <optgroup label="Top Pharmaceutical Manufacturers">
                {ALL_PHARMA_COMPANIES.filter((c) => c.id !== "ALL").map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.fullName} ({comp.count})
                  </option>
                ))}
              </optgroup>
            </select>

            {selectedCompany !== "ALL" && (
              <button
                onClick={() => setSelectedCompany("ALL")}
                className="text-[11px] font-bold text-[#025540] hover:underline flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Company Banner */}
      {selectedCompany !== "ALL" && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-950 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#025540] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate">
                Showing {filteredMedicines.length} verified products for{" "}
                <span className="text-[#025540] underline underline-offset-2">
                  {pharmaCompanies.find((c) => c.id === selectedCompany)?.label || selectedCompany}
                </span>
              </div>
              <div className="text-[10px] text-emerald-700">
                Bulk ordering & trade offer allocations filtered to this pharmaceutical depot
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCompany("ALL")}
            className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
          >
            <X className="w-3 h-3 text-emerald-600" />
            <span>Show All</span>
          </button>
        </div>
      )}

      {/* Main Grid: Catalog Left (60%) vs Live Cart Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              Medicine Catalog ({filteredMedicines.length} Verified Products)
            </h2>
            <span className="text-xs text-emerald-100 font-medium">B2B Base Trade Pricing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicines.map((med) => {
              const medBatches = batches.filter((b) => b.medicineId === med.id);
              const availableStock = BatchFifoEngine.getTotalAvailableStock(medBatches);
              const activeOffer = offers.find((o) => o.medicineId === med.id && o.isActive);
              const selectedUnit = getUnit(med.id);
              const selectedQty = getQty(med.id);

              const piecesPerBox = med.piecesPerStrip * med.stripsPerBox;

              return (
                <div
                  key={med.id}
                  className="premium-card p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Brand Name & Active Offer Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                          {med.brandName}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#025540] border border-emerald-200">
                            {med.strength}
                          </span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const mfg = med.manufacturer || "";
                            const matched = pharmaCompanies.find(
                              (c) => c.id !== "ALL" && mfg.toLowerCase().includes(c.id.toLowerCase())
                            );
                            setSelectedCompany(matched ? matched.id : mfg);
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 hover:underline uppercase font-bold mt-0.5 tracking-wider flex items-center gap-1 cursor-pointer text-left"
                          title={`Filter by ${med.manufacturer}`}
                        >
                          <Building2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{med.manufacturer}</span>
                        </button>
                      </div>

                      {/* Stock Badge */}
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                          availableStock > 500
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                            : availableStock > 0
                            ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                            : "bg-red-50 text-red-800 border border-red-200/80"
                        }`}
                      >
                        {availableStock.toLocaleString()} Pcs
                      </span>
                    </div>

                    {/* Packaging Hierarchy Specs */}
                    <div className="mt-3.5 grid grid-cols-3 gap-1.5 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 text-[10px] text-slate-700">
                      <div>
                        <span className="text-slate-400 block font-bold">1 Strip</span>
                        <strong className="text-slate-900 font-bold text-xs">{med.piecesPerStrip} Pcs</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">1 Box</span>
                        <strong className="text-slate-900 font-bold text-xs">{piecesPerBox} Pcs</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Trade Price</span>
                        <strong className="text-[#025540] font-black text-xs">৳{med.tradePricePerPiece}/pc</strong>
                      </div>
                    </div>

                    {/* Active Promotional Offer Banner */}
                    {activeOffer && (
                      <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-300 flex items-center gap-2 shadow-sm">
                        <Gift className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <p className="text-[11px] text-emerald-900 font-bold leading-tight">
                          {activeOffer.title}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Input Controls: Unit Selector & Quantity */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Unit Selector */}
                    <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
                      {[
                        { unit: PackagingUnit.BOX, label: "Box" },
                        { unit: PackagingUnit.STRIP, label: "Strip" },
                        { unit: PackagingUnit.PIECE, label: "Piece" },
                      ].map((u) => (
                        <button
                          key={u.unit}
                          onClick={() => handleUnitChange(med.id, u.unit)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                            selectedUnit === u.unit
                              ? "bg-[#025540] text-white shadow-sm font-bold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1 bg-slate-50 rounded-xl p-0.5 border border-slate-200">
                      <button
                        onClick={() => handleQtyChange(med.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-slate-700" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-black text-slate-900">
                        {selectedQty}
                      </span>
                      <button
                        onClick={() => handleQtyChange(med.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-slate-700" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(med)}
                      disabled={availableStock <= 0}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#4338CA] hover:from-[#4338CA] hover:to-[#3730A3] text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
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
          <div className="premium-panel p-5 sticky top-24">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#025540]" />
                Order Cutting Cart ({cart.length} Lines)
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-700">Your order cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Add medicines from catalog or import from AI Prescription Scanner
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                
                {/* Cart Items List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {calculatedCartItems.map((item, idx) => (
                    <div
                      key={`${item.medicine.id}-${item.orderedUnit}-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {item.medicine.brandName}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#025540] text-white font-bold">
                              {item.orderedQty} {item.orderedUnit}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {item.tradeResult.looseUnitsBilled} loose pieces billed
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-black font-mono text-slate-900 text-sm">
                            ৳{item.tradeResult.netItemTotal.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            (incl. ৳{item.tradeResult.vatAmount} VAT)
                          </p>
                        </div>
                      </div>

                      {/* Trade Bonus Pill */}
                      {item.tradeResult.bonusLooseUnits > 0 && (
                        <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-300 text-[10px] text-emerald-950 font-bold flex items-center gap-1.5 shadow-sm">
                          <Gift className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Bonus: +{item.tradeResult.bonusLooseUnits} Free Loose Pieces Awarded</span>
                        </div>
                      )}

                      {/* Near-Expiry FIFO Batch Allocation Preview */}
                      {item.fifoResult.allocations.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] space-y-1 shadow-sm">
                          <div className="flex items-center justify-between text-slate-700 font-bold">
                            <span>Near-Expiry FIFO Batch Assignment:</span>
                            <span className="text-[#025540]">
                              {item.fifoResult.allocatedLooseUnits} Pcs Allocated
                            </span>
                          </div>
                          {item.fifoResult.allocations.map((alloc) => (
                            <div
                              key={alloc.batchId}
                              className="flex items-center justify-between text-slate-800 font-mono"
                            >
                              <span>
                                {alloc.batchNumber}{" "}
                                <span className={alloc.isNearExpiry ? "text-amber-700 font-bold" : "text-emerald-700"}>
                                  (Exp: {String(alloc.expiryDate).slice(0, 7)} - {alloc.daysUntilExpiry}d left)
                                </span>
                              </span>
                              <strong className="text-slate-900 font-bold">{alloc.piecesAllocated} pcs</strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQty(idx, -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-bold text-slate-900">{item.orderedQty}</span>
                          <button
                            onClick={() => updateCartQty(idx, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Gross Trade Amount:</span>
                    <span className="font-mono text-slate-900 font-bold">৳{cartGross.toLocaleString()}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Trade Scheme Discounts:</span>
                      <span className="font-mono font-bold">-৳{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Pharma VAT (2.4%):</span>
                    <span className="font-mono text-slate-900 font-bold">৳{cartVat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Total Loose Units (Billed + Bonus):</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {totalBilledPieces} + <strong className="text-emerald-700">+{totalBonusPieces} Free</strong> = {totalBilledPieces + totalBonusPieces} pcs
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Net Invoice Payable:</span>
                    <span className="font-mono text-base text-[#025540] font-black">
                      ৳{cartNetTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Credit Risk Gating Box */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    creditAudit.isApproved
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
                      : "bg-red-50 border-red-300 text-red-950 font-bold"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {creditAudit.isApproved ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <AlertOctagon className="w-4 h-4 text-red-700" />
                      )}
                      Credit Gating Check:
                    </span>
                    <span className="font-extrabold">
                      {creditAudit.isApproved ? "Approved" : "BLOCKED BY POLICY"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {creditAudit.isApproved
                      ? `Projected balance ৳${creditAudit.projectedBalance.toLocaleString()} will remain safely within limit of ৳${creditAudit.creditLimit.toLocaleString()}.`
                      : creditAudit.rejectionReason}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
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
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#4338CA] hover:from-[#4338CA] hover:to-[#3730A3] text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 max-w-lg w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7 text-[#025540]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Order Confirmed & Allocated</h3>
              <p className="text-xs text-slate-600">
                Order #{orderReceipt.orderNumber} successfully cut and recorded in Ledger.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono text-slate-800">
              <div className="flex justify-between">
                <span>Pharmacy:</span>
                <strong className="text-slate-900">{orderReceipt.pharmacyName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Net Payable:</span>
                <strong className="text-[#025540] text-sm font-black">
                  ৳{orderReceipt.netPayableAmount.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Total Loose Pieces:</span>
                <span className="text-slate-900 font-bold">
                  {orderReceipt.totalLoosePieces} billed + {orderReceipt.totalBonusPieces} free
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ledger Tx Reference:</span>
                <span className="text-slate-900">{orderReceipt.ledgerTxId}</span>
              </div>
              <div className="flex justify-between">
                <span>New Outstanding Balance:</span>
                <span className="text-slate-900 font-bold">
                  ৳{orderReceipt.creditSnapshot.newBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setOrderReceipt(null)}
              className="w-full py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs transition-all shadow-lg"
            >
              Close Receipt & Continue Cutting Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
