"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  Truck,
  Package,
  Layers,
  Sparkles,
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ArrowRight,
  TrendingUp,
  Tag,
  Snowflake,
  ExternalLink,
} from "lucide-react";
import {
  IDistributorSearchResult,
  IDistributorMedicineInventory,
  PackagingUnit,
} from "@/types/domain";
import { useApp } from "@/lib/context/AppContext";

interface DistributorDetailModalProps {
  distributorData: IDistributorSearchResult | null;
  onClose: () => void;
  onRequestRoute: () => void;
}

export const DistributorDetailModal: React.FC<DistributorDetailModalProps> = ({
  distributorData,
  onClose,
  onRequestRoute,
}) => {
  const router = useRouter();
  const { addToCart } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "inventory">("overview");
  const [inventory, setInventory] = useState<IDistributorMedicineInventory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, number>>({});
  const [orderQty, setOrderQty] = useState<Record<string, number>>({});

  const distributor = distributorData?.distributor;

  // Load inventory when tab switches to inventory
  useEffect(() => {
    if (!distributor) return;

    if (activeTab === "inventory" || distributorData?.targetMedicineStock) {
      setIsLoadingInventory(true);
      fetch(
        `/api/distributors/${distributor.id}/inventory?search=${encodeURIComponent(
          searchQuery
        )}&limit=30`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.inventory) {
            setInventory(data.inventory);
          }
        })
        .catch((err) => console.error("Error loading distributor inventory:", err))
        .finally(() => setIsLoadingInventory(false));
    }
  }, [distributor?.id, activeTab, searchQuery, distributorData?.targetMedicineStock]);

  if (!distributorData || !distributor) return null;

  const handleQtyChange = (medicineId: string, delta: number, minQty: number = 1) => {
    setOrderQty((prev) => {
      const current = prev[medicineId] || minQty;
      const next = Math.max(minQty, current + delta);
      return { ...prev, [medicineId]: next };
    });
  };

  const handleAddToCart = (item: IDistributorMedicineInventory) => {
    const qty = orderQty[item.medicineId] || item.minOrderQtyBoxes || 1;
    addToCart({
      medicineId: item.medicineId,
      orderedUnit: PackagingUnit.BOX,
      orderedQty: qty,
    });

    setAddedItemIds((prev) => ({ ...prev, [item.medicineId]: qty }));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = { ...prev };
        delete next[item.medicineId];
        return next;
      });
    }, 2500);
  };

  const handleOrderAndCheckout = (item: IDistributorMedicineInventory) => {
    handleAddToCart(item);
    onClose();
    router.push("/cart");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#01382a] via-[#025540] to-emerald-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#01382a] flex items-center justify-center shadow-lg font-black text-2xl shrink-0">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {distributor.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#01382a] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>DGDA Verified Depot</span>
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white">{distributor.companyName}</span>
                <span>&bull;</span>
                <span>Code: {distributor.code}</span>
                <span>&bull;</span>
                <span className="text-emerald-300">⭐ {distributor.rating} ({distributor.onTimeDeliveryRate}% On-Time)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Depot Profile &amp; Route</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "inventory"
                ? "border-emerald-700 text-emerald-950 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Medicine Inventory &amp; Trade Prices</span>
            {inventory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {inventory.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              
              {/* Distance & Travel Metrics Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                      <span>{distributorData.distanceRoadKm} km by Road</span>
                      <span className="text-xs font-normal text-slate-500">
                        (~{distributorData.estimatedDriveTimeMinutes} mins drive)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Straight-line geodesic distance: <strong>{distributorData.distanceStraightKm} km</strong> &bull; Coverage limit: <strong>{distributor.coverageRadiusKm} km</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onRequestRoute();
                      onClose();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#01382a] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Show Map Route</span>
                  </button>
                </div>
              </div>

              {/* Target Searched Medicine Card if searched */}
              {distributorData.targetMedicineStock && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-300/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                        Matched Medicine Search
                      </span>
                      <span className="font-black text-sm text-emerald-950">
                        {distributorData.targetMedicineStock.brandName} ({distributorData.targetMedicineStock.strength})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800">
                      {distributorData.targetMedicineStock.manufacturer}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Available Stock</span>
                      <span className="font-black text-emerald-800 text-sm">
                        {distributorData.targetMedicineStock.availableStockBoxes} Boxes
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({distributorData.targetMedicineStock.availableStockPieces} pcs)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">B2B Trade Price</span>
                      <span className="font-black text-slate-900 text-sm">
                        ৳{distributorData.targetMedicineStock.tradePricePerBox}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ৳{distributorData.targetMedicineStock.tradePricePerPiece} / piece
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Maximum Retail (MRP)</span>
                      <span className="font-bold text-slate-700 text-sm">
                        ৳{distributorData.targetMedicineStock.mrpPerBox}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Save ৳{(distributorData.targetMedicineStock.mrpPerBox - distributorData.targetMedicineStock.tradePricePerBox).toFixed(1)}/box
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 block">Trade Bonus</span>
                      {distributorData.targetMedicineStock.activeOffer ? (
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                          🎁 {distributorData.targetMedicineStock.activeOffer.title}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Standard Trade Terms</span>
                      )}
                    </div>
                  </div>

                  {/* Direct Add to Order */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Order Quantity:</span>
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => handleQtyChange(distributorData.targetMedicineStock!.medicineId, -1)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-xs">
                          {orderQty[distributorData.targetMedicineStock.medicineId] || 1} Box
                        </span>
                        <button
                          onClick={() => handleQtyChange(distributorData.targetMedicineStock!.medicineId, 1)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(distributorData.targetMedicineStock!)}
                        className="px-4 py-2 rounded-xl bg-white border border-emerald-600 text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>
                          {addedItemIds[distributorData.targetMedicineStock.medicineId]
                            ? "Added to Cart!"
                            : "Add to Cart"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleOrderAndCheckout(distributorData.targetMedicineStock!)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Place B2B Order Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Logistics & Address Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Verified Warehouse Address</span>
                  </h4>
                  <p className="text-slate-700 font-medium">{distributor.address}</p>
                  <p className="text-slate-500 text-[11px]">
                    Thana: {distributor.thana} &bull; District: {distributor.district} &bull; Region: {distributor.region}
                  </p>
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{distributor.contactNo}</span>
                    </div>
                    {distributor.email && (
                      <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{distributor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>Delivery Policies &amp; Service Coverage</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-700 text-[11px]">
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Same-Day Order Cutoff:</span>
                      <span className="font-bold text-emerald-800">{distributor.sameDayCutoffTime}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Operating Hours:</span>
                      <span className="font-bold text-slate-800">{distributor.operatingHours}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Minimum Order Amount (MOQ):</span>
                      <span className="font-bold text-slate-800">৳{distributor.minOrderAmount.toLocaleString()}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Cold-Chain Storage Available:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Snowflake className="w-3 h-3" /> Yes (2°C - 8°C)
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Express Delivery (2 Hours):</span>
                      <span className="font-bold text-slate-800">
                        {distributor.expressDeliveryAvailable ? "Available" : "Standard Transit"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service Areas Pill Tags */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Designated Delivery Thanas ({distributor.serviceDistricts.length} Zones):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {distributor.serviceDistricts.map((zone, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700 font-medium"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INVENTORY BROWSER */}
          {activeTab === "inventory" && (
            <div className="space-y-3">
              {/* Inventory Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medicines, generics, or strengths in this depot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 bg-slate-50/50"
                />
              </div>

              {isLoadingInventory ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span>Loading distributor inventory...</span>
                </div>
              ) : inventory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No medicines found matching &quot;{searchQuery}&quot; in this distributor depot.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto pr-1">
                  {inventory.map((item) => (
                    <div
                      key={item.medicineId}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs text-slate-900">
                            {item.brandName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.strength}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                            {item.dosageForm}
                          </span>
                          {item.activeOffer && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              🎁 Offer
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.genericName} &bull; {item.manufacturer}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.packagingDesc} &bull; Next Batch Exp: {item.nextBatchExpiry}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="font-black text-xs text-slate-900">
                            ৳{item.tradePricePerBox} / Box
                          </div>
                          <div className="text-[10px] text-slate-500">
                            MRP ৳{item.mrpPerBox}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-700">
                            {item.availableStockBoxes} Boxes In Stock
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>
                            {addedItemIds[item.medicineId] ? "Added!" : "Add"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-medium text-[11px]">
              Authorized B2B Trade Pricing &bull; Batch FEFO Allocation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                router.push("/cart");
              }}
              className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#01382a] text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-300" />
              <span>Go to Checkout</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
