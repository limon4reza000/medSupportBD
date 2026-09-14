"use client";

import React from "react";
import { IPharmacy } from "@/types/domain";
import {
  Building2,
  ShieldCheck,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Pill,
} from "lucide-react";

interface NavbarProps {
  pharmacies: IPharmacy[];
  selectedPharmacyId: string;
  onSelectPharmacy: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  activeTab,
  setActiveTab,
}) => {
  const currentPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0];

  const creditUsedPercent = currentPharmacy
    ? Math.min(100, Math.round((currentPharmacy.currentBalance / currentPharmacy.creditLimit) * 100))
    : 0;

  return (
    <header className="border-b border-[#10b981]/40 bg-[#014232]/95 backdrop-blur-md sticky top-0 z-50 shadow-xl">
      {/* Top Banner with Brand & Profiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34d399] to-[#025540] p-0.5 flex items-center justify-center shadow-lg shadow-[#10b981]/30">
              <div className="w-full h-full bg-[#025540] rounded-[10px] flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  MedSupply <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#036b51] border border-[#34d399]/60 text-white font-bold">B2B Core</span>
                </h1>
              </div>
              <p className="text-xs text-white/90 font-medium">
                Pharma Order Cutting • Near-Expiry FIFO • Dynamic Trade Schemes
              </p>
            </div>
          </div>

          {/* Depot & Sales Rep Profile Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Depot Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#025540] border border-[#10b981]/50 text-white shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-[#6ee7b7]" />
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase font-bold">Depot</span>
                <span className="font-bold text-white">Dhaka Central (DEPOT-01)</span>
              </div>
            </div>

            {/* Sales Rep / MPO Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#025540] border border-[#10b981]/50 text-white shadow-sm">
              <UserCheck className="w-3.5 h-3.5 text-[#6ee7b7]" />
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase font-bold">Field MPO</span>
                <span className="font-bold text-white">Tanvir Ahmed (#SR-804)</span>
              </div>
            </div>

            {/* Target Pharmacy Selector */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#036b51] border border-[#34d399]/70 text-white shadow-md">
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <div>
                <label htmlFor="pharmacy-select" className="text-emerald-100 block text-[10px] uppercase font-bold">
                  Billed Pharmacy
                </label>
                <select
                  id="pharmacy-select"
                  value={selectedPharmacyId}
                  onChange={(e) => onSelectPharmacy(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-2"
                >
                  {pharmacies.map((pharm) => (
                    <option key={pharm.id} value={pharm.id} className="bg-[#014232] text-white">
                      {pharm.tradeName} ({pharm.thana})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pharmacy Credit Exposure Bar */}
        {currentPharmacy && (
          <div className="mt-3 pt-2 border-t border-[#10b981]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold">Credit Status:</span>
              {currentPharmacy.isCreditBlocked ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-900/90 text-white border border-red-400 font-bold gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-200" /> Account Blocked
                </span>
              ) : creditUsedPercent >= 80 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-900/90 text-white border border-amber-400 font-bold gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-200" /> Limit Critical ({creditUsedPercent}%)
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#025540] text-white border border-[#34d399] font-bold gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#6ee7b7]" /> Credit Approved ({creditUsedPercent}% Used)
                </span>
              )}
              <span className="text-emerald-100 font-medium">
                License: <strong className="text-white">{currentPharmacy.drugLicenseNo}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <span className="text-emerald-100">Outstanding: </span>
                <strong className="text-white font-mono">৳{currentPharmacy.currentBalance.toLocaleString()}</strong>
                <span className="text-emerald-100"> / Limit: </span>
                <strong className="text-white font-mono">৳{currentPharmacy.creditLimit.toLocaleString()}</strong>
              </div>
              <div className="w-24 sm:w-32 bg-[#01382a] h-2.5 rounded-full overflow-hidden border border-[#10b981]/50">
                <div
                  className={`h-full transition-all duration-500 ${
                    creditUsedPercent > 90
                      ? "bg-red-400"
                      : creditUsedPercent > 70
                      ? "bg-amber-300"
                      : "bg-[#34d399]"
                  }`}
                  style={{ width: `${creditUsedPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#10b981]/30">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
          {[
            { id: "order-cutting", label: "Order Cutting POS", icon: Pill },
            { id: "ai-slip-parser", label: "AI Prescription Slip Parser", icon: Pill, badge: "AI Vision" },
            { id: "fifo-inspector", label: "Near-Expiry FIFO Inspector", icon: ShieldCheck },
            { id: "ai-forecast", label: "Demand Forecaster & Spikes", icon: Pill, badge: "AI Trend" },
            { id: "generic-substitute", label: "Generic Alternatives", icon: Pill },
            { id: "credit-ledger", label: "Pharmacy Ledger & Settlement", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-[#025540] text-white border border-[#34d399] shadow-lg shadow-[#10b981]/30 font-bold"
                    : "text-emerald-100 hover:text-white hover:bg-[#025540]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#6ee7b7]" : "text-emerald-200"}`} />
                <span className="text-white">{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#10b981]/30 text-white border border-[#34d399]/50 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
