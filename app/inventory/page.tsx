"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Boxes,
  Calendar,
  AlertTriangle,
  Search,
  Plus,
  Scan,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Tag,
  DollarSign,
  PackageCheck,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { IMedicine, PackagingUnit } from "@/types/domain";
import { BarcodeScannerModal } from "@/components/inventory/BarcodeScannerModal";
import { AddMedicineModal } from "@/components/inventory/AddMedicineModal";
import { AddBatchModal } from "@/components/inventory/AddBatchModal";

export default function InventoryPage() {
  const {
    medicines,
    batches,
    posSales,
    addToCart,
    createDistributorOrder,
    companies,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"ALL" | "NEAR_EXPIRY" | "LOW_STOCK" | "REORDER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState("ALL");

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [selectedMedForBatch, setSelectedMedForBatch] = useState<string | undefined>();
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  // Expiry Threshold: 90 days (3 months)
  const today = new Date();
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 3600 * 1000);

  // Near-expiry batches
  const nearExpiryBatches = useMemo(() => {
    return batches.filter((b) => {
      const exp = new Date(b.expiryDate);
      return exp <= ninetyDaysFromNow && b.availableLooseUnits > 0;
    });
  }, [batches]);

  // Medicines with near-expiry batches
  const nearExpiryMedicineIds = new Set(nearExpiryBatches.map((b) => b.medicineId));

  // Low stock threshold: < 200 loose pieces
  const lowStockMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const medBatches = batches.filter((b) => b.medicineId === m.id);
      const totalUnits = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
      return totalUnits < 200;
    });
  }, [medicines, batches]);

  // Reorder Suggestions Engine:
  // Evaluates recent sales velocity from posSales, current stock, and generates recommended boxes to reorder
  const reorderSuggestions = useMemo(() => {
    return medicines.map((m) => {
      const medBatches = batches.filter((b) => b.medicineId === m.id);
      const totalUnits = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);

      // Total sold loose pieces across recorded POS sales
      const soldUnits = posSales.reduce((acc, sale) => {
        const item = sale.items.find((it) => it.medicineId === m.id);
        return acc + (item ? item.looseUnits : 0);
      }, 0);

      // Estimated daily run rate (minimum 5 pieces/day simulation baseline)
      const dailyRunRate = Math.max(8, Math.round(soldUnits / 7 || 12));
      const daysOfSupply = totalUnits > 0 ? Math.round(totalUnits / dailyRunRate) : 0;

      const boxPieces = m.piecesPerStrip * m.stripsPerBox;
      // Target 30-day buffer
      const targetPieces = dailyRunRate * 30;
      const deficitPieces = Math.max(0, targetPieces - totalUnits);
      const suggestedBoxes = Math.max(5, Math.ceil(deficitPieces / boxPieces));

      return {
        medicine: m,
        currentStockUnits: totalUnits,
        dailyRunRate,
        daysOfSupply,
        suggestedBoxes,
        boxPieces,
        estimatedOrderCost: suggestedBoxes * (m.tradePricePerPiece * boxPieces),
      };
    }).sort((a, b) => a.daysOfSupply - b.daysOfSupply);
  }, [medicines, batches, posSales]);

  // Filtered medicines list
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.brandName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q);

      const matchesCompany =
        selectedCompanyFilter === "ALL" || m.manufacturer.includes(selectedCompanyFilter);

      if (!matchesSearch || !matchesCompany) return false;

      if (activeTab === "NEAR_EXPIRY") return nearExpiryMedicineIds.has(m.id);
      if (activeTab === "LOW_STOCK") {
        const medBatches = batches.filter((b) => b.medicineId === m.id);
        const total = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
        return total < 200;
      }
      return true;
    });
  }, [medicines, batches, searchQuery, selectedCompanyFilter, activeTab, nearExpiryMedicineIds]);

  // Handle 1-click reorder to Distributor
  const handleCreateReorderToDistributor = (sug: typeof reorderSuggestions[0]) => {
    const comp = companies.find((c) => sug.medicine.manufacturer.includes(c.shortCode) || c.name.includes(sug.medicine.manufacturer)) || companies[0];
    
    createDistributorOrder({
      companyId: comp.id,
      companyName: comp.name,
      mrName: comp.mrName,
      mrPhone: comp.mrPhone,
      items: [
        {
          medicineId: sug.medicine.id,
          brandName: sug.medicine.brandName,
          strength: sug.medicine.strength,
          unit: PackagingUnit.BOX,
          orderedQty: sug.suggestedBoxes,
          tradePricePerUnit: sug.medicine.tradePricePerPiece * sug.boxPieces,
          total: sug.estimatedOrderCost,
        },
      ],
      totalAmount: sug.estimatedOrderCost,
      notes: `Smart Reorder Suggestion: Low supply (${sug.daysOfSupply} days remaining).`,
    });

    setReorderSuccessMsg(
      `Purchase Order created for ${sug.suggestedBoxes} boxes of ${sug.medicine.brandName} with ${comp.name}.`
    );
    setTimeout(() => setReorderSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#044a40] via-[#065F52] to-[#0a7a6a] p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Inventory & Lot Warehouse
            </span>
            <span className="text-xs text-emerald-100 font-mono">DGDA Compliant • FEFO Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Medicine Database & Stock Control
          </h1>
          <p className="text-xs text-emerald-100/80">
            Brand/generic directory, expiry tracking, near-expiry alerts, automated reorder suggestions, and barcode scanning.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <Scan className="w-4 h-4 text-emerald-300" />
            <span>Scan Barcode</span>
          </button>

          <button
            onClick={() => {
              setSelectedMedForBatch(undefined);
              setIsAddBatchOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Inward Batch</span>
          </button>

          <button
            onClick={() => setIsAddMedicineOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white text-[#044a40] font-black text-xs shadow-md hover:bg-slate-100 transition-all flex items-center gap-2 hover:scale-102"
          >
            <Boxes className="w-4 h-4 text-emerald-700" />
            <span>+ Add Medicine</span>
          </button>
        </div>
      </div>

      {/* KPI Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("ALL")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "ALL"
              ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SKUs in Catalog</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{medicines.length} Medicines</div>
          <div className="text-[11px] text-slate-500 mt-1">{batches.length} Active Batches Tracked</div>
        </div>

        <div
          onClick={() => setActiveTab("NEAR_EXPIRY")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "NEAR_EXPIRY"
              ? "bg-amber-50/60 border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Near Expiry Alert (&lt; 90 Days)</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-900 mt-1">
            {nearExpiryBatches.length} Batches
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {nearExpiryMedicineIds.size} SKUs need priority FEFO dispensing
          </div>
        </div>

        <div
          onClick={() => setActiveTab("LOW_STOCK")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "LOW_STOCK"
              ? "bg-rose-50/60 border-rose-500 shadow-md ring-2 ring-rose-500/20"
              : "bg-white border-slate-200/80 hover:border-rose-300"
          }`}
        >
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Low Stock Alert</span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-900 mt-1">
            {lowStockMedicines.length} SKUs
          </div>
          <div className="text-[11px] text-rose-700 font-semibold mt-1">
            Stock under safety threshold (&lt;200 pcs)
          </div>
        </div>

        <div
          onClick={() => setActiveTab("REORDER")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "REORDER"
              ? "bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-500/20"
              : "bg-white border-slate-200/80 hover:border-blue-300"
          }`}
        >
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Reorder Suggestions</span>
          </div>
          <div className="text-2xl font-black font-mono text-blue-900 mt-1">
            {reorderSuggestions.filter((r) => r.daysOfSupply <= 14).length} Urgent
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Predicted from daily sales run-rate
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {reorderSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{reorderSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Tab Controller */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Main Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-[#065F52] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Medicines ({medicines.length})
            </button>

            <button
              onClick={() => setActiveTab("NEAR_EXPIRY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "NEAR_EXPIRY"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Near Expiry Alerts ({nearExpiryBatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("LOW_STOCK")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "LOW_STOCK"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-100 text-rose-900 hover:bg-rose-200"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Low Stock Alerts ({lowStockMedicines.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("REORDER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "REORDER"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reorder Engine</span>
            </button>
          </div>

          {/* Company Dropdown Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500">Company:</span>
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Companies</option>
              <option value="Square">Square Pharma</option>
              <option value="Beximco">Beximco Pharma</option>
              <option value="Incepta">Incepta Pharma</option>
              <option value="ACME">ACME Labs</option>
              <option value="Healthcare">Healthcare Pharma</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by Brand, Generic, Formulation, or Manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: REORDER SUGGESTIONS ENGINE VIEW                              */}
      {/* =================================================================== */}
      {activeTab === "REORDER" ? (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Automated Reorder Suggestions Engine</span>
              </h3>
              <p className="text-xs text-slate-500">
                Calculated based on 7-day sales velocity and stock depletion rates. Direct order generation to company MRs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Medicine & Generic</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Current Stock</th>
                  <th className="pb-3">Run-Rate (Daily)</th>
                  <th className="pb-3">Days of Supply</th>
                  <th className="pb-3">Suggested Reorder</th>
                  <th className="pb-3">Estimated Cost</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reorderSuggestions.map((sug) => {
                  const isUrgent = sug.daysOfSupply <= 7;
                  const isModerate = sug.daysOfSupply <= 15 && !isUrgent;

                  return (
                    <tr key={sug.medicine.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-900 block">{sug.medicine.brandName}</span>
                        <span className="text-[10px] text-slate-400">{sug.medicine.genericName} ({sug.medicine.strength})</span>
                      </td>
                      <td className="py-3 text-slate-600">{sug.medicine.manufacturer}</td>
                      <td className="py-3">
                        <span className="font-mono font-bold text-slate-900">
                          {sug.currentStockUnits} pcs
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({(sug.currentStockUnits / sug.boxPieces).toFixed(1)} boxes)
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-700">~{sug.dailyRunRate} pcs/day</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUrgent
                              ? "bg-rose-100 text-rose-800"
                              : isModerate
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {sug.daysOfSupply} Days Left
                        </span>
                      </td>
                      <td className="py-3">
                        <strong className="font-mono text-blue-700 text-sm">
                          {sug.suggestedBoxes} Boxes
                        </strong>
                        <span className="text-[10px] text-slate-400 block">
                          ({sug.suggestedBoxes * sug.boxPieces} pieces)
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-900">
                        ৳{sug.estimatedOrderCost.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleCreateReorderToDistributor(sug)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1 ml-auto"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Order Now</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* TAB 2, 3, 4: MEDICINE DIRECTORY & BATCH LOTS TABLE                  */
        /* =================================================================== */
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Medicine & Strength</th>
                  <th className="pb-3">Generic Name</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Form</th>
                  <th className="pb-3">Trade Price (TP)</th>
                  <th className="pb-3">MRP (Retail)</th>
                  <th className="pb-3">Batches & Expiry</th>
                  <th className="pb-3">Total Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMedicines.map((med) => {
                  const medBatches = batches.filter((b) => b.medicineId === med.id);
                  const totalUnits = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
                  const boxPieces = med.piecesPerStrip * med.stripsPerBox;
                  const availableBoxes = (totalUnits / boxPieces).toFixed(1);

                  // Check nearest expiring batch
                  const sortedBatches = [...medBatches].sort(
                    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                  );
                  const earliestBatch = sortedBatches[0];
                  const earliestExp = earliestBatch ? new Date(earliestBatch.expiryDate) : null;
                  const isExpiringSoon = earliestExp ? earliestExp <= ninetyDaysFromNow : false;
                  const daysToExpiry = earliestExp
                    ? Math.round((earliestExp.getTime() - today.getTime()) / (1000 * 3600 * 24))
                    : 999;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-900 block">{med.brandName}</span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {med.strength}
                        </span>
                      </td>

                      <td className="py-3 text-slate-600 max-w-[160px] truncate">
                        {med.genericName}
                      </td>

                      <td className="py-3 text-slate-600">{med.manufacturer}</td>

                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {med.dosageForm}
                        </span>
                      </td>

                      <td className="py-3 font-mono font-bold text-slate-900">
                        ৳{med.tradePricePerPiece.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-normal"> / pcs</span>
                      </td>

                      <td className="py-3 font-mono font-bold text-emerald-700">
                        ৳{med.mrpPerPiece.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-normal"> / pcs</span>
                      </td>

                      <td className="py-3">
                        {earliestBatch ? (
                          <div className="space-y-0.5">
                            <div className="font-mono text-[11px] text-slate-800 font-bold">
                              {earliestBatch.batchNumber}
                            </div>
                            {isExpiringSoon ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>{daysToExpiry}d left ({new Date(earliestBatch.expiryDate).toLocaleDateString()})</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Exp: {new Date(earliestBatch.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No active lot</span>
                        )}
                      </td>

                      <td className="py-3">
                        <div className="font-mono font-black text-slate-900">
                          {totalUnits} pcs
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {availableBoxes} Boxes ({med.stripsPerBox}×{med.piecesPerStrip})
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedMedForBatch(med.id);
                              setIsAddBatchOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors"
                            title="Inward new batch lot"
                          >
                            + Batch
                          </button>

                          <Link
                            href={`/pos`}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-all"
                            title="Sell in POS"
                          >
                            POS
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isScannerOpen && <BarcodeScannerModal onClose={() => setIsScannerOpen(false)} />}
      {isAddMedicineOpen && <AddMedicineModal onClose={() => setIsAddMedicineOpen(false)} />}
      {isAddBatchOpen && (
        <AddBatchModal
          onClose={() => setIsAddBatchOpen(false)}
          defaultMedicineId={selectedMedForBatch}
        />
      )}

    </div>
  );
}
