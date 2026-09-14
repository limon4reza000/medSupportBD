"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, Package } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { NotificationMenu } from "@/components/layout/NotificationMenu";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

export const AppNavbar: React.FC = () => {
  const { setIsSearchOpen, setIsMobileNavOpen } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#014232]/95 backdrop-blur-md border-b border-emerald-500/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] md:h-[72px] gap-3">
          
          {/* =================================================================== */}
          {/* LEFT SECTION: Hamburger Menu (Always Visible) + SaaS Brand Logo     */}
          {/* =================================================================== */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Hamburger Button (Always visible on all screens per spec) */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation drawer"
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>

            {/* Brand Logo & Healthcare Tagline */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center text-[#01382a] shadow-md group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    MedSupply <span className="text-emerald-400">BD</span>
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-emerald-200/70 font-medium tracking-wide">
                  Smart Pharmaceutical Supply Network
                </span>
              </div>
            </Link>
          </div>

          {/* =================================================================== */}
          {/* CENTER SECTION: Search Bar (Main Feature with Ctrl + K)             */}
          {/* =================================================================== */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#025540]/80 hover:bg-[#036b51] border border-emerald-500/30 text-emerald-100/70 hover:text-white transition-all shadow-inner group text-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-emerald-300 group-hover:text-emerald-200 shrink-0" />
                <span className="truncate">Search medicines, generics, brands, SKU...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#01382a] border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold shrink-0">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* =================================================================== */}
          {/* RIGHT SECTION: Only Notification Bell + User Profile Avatar         */}
          {/* =================================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell Dropdown */}
            <NotificationMenu />

            {/* User Profile Avatar Dropdown */}
            <ProfileDropdown />
          </div>

        </div>
      </div>
    </header>
  );
};
