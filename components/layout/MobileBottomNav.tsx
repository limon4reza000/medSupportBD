"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  Search,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const {
    cart,
    setIsSearchOpen,
    setIsQuickOrderOpen,
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.orderedQty, 0);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1E1743]/95 backdrop-blur-lg border-t border-indigo-500/20 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_25px_rgba(0,0,0,0.3)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        
        {/* 1. Home / Marketplace */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/"
              ? "text-white font-black"
              : "text-indigo-200/70 hover:text-white"
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {pathname === "/" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FB923C]" />
            )}
          </div>
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        {/* 2. 41k Medicine Directory */}
        <Link
          href="/medicines"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/medicines"
              ? "text-white font-black"
              : "text-indigo-200/70 hover:text-white"
          }`}
        >
          <div className="relative">
            <Database className="w-5 h-5" />
            {pathname === "/medicines" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FB923C]" />
            )}
          </div>
          <span className="text-[10px] font-bold">41k SKUs</span>
        </Link>

        {/* 3. Global Search (Center Action Button) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-indigo-200/70 hover:text-white transition-all active:scale-95"
          aria-label="Open Global Medicine Search"
        >
          <div className="w-10 h-10 -mt-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-[#1E1743]">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-indigo-100">Search</span>
        </button>

        {/* 4. Order Cutting POS */}
        <button
          onClick={() => setIsQuickOrderOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-indigo-200/70 hover:text-white transition-all active:scale-95"
          aria-label="Open Wholesale Order POS"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold">Order POS</span>
        </button>

        {/* 5. Cart / Wholesale B2B Basket */}
        <button
          onClick={() => setIsQuickOrderOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-indigo-200/70 hover:text-white transition-all relative active:scale-95"
          aria-label="View Wholesale Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-[#FB923C] text-white text-[9px] font-black shadow-xs animate-in zoom-in">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </button>

      </div>
    </nav>
  );
};
