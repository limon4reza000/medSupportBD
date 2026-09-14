"use client";

import React from "react";
import Link from "next/link";
import {
  FileQuestion,
  Home,
  Boxes,
  ArrowLeft,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function NotFound() {
  const { setIsSearchOpen } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Premium 404 Card */}
      <div className="w-full max-w-lg premium-card p-8 text-center space-y-6">
        
        {/* Icon & 404 Badge */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-md">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-black font-mono bg-rose-100 text-rose-800 uppercase tracking-widest">
            Error 404 — Page Not Found
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Requested Pharma Resource Unavailable
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The SKU, order ID, or route URL you requested does not exist or may have been moved to another depot catalog location.
          </p>
        </div>

        {/* Quick Search Trigger */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Looking for a specific medicine?</span>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#025540] hover:bg-[#036b51] text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search (⌘K)</span>
          </button>
        </div>

        {/* Quick Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-4 py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Pharmacy Dashboard</span>
          </Link>

          <Link
            href="/products"
            className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Boxes className="w-4 h-4 text-emerald-700" />
            <span>Medicine Catalog</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          MedSupply BD • DGDA B2B Order Cutting & Inventory Platform
        </div>

      </div>

    </div>
  );
}
