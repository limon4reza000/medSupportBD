"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Factory,
  Boxes,
  Truck,
  TrendingUp,
  Award,
  AlertTriangle,
  Gift,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Eye,
  Calendar,
  Building2,
  DollarSign,
  Activity,
  AlertOctagon,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit, TradeSchemeType } from "@/types/domain";

export const PharmaCompanyDashboard: React.FC = () => {
  const {
    medicines,
    batches,
    offers,
    currentUser,
    organizations,
    batchRecalls,
    orders,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SCHEMES" | "RECALLS" | "DISTRIBUTORS">("OVERVIEW");
  const [schemeCreatedSuccess, setSchemeCreatedSuccess] = useState(false);
  const [newSchemeTitle, setNewSchemeTitle] = useState("");
  const [newSchemeMedicine, setNewSchemeMedicine] = useState(medicines[0]?.id || "");
  const [newSchemeBuyQty, setNewSchemeBuyQty] = useState(10);
  const [newSchemeBonusQty, setNewSchemeBonusQty] = useState(1);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);

  // Filter distributors
  const authorizedDistributors = organizations.filter((o) => o.type === "DISTRIBUTOR");

  // Company SKUs
  const companySkus = medicines.slice(0, 15);
  const activeOffers = offers.filter((o) => o.isActive);

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    setSchemeCreatedSuccess(true);
    setIsSchemeModalOpen(false);
    setTimeout(() => setSchemeCreatedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Manufacturer HQ Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white p-6 rounded-3xl shadow-lg border border-indigo-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FB923C] text-white flex items-center gap-1 shadow-sm">
              <Factory className="w-3.5 h-3.5" /> Manufacturer HQ Portal
            </span>
            <span className="text-xs text-indigo-200 font-medium">
              {currentUser.organizationName || "Square Pharmaceuticals PLC"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Sales & Supply Chain Command
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 max-w-2xl leading-relaxed">
            Manage national product catalog master, formulate promotional trade bonuses, track depot distribution pipelines, and dispatch regulatory batch recalls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => setIsSchemeModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs transition-all flex items-center gap-2 shadow-md hover:scale-105"
          >
            <Gift className="w-4 h-4" />
            <span>Launch Trade Scheme</span>
          </button>
          <Link
            href="/inventory"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <Boxes className="w-4 h-4 text-indigo-200" />
            <span>National Catalog (41k+)</span>
          </Link>
        </div>
      </div>

      {schemeCreatedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>New Trade Scheme broadcasted successfully to all authorized depots and MPOs nationwide!</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5">
        
        {/* Active SKUs */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Catalog SKUs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            41,302
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            DGDA Approved DAR Formulations
          </div>
        </div>

        {/* Authorized Depots */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Authorized Depots</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {authorizedDistributors.length + 16} Depots
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Covering 8 Divisions Nationwide
          </div>
        </div>

        {/* Trade Schemes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Trade Bonuses</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {activeOffers.length} Campaigns
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            e.g. Napa 10+1, Seclo 5% Slab
          </div>
        </div>

        {/* Batch Recalls & Quality */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recall Integrity</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {batchRecalls.filter((r) => r.status === "ACTIVE_RECALL").length} Lot Flagged
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            Quarantine active at Tejgaon depot
          </div>
        </div>

      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "OVERVIEW"
              ? "bg-[#025540] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Product Portfolio & Demand
        </button>
        <button
          onClick={() => setActiveTab("SCHEMES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "SCHEMES"
              ? "bg-[#025540] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Trade Schemes & Schemes ({activeOffers.length})
        </button>
        <button
          onClick={() => setActiveTab("DISTRIBUTORS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "DISTRIBUTORS"
              ? "bg-[#025540] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Authorized Distributors
        </button>
        <button
          onClick={() => setActiveTab("RECALLS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "RECALLS"
              ? "bg-rose-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Batch Recalls ({batchRecalls.length})
        </button>
      </div>

      {/* Tab 1: Product Portfolio */}
      {activeTab === "OVERVIEW" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Key Pharmaceutical Formulations & Factory Pricing
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Trade Prices (TP), Maximum Retail Prices (MRP), and packaging conversions.
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Full 41,302 Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Brand & Generic</th>
                  <th className="px-4 py-3.5">Dosage & Strength</th>
                  <th className="px-4 py-3.5">Packaging Ratios</th>
                  <th className="px-4 py-3.5">Base TP / Piece</th>
                  <th className="px-4 py-3.5">Box MRP</th>
                  <th className="px-4 py-3.5">DAR Registration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companySkus.map((med) => {
                  const piecesPerBox = med.piecesPerStrip * med.stripsPerBox;
                  const boxMrp = (med.mrpPerPiece * piecesPerBox).toFixed(2);

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{med.brandName}</div>
                        <div className="text-[11px] text-slate-500 italic">{med.genericName}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{med.strength}</span>
                        <div className="text-[10px] text-slate-500 uppercase">{med.dosageForm}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {med.stripsPerBox} Strips × {med.piecesPerStrip} Pcs ({piecesPerBox} Pcs/Box)
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">
                        ৳{med.tradePricePerPiece.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        ৳{boxMrp}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {med.darNo || "DAR-APPROVED"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Trade Schemes */}
      {activeTab === "SCHEMES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900">
                    {offer.schemeType.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active Campaign</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {offer.title}
                </h3>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Threshold:</span>
                    <span className="font-bold text-slate-900">{offer.minQualifyingQty} {offer.qualifyingUnit}</span>
                  </div>
                  {offer.bonusQty > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Free Bonus:</span>
                      <span>+{offer.bonusQty} {offer.bonusUnit}</span>
                    </div>
                  )}
                  {offer.discountPercent && (
                    <div className="flex justify-between text-blue-700 font-bold">
                      <span>Cash Discount:</span>
                      <span>{offer.discountPercent}% Off</span>
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Validity:</span>
                  <span className="font-medium text-slate-700">{String(offer.startDate)} to {String(offer.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Authorized Distributors */}
      {activeTab === "DISTRIBUTORS" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">
            Authorized Regional Depots & Stockist Network
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorizedDistributors.map((dist) => (
              <div key={dist.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-sm text-slate-900">{dist.name}</div>
                  <div className="text-xs text-slate-600 font-mono">{dist.code} • {dist.address}</div>
                  <div className="text-[11px] text-slate-500">Contact: {dist.contactPhone}</div>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Authorized Depot
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Cold-Chain Ready
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Batch Recalls */}
      {activeTab === "RECALLS" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-rose-950 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <span>DGDA Quality Assurance & Batch Recall Register</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediate warehouse lock and quarantine enforcement for compromised stability batches.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {batchRecalls.map((recall) => (
              <div
                key={recall.id}
                className={`p-4 rounded-2xl border ${
                  recall.status === "ACTIVE_RECALL"
                    ? "bg-rose-50/60 border-rose-300"
                    : "bg-slate-50 border-slate-200"
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {recall.recallNoticeNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        recall.severityLevel === "CRITICAL"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {recall.severityLevel}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {recall.brandName} (Batch: {recall.batchNumber})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{recall.reason}</p>
                  <div className="text-[11px] text-slate-500">
                    DGDA Ref: {recall.dgdaNoticeReference} • Issued: {recall.issueDate}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      recall.status === "ACTIVE_RECALL"
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {recall.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheme Creator Modal */}
      {isSchemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-700" />
                <span>Create Trade Scheme (e.g. 10+1)</span>
              </h3>
              <button
                onClick={() => setIsSchemeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scheme Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Super Bonus: 10+1 Box"
                  value={newSchemeTitle}
                  onChange={(e) => setNewSchemeTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Medicine</label>
                <select
                  value={newSchemeMedicine}
                  onChange={(e) => setNewSchemeMedicine(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  {medicines.slice(0, 10).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} ({m.genericName} - {m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Buy Boxes</label>
                  <input
                    type="number"
                    min="1"
                    value={newSchemeBuyQty}
                    onChange={(e) => setNewSchemeBuyQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Get Free Boxes</label>
                  <input
                    type="number"
                    min="1"
                    value={newSchemeBonusQty}
                    onChange={(e) => setNewSchemeBonusQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsSchemeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#025540] hover:bg-[#014030] text-white font-bold text-xs shadow-md"
                >
                  Broadcast Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
