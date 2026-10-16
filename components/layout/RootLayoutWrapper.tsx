"use client";

import React, { ReactNode } from "react";
import { AppProvider } from "@/lib/context/AppContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeaderBar } from "@/components/layout/TopHeaderBar";
import { HamburgerDrawer } from "@/components/layout/HamburgerDrawer";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { QuickOrderModal } from "@/components/layout/QuickOrderModal";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { GetAppModal } from "@/components/pwa/GetAppModal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import Link from "next/link";
import { ShieldCheck, Headphones } from "lucide-react";
import { MedSupportLogo } from "@/components/common/MedSupportLogo";

export const RootLayoutWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <div className="min-h-screen flex bg-[#F5F6FC] text-[#0F172A] selection:bg-[#4F46E5] selection:text-white font-sans antialiased">
        
        {/* Desktop Fixed Left Sidebar */}
        <AppSidebar />

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* Top Sticky Header */}
          <TopHeaderBar />

          {/* Slide-In Navigation Drawer (Mobile Hamburger Triggered) */}
          <HamburgerDrawer />

          {/* Global Command Search Modal (Ctrl + K / Cmd + K) */}
          <SearchCommand />

          {/* Quick Matrix Order Modal */}
          <QuickOrderModal />

          {/* PWA Install Banner & Service Worker Registrar */}
          <PwaRegister />

          {/* Network Connection Monitor & Offline Mode Banner */}
          <OfflineIndicator />

          {/* QR Code & Mobile App Download Modal */}
          <GetAppModal />

          {/* Native Mobile App Bottom Navigation Bar */}
          <MobileBottomNav />

          {/* Main Application Body */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {children}
          </main>

          {/* Enterprise SaaS Footer (Deep Royal Indigo Theme with Soft Wave Accents) */}
          <footer className="relative border-t border-[#31256A] bg-[#1E1743] py-10 text-xs text-slate-300 mt-12 overflow-hidden shadow-2xs">
            {/* Background Layer with Subtle Wave Accents on the corners */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <svg
                className="absolute left-0 bottom-0 h-full w-56 xl:w-72 pointer-events-none opacity-40"
                viewBox="0 0 120 90"
                preserveAspectRatio="none"
              >
                <path d="M0,0 C55,0 80,35 45,65 C18,85 5,95 0,95 Z" fill="#2E236C" />
                <path d="M0,15 C45,10 65,50 30,80 C12,95 0,95 0,95 Z" fill="#3B2D7E" opacity="0.85" />
                <path d="M0,95 C15,85 25,90 35,95 Z" fill="#4338CA" />
              </svg>
              <svg
                className="absolute right-0 bottom-0 h-full w-56 xl:w-72 pointer-events-none opacity-40"
                viewBox="0 0 120 90"
                preserveAspectRatio="none"
              >
                <path d="M120,0 C65,0 40,35 75,65 C102,85 115,95 120,95 Z" fill="#2E236C" />
                <path d="M120,15 C75,10 55,50 90,80 C108,95 120,95 120,95 Z" fill="#3B2D7E" opacity="0.85" />
                <path d="M120,95 C105,85 95,90 85,95 Z" fill="#4338CA" />
              </svg>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#31256A]">
                
                <div className="space-y-3">
                  <Link href="/" className="inline-block group" title="MedGo Home">
                    <img
                      src="/images/png-final.png"
                      alt="MedGo"
                      className="h-9 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                    />
                  </Link>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Smart Pharmaceutical Supply Network — Order Cutting, FEFO Inventory Distribution & Credit Management.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#241B52] border border-[#3B2D7E] text-indigo-200 text-[11px] font-bold shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#818CF8]" /> DGDA Verified Digital Distribution
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-2">
                  <div className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">Pharmacy Operations</div>
                  <ul className="space-y-1.5 text-slate-300 font-medium">
                    <li><Link href="/pos" className="hover:text-[#A5B4FC] transition-colors font-bold text-white">Daily Sales (POS)</Link></li>
                    <li><Link href="/inventory" className="hover:text-[#A5B4FC] transition-colors">Medicine Database & Stock</Link></li>
                    <li><Link href="/distributor-orders" className="hover:text-[#A5B4FC] transition-colors">Company / Distributor Orders</Link></li>
                    <li><Link href="/customer-due" className="hover:text-[#A5B4FC] transition-colors">Customer Due Ledger</Link></li>
                    <li><Link href="/expenses" className="hover:text-[#A5B4FC] transition-colors">Expense Tracking</Link></li>
                  </ul>
                </div>

                {/* Col 3 */}
                <div className="space-y-2">
                  <div className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">Staff & Analytics</div>
                  <ul className="space-y-1.5 text-slate-300 font-medium">
                    <li><Link href="/employees" className="hover:text-[#A5B4FC] transition-colors">Employee Management</Link></li>
                    <li><Link href="/reports" className="hover:text-[#A5B4FC] transition-colors">Reports & Analytics Charts</Link></li>
                    <li><Link href="/mr-portal" className="hover:text-[#A5B4FC] transition-colors">MR Field Manager Panel</Link></li>
                    <li><Link href="/settings" className="hover:text-[#A5B4FC] transition-colors">Settings & Backup</Link></li>
                    <li><Link href="/ai-order" className="hover:text-[#A5B4FC] transition-colors">AI Slip Parser</Link></li>
                  </ul>
                </div>

                {/* Col 4 */}
                <div className="space-y-3">
                  <div className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">24/7 Pharma Helpline</div>
                  <div className="p-3.5 rounded-2xl bg-[#241B52] border border-[#3B2D7E] shadow-2xs space-y-1.5 backdrop-blur-xs">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-[#818CF8]" />
                      <span>Emergency Depot Dispatch</span>
                    </div>
                    <div className="text-xs text-indigo-100 font-mono font-bold">+880 1711-000222</div>
                    <div className="text-[10px] text-slate-400 font-medium">depot-dispatch@medsupplybd.com</div>
                  </div>
                </div>

              </div>

              <div className="pt-6 text-center text-xs text-slate-400 font-medium">
                Copyright © {new Date().getFullYear()} MedGo. All rights reserved.
              </div>
            </div>
          </footer>

        </div>
      </div>
    </AppProvider>
  );
};
