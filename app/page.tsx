"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ShoppingCart,
  Zap,
  Sparkles,
  TrendingUp,
  Tag,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Layers,
  Plus,
  Boxes,
  Eye,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export default function HomePage() {
  const router = useRouter();
  const {
    medicines,
    batches,
    offers,
    currentPharmacy,
    addToCart,
    setIsSearchOpen,
    setIsQuickOrderOpen,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const availableCredit = Math.max(0, currentPharmacy.creditLimit - currentPharmacy.currentBalance);
  const creditUtilizationPercent = Math.min(
    100,
    Math.round((currentPharmacy.currentBalance / currentPharmacy.creditLimit) * 100)
  );

  const categories = [
    { id: "ALL", label: "All Medicines" },
    { id: "TABLET", label: "Tablets" },
    { id: "CAPSULE", label: "Capsules" },
    { id: "ANTIBIOTIC", label: "Antibiotics" },
    { id: "PPI", label: "Gastric & PPI" },
    { id: "ANALGESIC", label: "Pain & Fever" },
    { id: "ANTIHISTAMINE", label: "Allergy & Asthma" },
  ];

  const filteredMedicines = medicines.filter((med) => {
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "TABLET") return med.dosageForm === "TABLET";
    if (selectedCategory === "CAPSULE") return med.dosageForm === "CAPSULE";
    if (selectedCategory === "ANTIBIOTIC")
      return med.brandName.includes("Zimax") || med.brandName.includes("Ciprocin");
    if (selectedCategory === "PPI")
      return med.brandName.includes("Seclo") || med.brandName.includes("Sergel");
    if (selectedCategory === "ANALGESIC")
      return med.brandName.includes("Napa") || med.brandName.includes("Ace");
    if (selectedCategory === "ANTIHISTAMINE")
      return med.brandName.includes("Monas") || med.brandName.includes("Fexo");
    return true;
  });

  const handleQuickAdd = (medicineId: string, unit: PackagingUnit) => {
    addToCart({ medicineId, orderedUnit: unit, orderedQty: 1 });
    setAddedMap((prev) => ({ ...prev, [medicineId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [medicineId]: false }));
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* TOP: Welcome Hero & Credit Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Hero Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#014232] via-[#025540] to-[#01382a] rounded-2xl p-6 border border-emerald-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Authorized Pharmacy Terminal
              </span>
              <span className="text-xs text-emerald-200/70 font-mono">
                Lic: {currentPharmacy.drugLicenseNo}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, <span className="text-emerald-300">{currentPharmacy.tradeName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 max-w-xl leading-relaxed">
              Real-time B2B pharmaceutical order cutting with Near-Expiry FEFO batch allocation, automated trade bonus calculations, and AI-assisted slip ordering.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQuickOrderOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Fast Order Matrix</span>
            </button>

            <Link
              href="/ai-order"
              className="px-4 py-2.5 rounded-xl bg-[#036b51] hover:bg-[#048263] border border-emerald-400/30 text-emerald-100 font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
              <span>AI Prescription Parser</span>
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-emerald-300" />
              <span>Find Medicines (⌘K)</span>
            </button>
          </div>
        </div>

        {/* Credit Limit & Headroom Gauge (Pure White Card) */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Health</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active 30-Day Terms
              </span>
            </div>

            <div className="mt-3">
              <div className="text-xs text-slate-500">Available Headroom</div>
              <div className="text-2xl font-black font-mono text-emerald-700">
                ৳{availableCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>Used: ৳{currentPharmacy.currentBalance.toLocaleString()}</span>
                <span>Limit: ৳{currentPharmacy.creditLimit.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    creditUtilizationPercent > 80 ? "bg-amber-500" : "bg-emerald-600"
                  }`}
                  style={{ width: `${creditUtilizationPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/credit"
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              Credit Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/transactions"
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              Ledger Statements
            </Link>
          </div>
        </div>

      </div>

      {/* ACTIVE TRADE PROMOTIONS BANNER (Pure White Card) */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Active Trade Bonuses & Volume Schemes
            </h2>
          </div>
          <Link
            href="/trade-offers"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            View All ({offers.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {offers.map((offer) => {
            const med = medicines.find((m) => m.id === offer.medicineId);
            return (
              <div
                key={offer.id}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      {offer.schemeType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">Active</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                    {offer.title}
                  </h3>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Applies to: <strong className="text-slate-900">{med?.brandName}</strong> ({med?.strength})
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Auto-calculated in cart</span>
                  <button
                    onClick={() => {
                      if (med) {
                        addToCart({
                          medicineId: med.id,
                          orderedUnit: offer.qualifyingUnit,
                          orderedQty: offer.minQualifyingQty,
                        });
                        router.push("/cart");
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    Apply Offer <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MEDICINE MARKETPLACE CATALOG */}
      <div className="space-y-4">
        
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/10 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-white text-[#01382a] shadow-md scale-105"
                    : "bg-[#014232] text-emerald-100 hover:bg-[#036b51] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/products"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Filter Catalog</span>
            </Link>
          </div>
        </div>

        {/* Product Cards Grid (Pure White Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMedicines.map((med) => {
            const medBatches = batches.filter((b) => b.medicineId === med.id);
            const totalStockPieces = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
            const activeOffer = offers.find((o) => o.medicineId === med.id && o.isActive);
            const boxPieces = med.piecesPerStrip * med.stripsPerBox;
            const availableBoxes = (totalStockPieces / boxPieces).toFixed(1);
            const boxTradePrice = (med.tradePricePerPiece * boxPieces).toFixed(2);
            const isAdded = !!addedMap[med.id];

            return (
              <div
                key={med.id}
                className="premium-card p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {med.dosageForm}
                    </span>
                    {totalStockPieces > 200 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                      </span>
                    )}
                  </div>

                  {/* Brand & Generic Info */}
                  <div className="mt-3">
                    <Link
                      href={`/products/${med.id}`}
                      className="font-black text-base text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                    >
                      {med.brandName}
                    </Link>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      {med.strength}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {med.genericName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {med.manufacturer}
                    </div>
                  </div>

                  {/* Packaging Specification */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Box Pack:</span>
                      <strong className="text-slate-900">{med.stripsPerBox} strips × {med.piecesPerStrip} pcs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <strong className="text-emerald-700">{availableBoxes} Boxes ({totalStockPieces} pcs)</strong>
                    </div>
                  </div>

                  {/* Running Trade Scheme Badge */}
                  {activeOffer && (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{activeOffer.title}</span>
                    </div>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Trade Price</div>
                      <div className="text-lg font-black font-mono text-slate-900">
                        ৳{boxTradePrice}
                        <span className="text-[10px] font-normal text-slate-500"> / Box</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">MRP</div>
                      <div className="text-xs font-bold font-mono text-slate-500 line-through">
                        ৳{(med.mrpPerPiece * boxPieces).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/products/${med.id}`}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    <button
                      onClick={() => handleQuickAdd(med.id, PackagingUnit.BOX)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-[#025540] hover:bg-[#036b51] text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+1 Box</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
