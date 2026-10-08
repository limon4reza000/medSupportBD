"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { NotificationMenu } from "@/components/layout/NotificationMenu";
import { HelpDropdown } from "@/components/layout/HelpDropdown";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { MedSupportLogo } from "@/components/common/MedSupportLogo";

export const AppNavbar: React.FC = () => {
  const {
    setIsSearchOpen,
    setIsMobileNavOpen,
    isOnline,
    setIsOnline,
    offlineQueueCount,
    syncOfflineQueue,
  } = useApp();

  const toggleOfflineSimulation = () => {
    setIsOnline(!isOnline);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#065F52] backdrop-blur-md border-b border-[#DDE8E3]/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] md:h-[72px] gap-2 sm:gap-3">
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-[2px] group">
              <MedSupportLogo className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform shrink-0" />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base sm:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    MedSupply <span className="text-[#10B981]">BD</span>
                  </span>
                </div>
                <span className="hidden lg:block text-[10px] text-emerald-100/70 font-medium tracking-wide">
                  Smart Pharmacy Management System
                </span>
              </div>
            </Link>
          </div>

          {/* =================================================================== */}
          {/* CENTER SECTION: Search Bar (Tablet / Desktop)                        */}
          {/* =================================================================== */}
          <div className="hidden md:flex flex-1 min-w-0 max-w-md mx-2 sm:mx-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-[#044a40] hover:bg-[#033b33] border border-[#DDE8E3]/30 text-emerald-100/80 hover:text-white transition-all shadow-inner group text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <Search className="w-4 h-4 text-[#10B981] group-hover:text-emerald-300 shrink-0" />
                <span className="truncate font-medium">Search Medicines (Brand/Generic)</span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-emerald-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* =================================================================== */}
          {/* RIGHT SECTION: POS Shortcut | Lang Toggle | Online | Notifs | Menu  */}
          {/* =================================================================== */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Quick POS Terminal Button */}
            <Link
              href="/pos"
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              title="Daily Sales POS Counter"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">POS Sales</span>
            </Link>


            {/* Offline / Online Status Badge & Toggle */}
            <button
              onClick={toggleOfflineSimulation}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isOnline
                  ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/25"
                  : "bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30 animate-pulse"
              }`}
              title={isOnline ? "Online (Click to simulate offline)" : "Offline Mode (Click to simulate online)"}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px]">Offline</span>
                  {offlineQueueCount > 0 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        syncOfflineQueue();
                      }}
                      className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black hover:bg-amber-300"
                      title="Sync Queued Items"
                    >
                      Sync ({offlineQueueCount})
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search medicines"
              title="Search medicines"
              className="md:hidden p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              <Search className="w-5 h-5 stroke-[2.2] text-[#10B981]" />
            </button>

            {/* Help / Support Dropdown */}
            <HelpDropdown />

            {/* Notification Bell Dropdown */}
            <NotificationMenu />

            {/* User Profile Avatar Dropdown */}
            <ProfileDropdown />

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation drawer"
              className="p-1.5 sm:p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors focus:outline-none border border-[#DDE8E3]/20 bg-[#044a40]"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
