"use client";

import React, { ReactNode } from "react";
import { AppProvider } from "@/lib/context/AppContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { HamburgerDrawer } from "@/components/layout/HamburgerDrawer";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { QuickOrderModal } from "@/components/layout/QuickOrderModal";
import Link from "next/link";
import { ShieldCheck, Headphones } from "lucide-react";
import { MedSupportLogo } from "@/components/common/MedSupportLogo";

export const RootLayoutWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-[#0F172A] selection:bg-[#10B981] selection:text-white font-sans">
        {/* Minimal Modern Sticky SaaS Navbar */}
        <AppNavbar />

        {/* Slide-In Navigation Drawer (Hamburger Triggered) */}
        <HamburgerDrawer />

        {/* Global Command Search Modal (Ctrl + K / Cmd + K) */}
        <SearchCommand />

        {/* Quick Matrix Order Modal */}
        <QuickOrderModal />

        {/* Main Application Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Premium Enterprise SaaS Footer */}
        <footer className="border-t border-[#DDE8E3] bg-[#065F52] py-8 text-xs text-emerald-100/90 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#10b981]/20">
              
              {/* Col 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-[2px]">
                  <MedSupportLogo className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" />
                  <span className="font-black text-lg tracking-tight text-white">
                    MedSupply<span className="text-emerald-400">BD</span>
                  </span>
                </div>
                <p className="text-xs text-emerald-200/70 leading-relaxed">
                  Smart Pharmaceutical Supply Network — Order Cutting, FEFO Inventory Distribution & Credit Management.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> DGDA Verified Digital Distribution
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-2">
                <div className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">Pharmacy Operations</div>
                <ul className="space-y-1.5 text-emerald-200/80">
                  <li><Link href="/pos" className="hover:text-white font-bold text-emerald-300 transition-colors">Daily Sales (POS)</Link></li>
                  <li><Link href="/inventory" className="hover:text-white transition-colors">Medicine Database & Stock</Link></li>
                  <li><Link href="/distributor-orders" className="hover:text-white transition-colors">Company / Distributor Orders</Link></li>
                  <li><Link href="/customer-due" className="hover:text-white transition-colors">Customer Due Ledger</Link></li>
                  <li><Link href="/expenses" className="hover:text-white transition-colors">Expense Tracking</Link></li>
                </ul>
              </div>

              {/* Col 3 */}
              <div className="space-y-2">
                <div className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">Staff & Analytics</div>
                <ul className="space-y-1.5 text-emerald-200/80">
                  <li><Link href="/employees" className="hover:text-white transition-colors">Employee Management</Link></li>
                  <li><Link href="/reports" className="hover:text-white transition-colors">Reports & Analytics Charts</Link></li>
                  <li><Link href="/mr-portal" className="hover:text-white transition-colors">MR Field Manager Panel</Link></li>
                  <li><Link href="/settings" className="hover:text-white transition-colors">Settings & Backup</Link></li>
                  <li><Link href="/ai-order" className="hover:text-white transition-colors">AI Slip Parser</Link></li>
                </ul>
              </div>

              {/* Col 4 */}
              <div className="space-y-3">
                <div className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">24/7 Pharma Helpline</div>
                <div className="p-3.5 rounded-xl bg-[#025540] border border-emerald-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-emerald-300" />
                    <span>Emergency Depot Dispatch</span>
                  </div>
                  <div className="text-xs text-emerald-200 font-mono">+880 1711-000222</div>
                  <div className="text-[10px] text-emerald-300/70">depot-dispatch@medsupplybd.com</div>
                </div>
              </div>

            </div>

            <div className="pt-6 text-center text-xs text-emerald-200/70">
              Copyright © {new Date().getFullYear()} medSupportBD . All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};
