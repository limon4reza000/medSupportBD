"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Eye,
  Plus,
  ArrowUpDown,
  Filter,
  Package,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export default function ProductsPage() {
  const { medicines, batches, offers, addToCart } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("ALL");
  const [selectedDosage, setSelectedDosage] = useState("ALL");
  const [selectedStockStatus, setSelectedStockStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("brand-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Unique manufacturers
  const manufacturers = ["ALL", ...Array.from(new Set(medicines.map((m) => m.manufacturer)))];
  const dosageForms = ["ALL", ...Array.from(new Set(medicines.map((m) => m.dosageForm)))];

  const filteredMedicines = medicines
    .filter((med) => {
      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        med.brandName.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        med.manufacturer.toLowerCase().includes(q) ||
        med.strength.toLowerCase().includes(q);

      // Manufacturer filter
      const matchesMfg =
        selectedManufacturer === "ALL" || med.manufacturer === selectedManufacturer;

      // Dosage form filter
      const matchesDosage =
        selectedDosage === "ALL" || med.dosageForm === selectedDosage;

      // Stock filter
      const medBatches = batches.filter((b) => b.medicineId === med.id);
      const totalStock = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
      const matchesStock =
        selectedStockStatus === "ALL"
          ? true
          : selectedStockStatus === "IN_STOCK"
          ? totalStock > 200
          : totalStock <= 200;

      return matchesSearch && matchesMfg && matchesDosage && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "brand-asc") return a.brandName.localeCompare(b.brandName);
      if (sortBy === "brand-desc") return b.brandName.localeCompare(a.brandName);
      if (sortBy === "price-low") return a.tradePricePerPiece - b.tradePricePerPiece;
      if (sortBy === "price-high") return b.tradePricePerPiece - a.tradePricePerPiece;
      return 0;
    });

  const handleQuickAdd = (medicineId: string) => {
    addToCart({ medicineId, orderedUnit: PackagingUnit.BOX, orderedQty: 1 });
    setAddedMap((prev) => ({ ...prev, [medicineId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [medicineId]: false }));
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            <span>Pharmaceutical Product Catalog</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Browse verified DGDA medicines, live batch quantities, trade schemes, and packaging conversions.
          </p>
        </div>

        {/* View Mode & Stats */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-emerald-200 font-semibold hidden sm:block">
            Showing <strong>{filteredMedicines.length}</strong> of {medicines.length} items
          </div>
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-emerald-500/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white text-[#01382a] shadow-sm" : "text-emerald-200 hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white text-[#01382a] shadow-sm" : "text-emerald-200 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BAR (Pure White Card) */}
      <div className="premium-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by brand, generic, strength..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Manufacturer Filter */}
          <div>
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Manufacturers</option>
              {manufacturers.filter((m) => m !== "ALL").map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Dosage Form Filter */}
          <div>
            <select
              value={selectedDosage}
              onChange={(e) => setSelectedDosage(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Dosage Forms</option>
              {dosageForms.filter((d) => d !== "ALL").map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="brand-asc">Sort: Name (A-Z)</option>
              <option value="brand-desc">Sort: Name (Z-A)</option>
              <option value="price-low">Sort: Trade Price (Low to High)</option>
              <option value="price-high">Sort: Trade Price (High to Low)</option>
            </select>
          </div>

        </div>
      </div>

      {/* PRODUCTS DISPLAY */}
      {viewMode === "grid" ? (
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

                  {activeOffer && (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{activeOffer.title}</span>
                    </div>
                  )}
                </div>

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
                      onClick={() => handleQuickAdd(med.id)}
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
      ) : (
        /* LIST VIEW (Pure White Table Card) */
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Medicine & Generic</th>
                  <th className="py-3 px-4">Dosage / Pack</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Stock (FEFO)</th>
                  <th className="py-3 px-4">Trade Price</th>
                  <th className="py-3 px-4">Trade Scheme</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const medBatches = batches.filter((b) => b.medicineId === med.id);
                  const totalStockPieces = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
                  const activeOffer = offers.find((o) => o.medicineId === med.id && o.isActive);
                  const boxPieces = med.piecesPerStrip * med.stripsPerBox;
                  const boxTradePrice = (med.tradePricePerPiece * boxPieces).toFixed(2);
                  const isAdded = !!addedMap[med.id];

                  return (
                    <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/products/${med.id}`} className="font-bold text-slate-900 hover:text-emerald-700">
                          {med.brandName}
                        </Link>
                        <div className="text-[11px] text-slate-500">{med.genericName} • {med.strength}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>{med.dosageForm}</div>
                        <div className="text-[10px] text-slate-400">{boxPieces} pcs/box</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{med.manufacturer}</td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${totalStockPieces > 200 ? "text-emerald-700" : "text-amber-700"}`}>
                          {(totalStockPieces / boxPieces).toFixed(1)} Boxes ({totalStockPieces} pcs)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ৳{boxTradePrice}
                      </td>
                      <td className="py-3 px-4">
                        {activeOffer ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {activeOffer.title.includes("10 Boxes") ? "10+1 FREE" : "PROMO OFFER"}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/products/${med.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Link>
                        <button
                          onClick={() => handleQuickAdd(med.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#025540] hover:bg-[#036b51] text-white"
                          }`}
                        >
                          {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {isAdded ? "Added" : "+1 Box"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
