"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Tag,
  Percent,
  Gift,
  Calendar,
  Building2,
  CheckCircle2,
  ShoppingCart,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

interface OfferItem {
  id: string;
  title: string;
  medicineId: string;
  schemeType: string;
  qualifyingUnit: string;
  minQualifyingQty: number;
  bonusQty: number;
  bonusUnit: string;
  discountPercent?: number;
  flatDiscountAmount?: number;
  startDate: string;
  endDate: string;
  companyName: string;
  medicine: {
    id: string;
    brandName: string;
    genericName: string;
    manufacturer: string;
    dosageForm: string;
    strength: string;
    piecesPerStrip: number;
    stripsPerBox: number;
    mrpPerPiece: number;
    tradePricePerPiece: number;
    boxTradePrice: number;
    boxMrp: number;
  } | null;
}

interface OffersHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimOffer?: (medicineId: string, qty: number, unit: "BOX" | "STRIP" | "PIECE") => void;
}

const TOP_COMPANIES = [
  "ALL",
  "Beximco Pharmaceuticals Ltd.",
  "Square Pharmaceuticals PLC",
  "Incepta Pharmaceuticals Ltd.",
  "Renata Limited",
  "The ACME Laboratories Ltd.",
];

export const OffersHubModal: React.FC<OffersHubModalProps> = ({
  isOpen,
  onClose,
  onClaimOffer,
}) => {
  const { addToCart } = useApp();
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [selectedScheme, setSelectedScheme] = useState<"ALL" | "BUY_X_GET_Y_FREE" | "SLAB_DISCOUNT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [claimedOfferId, setClaimedOfferId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch("/api/offers")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.offers)) {
            setOffers(data.offers);
          }
        })
        .catch((err) => console.error("Error fetching offers:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOffers = offers.filter((o) => {
    if (selectedCompany !== "ALL" && !o.companyName.toLowerCase().includes(selectedCompany.toLowerCase())) {
      return false;
    }
    if (selectedScheme !== "ALL" && o.schemeType !== selectedScheme) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.medicine?.brandName.toLowerCase().includes(q);
      const matchGen = o.medicine?.genericName.toLowerCase().includes(q);
      const matchTitle = o.title.toLowerCase().includes(q);
      const matchComp = o.companyName.toLowerCase().includes(q);
      if (!matchName && !matchGen && !matchTitle && !matchComp) return false;
    }
    return true;
  });

  const handleClaim = (offer: OfferItem) => {
    if (!offer.medicine) return;
    const qty = offer.minQualifyingQty || 10;
    const unit = (offer.qualifyingUnit as any) || "BOX";

    if (onClaimOffer) {
      onClaimOffer(offer.medicine.id, qty, unit);
    } else {
      addToCart({
        medicineId: offer.medicine.id,
        orderedQty: qty,
        orderedUnit: unit as any,
        unitTradePrice: offer.medicine.tradePricePerPiece,
      } as any);
    }

    setClaimedOfferId(offer.id);
    setTimeout(() => {
      setClaimedOfferId(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <Tag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Trade Offers & Bonuses</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  Verified Schemes
                </span>
              </div>
              <p className="text-xs text-slate-500">Official pharmaceutical company bonuses and slab discounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by medicine, generic, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#139485] focus:border-transparent"
            />
          </div>

          {/* Company Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Company:</span>
            {TOP_COMPANIES.map((comp) => {
              const label = comp === "ALL" ? "All Companies" : comp.replace(" Pharmaceuticals Ltd.", "").replace(" Pharmaceuticals PLC", "").replace(" Limited", "").replace(" Laboratories Ltd.", "");
              const isSelected = selectedCompany === comp;
              return (
                <button
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-[#139485] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Scheme Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Type:</span>
            {[
              { id: "ALL", label: "All Schemes" },
              { id: "BUY_X_GET_Y_FREE", label: "10+1 / Free Goods" },
              { id: "SLAB_DISCOUNT", label: "Cash Discount" },
            ].map((sc) => {
              const isSelected = selectedScheme === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScheme(sc.id as any)}
                  className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers List */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Loading verified trade offers...</span>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No active promotional offers found</p>
              <p className="text-xs text-slate-400">Try selecting another pharmaceutical company or clearing filters.</p>
            </div>
          ) : (
            filteredOffers.map((offer) => {
              const med = offer.medicine;
              const isClaimed = claimedOfferId === offer.id;
              const isFreeGoods = offer.schemeType === "BUY_X_GET_Y_FREE";

              return (
                <div
                  key={offer.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-200 shadow-2xs hover:shadow-xs transition-all space-y-3"
                >
                  {/* Top row: Company & Scheme Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {offer.companyName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900">
                        {med ? med.brandName : offer.title}
                      </h3>
                      {med && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          {med.genericName} • {med.strength} ({med.dosageForm})
                        </p>
                      )}
                    </div>

                    {/* Scheme Highlight Pill */}
                    <div className="flex flex-col items-end gap-1">
                      {isFreeGoods ? (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          <span>{offer.minQualifyingQty}+{offer.bonusQty} FREE</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{offer.discountPercent}% OFF</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Valid to: {new Date(offer.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>

                  {/* Packaging & Pricing Info */}
                  {med && (
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Packaging</span>
                        <span className="font-bold text-slate-800">
                          {med.stripsPerBox}×{med.piecesPerStrip} ({med.stripsPerBox * med.piecesPerStrip}s)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Box TP</span>
                        <span className="font-black text-teal-700">৳{med.boxTradePrice}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Box MRP</span>
                        <span className="font-bold text-slate-700">৳{med.boxMrp}</span>
                      </div>
                    </div>
                  )}

                  {/* Offer Description & Action Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 line-clamp-1">
                      {offer.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleClaim(offer)}
                      disabled={isClaimed}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                        isClaimed
                          ? "bg-emerald-600 text-white"
                          : "bg-[#139485] hover:bg-teal-700 text-white"
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Claim Deal ({offer.minQualifyingQty} {offer.qualifyingUnit}s)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-semibold">
            All bonus pieces and slab discounts are automatically computed at multi-company checkout.
          </p>
        </div>

      </div>
    </div>
  );
};
