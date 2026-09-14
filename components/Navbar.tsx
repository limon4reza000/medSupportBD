"use client";

import React from "react";
import { IPharmacy } from "@/types/domain";
import {
  Pill,
  Sparkles,
  Layers,
  TrendingUp,
  CreditCard,
  Building2,
  ChevronDown,
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

  const navItems = [
    { id: "order-cutting", label: "Order Cutting", icon: Pill },
    { id: "ai-slip-parser", label: "AI Slip Parser", icon: Sparkles },
    { id: "fifo-inspector", label: "FIFO Batches", icon: Layers },
    { id: "ai-forecast", label: "Demand Forecast", icon: TrendingUp },
    { id: "generic-substitute", label: "Generics", icon: Pill },
    { id: "credit-ledger", label: "Ledger", icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#025540]/95 backdrop-blur-md border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* 1. Left: Brand Logo & Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md">
              <Pill className="w-5 h-5 text-[#025540]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                MedSupply
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  B2B
                </span>
              </span>
            </div>
          </div>

          {/* 2. Center: Sleek Horizontal Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/10 p-1 rounded-xl border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#025540] shadow-sm font-bold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#025540]" : "text-white/80"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 3. Right: Compact Pharmacy Selector & Status */}
          <div className="flex items-center space-x-3">
            {/* Pharmacy Selector Dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
                <Building2 className="w-4 h-4 text-[#025540]" />
                <select
                  value={selectedPharmacyId}
                  onChange={(e) => onSelectPharmacy(e.target.value)}
                  className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {pharmacies.map((pharm) => (
                    <option key={pharm.id} value={pharm.id} className="text-slate-900 bg-white font-medium">
                      {pharm.tradeName} ({pharm.thana})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* Quick Credit Status Indicator */}
            {currentPharmacy && (
              <div
                className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${
                  currentPharmacy.isCreditBlocked
                    ? "bg-red-500/20 text-red-200 border-red-400/40"
                    : "bg-white/15 text-white border-white/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentPharmacy.isCreditBlocked ? "bg-red-400" : "bg-[#34d399]"}`} />
                <span>৳{(currentPharmacy.creditLimit - currentPharmacy.currentBalance).toLocaleString()} Cr</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs (Scrollable on small screens) */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-white/10 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-[#025540] font-bold shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? "text-[#025540]" : "text-white/80"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
