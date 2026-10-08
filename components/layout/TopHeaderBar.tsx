"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, Store, Menu } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const TopHeaderBar: React.FC = () => {
  const {
    setIsSearchOpen,
    setIsMobileNavOpen,
    currentPharmacy,
    notifications,
  } = useApp();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 1;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f1f5f3]/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        
        {/* Left: Mobile Drawer Trigger + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-200/70 transition-colors shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar Input */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative flex-1 flex items-center bg-white hover:bg-slate-50/80 cursor-pointer border border-slate-200/80 rounded-2xl px-3.5 py-2.5 shadow-xs transition-all hover:border-emerald-400 group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors mr-2.5 shrink-0" />
            <input
              type="text"
              readOnly
              placeholder="Search medicines, orders, customers..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder-slate-400 outline-none cursor-pointer font-medium"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded-md border border-slate-200 ml-2">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Notifications Bell & Pharmacy Terminal Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 transition-all shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Pharmacy Store Profile Pill */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200/80 shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight">
                {currentPharmacy?.tradeName || "Green Care Pharmacy"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">
                Main Branch, Dhaka
              </span>
            </div>
          </Link>

        </div>

      </div>
    </header>
  );
};
