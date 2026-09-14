"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Layers,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Minus,
  Sparkles,
  Calendar,
  Building2,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";
import { PackagingEngine } from "@/services/packagingEngine";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.medicineId as string;

  const { medicines, batches, offers, addToCart } = useApp();

  const medicine = medicines.find((m) => m.id === medicineId) || medicines[0];
  const medBatches = batches.filter((b) => b.medicineId === medicine.id);
  const activeOffer = offers.find((o) => o.medicineId === medicine.id && o.isActive);

  const [selectedUnit, setSelectedUnit] = useState<PackagingUnit>(PackagingUnit.BOX);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [customStripInput, setCustomStripInput] = useState<number>(125);
  const [isAdded, setIsAdded] = useState(false);

  const totalStockPieces = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
  const boxPieces = medicine.piecesPerStrip * medicine.stripsPerBox;
  const availableBoxes = (totalStockPieces / boxPieces).toFixed(1);

  // Price Calculation using PackagingEngine
  const calcResult = PackagingEngine.calculateTradePricing(
    medicine,
    selectedUnit,
    orderQty,
    activeOffer
  );

  // Packaging hierarchy breakdown demo: e.g. 125 strips normalized
  const stripConversion = PackagingEngine.calculateHierarchy(
    medicine,
    PackagingUnit.STRIP,
    customStripInput
  );

  // Alternative medicines with same generic
  const alternativeMedicines = medicines.filter(
    (m) => m.genericName.toLowerCase().includes(medicine.genericName.toLowerCase().split("+")[0].trim()) && m.id !== medicine.id
  );

  const handleAddToCart = () => {
    addToCart({
      medicineId: medicine.id,
      orderedUnit: selectedUnit,
      orderedQty: orderQty,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      router.push("/cart");
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Catalog</span>
        </Link>
      </div>

      {/* TOP: Main Product Details Card (Pure White Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Medicine Specs */}
        <div className="lg:col-span-2 premium-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {medicine.dosageForm}
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {medicine.code}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {medicine.brandName}
              </h1>
              <div className="text-sm font-bold text-emerald-800 mt-0.5">
                {medicine.strength}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Generic: <strong className="text-slate-800">{medicine.genericName}</strong>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-400 font-semibold uppercase">Manufacturer</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center sm:justify-end gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{medicine.manufacturer}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {medicine.description && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <strong className="text-slate-900">Clinical Indication:</strong> {medicine.description}
            </p>
          )}

          {/* Packaging Hierarchy Specification */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Packaging Hierarchy & Stock Unit Specification</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">1 Box Contains</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{medicine.stripsPerBox} Strips</div>
                <div className="text-[10px] text-slate-500 font-mono">({boxPieces} loose pieces)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">1 Strip Contains</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{medicine.piecesPerStrip} Pieces</div>
                <div className="text-[10px] text-slate-500 font-mono">(Tablets/Capsules)</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Available Stock</div>
                <div className="text-sm font-black text-emerald-900 mt-0.5">{availableBoxes} Boxes</div>
                <div className="text-[10px] text-emerald-700 font-mono font-bold">({totalStockPieces} pcs in depot)</div>
              </div>
            </div>
          </div>

          {/* Dynamic Hierarchy Normalization Live Calculator */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <span>Multi-tier Loose Normalization Engine</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                Auto-Pack Normalizer
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Input Loose Strips:</label>
              <input
                type="number"
                min="1"
                value={customStripInput}
                onChange={(e) => setCustomStripInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-600"
              />
              <div className="text-xs text-slate-700">
                Normalizes to: <strong className="text-emerald-800 font-mono">{stripConversion.boxes} Boxes + {stripConversion.strips} Strips</strong> ({stripConversion.totalLoosePieces} total pcs)
              </div>
            </div>
          </div>

          {/* FEFO Batches Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Authoritative FEFO Batch Stock Allocation (First Expiry First Out)</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Batch Number</th>
                    <th className="py-2.5 px-3">Mfg Date</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Available Stock</th>
                    <th className="py-2.5 px-3">FEFO Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {medBatches.map((b, idx) => {
                    const isFirst = idx === 0;
                    const isNearExp = new Date(b.expiryDate).getFullYear() === 2026;
                    return (
                      <tr key={b.id} className={isFirst ? "bg-emerald-50/50" : ""}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                        <td className="py-2.5 px-3 text-slate-500">{typeof b.manufacturingDate === "string" ? b.manufacturingDate : "2025-01-15"}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {typeof b.expiryDate === "string" ? b.expiryDate : "2027-06-30"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-800 font-bold">
                          {b.availableLooseUnits} pieces
                        </td>
                        <td className="py-2.5 px-3">
                          {isFirst ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              1st FEFO Priority
                            </span>
                          ) : isNearExp ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Near Expiry Batch
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Active Queue</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Col: Pricing & Order Cutting Terminal (Pure White Card) */}
        <div className="premium-card p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Order Configuration</span>
              <span className="text-emerald-700 text-xs font-mono font-bold">Trade Terminal</span>
            </h2>

            {/* Active Offer Banner */}
            {activeOffer && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{activeOffer.title}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {calcResult.bonusLooseUnits > 0
                    ? `Bonus Unlocked: +${calcResult.bonusLooseUnits} loose pieces FREE!`
                    : `Order at least ${activeOffer.minQualifyingQty} ${activeOffer.qualifyingUnit}s to unlock bonus scheme.`}
                </p>
              </div>
            )}

            {/* Unit Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Packaging Unit:</label>
              <div className="grid grid-cols-3 gap-2">
                {[PackagingUnit.BOX, PackagingUnit.STRIP, PackagingUnit.PIECE].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSelectedUnit(unit)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                      selectedUnit === unit
                        ? "bg-[#025540] text-white border-[#025540] shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Order Quantity:</label>
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <button
                  onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-lg font-black font-mono text-slate-900">{orderQty}</span>
                  <span className="text-xs text-slate-500 font-semibold ml-1">{selectedUnit}s</span>
                </div>
                <button
                  onClick={() => setOrderQty(orderQty + 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Order Price Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Trade Amount:</span>
                <span className="font-mono font-bold text-slate-900">৳{calcResult.grossPrice.toFixed(2)}</span>
              </div>
              {calcResult.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Trade Scheme Discount ({calcResult.discountPercentage}%):</span>
                  <span className="font-mono">-৳{calcResult.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {calcResult.bonusLooseUnits > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold bg-emerald-100/70 p-1.5 rounded-lg">
                  <span>Trade Bonus Pieces:</span>
                  <span className="font-mono">+{calcResult.bonusLooseUnits} pieces FREE</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT ({medicine.vatPercentage}%):</span>
                <span className="font-mono">৳{calcResult.vatAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-sm text-slate-900">Net Payable:</span>
                <span className="text-xl font-black font-mono text-emerald-800">
                  ৳{calcResult.netItemTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#025540] hover:bg-[#036b51] text-white hover:scale-105 active:scale-95"
            }`}
          >
            {isAdded ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Added to Active Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add {orderQty} {selectedUnit}(s) to Cart</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* BOTTOM: Generic Therapeutic Alternatives (Pure White Card) */}
      {alternativeMedicines.length > 0 && (
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-slate-900">
              Bioequivalent Therapeutic Alternatives ({medicine.genericName})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alternativeMedicines.map((alt) => {
              const altBatches = batches.filter((b) => b.medicineId === alt.id);
              const altStock = altBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
              const altBoxPieces = alt.piecesPerStrip * alt.stripsPerBox;

              return (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/20 transition-all flex items-center justify-between"
                >
                  <div>
                    <Link
                      href={`/products/${alt.id}`}
                      className="font-bold text-xs text-slate-900 hover:text-emerald-700"
                    >
                      {alt.brandName} ({alt.strength})
                    </Link>
                    <div className="text-[11px] text-slate-500">{alt.manufacturer}</div>
                    <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                      Stock: {(altStock / altBoxPieces).toFixed(1)} Boxes • ৳{(alt.tradePricePerPiece * altBoxPieces).toFixed(0)}/Box
                    </div>
                  </div>

                  <Link
                    href={`/products/${alt.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
