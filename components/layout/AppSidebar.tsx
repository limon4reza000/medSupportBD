"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  Truck,
  User,
  Users,
  BarChart3,
  DollarSign,
  Settings,
  Headphones,
  ChevronRight,
  LogOut,
  Globe,
  ShieldCheck,
  Gift,
  AlertTriangle,
  PackageCheck,
  Layers,
  Factory,
  Store,
  Briefcase,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

// Custom SVG matching the 3-connected-nodes icon for Medicine Stock
const MedicineStockIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="5.5" r="2.5" />
    <circle cx="6.5" cy="17" r="2.5" />
    <circle cx="17.5" cy="17" r="2.5" />
    <path d="M12 8v3.5m0 0l-3.5 3m3.5-3l3.5 3" />
  </svg>
);

// Custom SVG matching the medical bag / briefcase with cross for MR Portal
const MRPortalIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="6" width="18" height="15" rx="3" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 10.5v5" />
    <path d="M9.5 13h5" />
  </svg>
);

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentPharmacy, language, setLanguage, currentUser } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  // Role-Aware Navigation Generation
  const getNavItems = () => {
    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return [
          { label: "Governance Dashboard", href: "/", icon: LayoutGrid },
          { label: "RBAC Security Matrix", href: "/admin", icon: ShieldCheck },
          { label: "Medicine Catalog Master", href: "/inventory", icon: MedicineStockIcon },
          { label: "National Analytics & BI", href: "/reports", icon: BarChart3 },
          { label: "User Access Directory", href: "/users", icon: Users },
        ];

      case UserRole.PHARMA_COMPANY:
        return [
          { label: "Manufacturer HQ", href: "/", icon: LayoutGrid },
          { label: "National Catalog (41k+)", href: "/inventory", icon: MedicineStockIcon },
          { label: "Trade Bonus Schemes", href: "/trade-offers", icon: Gift },
          { label: "Batch Recalls & QA", href: "/inventory/batches", icon: AlertTriangle },
          { label: "Distributor Network", href: "/distributor-orders", icon: Truck },
          { label: "Production Demand BI", href: "/reports", icon: BarChart3 },
        ];

      case UserRole.DISTRIBUTOR:
      case UserRole.DEPOT_MANAGER:
        return [
          { label: "Depot Command", href: "/", icon: LayoutGrid },
          { label: "Wholesale Orders Queue", href: "/orders", icon: PackageCheck },
          { label: "FEFO Batch Stock", href: "/inventory/batches", icon: MedicineStockIcon },
          { label: "Pharmacy Due Ledger", href: "/customer-due", icon: DollarSign },
          { label: "Depot Logistics & Hub", href: "/depot", icon: Truck },
          { label: "Staff & Payroll", href: "/employees", icon: Users },
          { label: "Expenses Tracking", href: "/expenses", icon: DollarSign },
          { label: "Depot Reports & BI", href: "/reports", icon: BarChart3 },
        ];

      case UserRole.SALES_REP:
        return [
          { label: "Order Cutting Terminal", href: "/", icon: ShoppingCart },
          { label: "Assigned Pharmacies", href: "/pharmacies", icon: User },
          { label: "Route Visits & Target", href: "/mr-portal", icon: MRPortalIcon },
          { label: "Medicine Stock Search", href: "/inventory", icon: MedicineStockIcon },
          { label: "My Placed Orders", href: "/my-orders", icon: Truck },
        ];

      case UserRole.PHARMACY_OWNER:
      default:
        return [
          { label: "Dashboard", href: "/", icon: LayoutGrid },
          { label: "Sales POS", href: "/pos", icon: ShoppingCart },
          { label: "Medicine Stock", href: "/inventory", icon: MedicineStockIcon },
          { label: "Company Orders", href: "/distributor-orders", icon: Truck },
          { label: "Customer Due", href: "/customer-due", icon: User },
          { label: "Staff & Payroll", href: "/employees", icon: Users },
          { label: "Reports & BI", href: "/reports", icon: BarChart3 },
          { label: "Expenses", href: "/expenses", icon: DollarSign },
          { label: "MR Portal", href: "/mr-portal", icon: MRPortalIcon },
        ];
    }
  };

  const navItems = getNavItems();

  const secondaryNavItems = [
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/support", icon: Headphones },
  ];

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    if (href === "/inventory") {
      return pathname.startsWith("/inventory") || pathname.startsWith("/medicines");
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[270px] shrink-0 h-screen sticky top-0 bg-gradient-to-b from-[#00382b] via-[#002b21] to-[#00221a] text-white border-r border-[#01382b] select-none z-30 overflow-y-auto scrollbar-none relative">
      {/* Top right ambient leaf silhouette illustration */}
      <div className="absolute top-0 right-0 w-36 h-32 pointer-events-none overflow-hidden select-none">
        <svg viewBox="0 0 140 120" fill="none" className="w-full h-full text-emerald-400/20">
          <path d="M140 0 C105 20 85 55 95 105 C115 70 128 35 140 0 Z" fill="currentColor" />
          <path d="M140 25 C115 50 100 85 110 120 C125 90 133 60 140 25 Z" fill="currentColor" opacity="0.6" />
          <path d="M115 0 C88 20 72 50 82 85 C100 55 110 25 115 0 Z" fill="currentColor" opacity="0.4" />
        </svg>
      </div>

      {/* Brand Header */}
      <div className="p-4 pt-5 pb-3 flex items-center gap-3 relative z-10 border-b border-emerald-900/30">
        <img
          src="/images/sidebar-logo.png"
          alt="MedSupplyBD"
          className="w-11 h-11 rounded-2xl object-contain shrink-0 shadow-lg shadow-emerald-950/60"
        />

        <div className="flex flex-col min-w-0">
          <span className="font-bold text-[14px] text-white tracking-tight leading-snug truncate">
            {currentUser.organizationName || currentPharmacy?.tradeName || "MedSupplyBD Network"}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 tracking-wider truncate">
              {currentUser.badge || currentUser.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation List */}
      <div className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto scrollbar-none relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#01543e] via-[#026c52] to-[#014837] text-white border border-emerald-400/30 shadow-[0_4px_16px_rgba(2,108,82,0.35)]"
                  : "text-emerald-100/80 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {/* Neon Mint glowing active capsule bar on the left */}
              {isActive && (
                <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full bg-[#34d399] shadow-[0_0_12px_#34d399,0_0_20px_rgba(52,211,153,0.7)]" />
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? "bg-emerald-500/25 border border-emerald-400/30 text-[#34d399]"
                      : "bg-[#00382b]/90 border border-emerald-500/15 text-[#34d399] group-hover:bg-[#014837] group-hover:border-emerald-400/30 group-hover:text-emerald-200"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <span
                  className={`text-[13px] truncate ${
                    isActive ? "font-bold text-white" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive
                    ? "text-emerald-300"
                    : "text-emerald-400/40 group-hover:text-emerald-300 group-hover:translate-x-0.5"
                }`}
              />
            </Link>
          );
        })}

        {/* Section Divider */}
        <div className="my-2.5 mx-1 border-t border-emerald-800/25" />

        {/* Secondary Nav Items */}
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#01543e] via-[#026c52] to-[#014837] text-white border border-emerald-400/30 shadow-[0_4px_16px_rgba(2,108,82,0.35)]"
                  : "text-emerald-100/80 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? "bg-emerald-500/25 border border-emerald-400/30 text-[#34d399]"
                      : "bg-[#00382b]/90 border border-emerald-500/15 text-[#34d399] group-hover:bg-[#014837] group-hover:border-emerald-400/30 group-hover:text-emerald-200"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <span
                  className={`text-[13px] truncate ${
                    isActive ? "font-bold text-white" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive
                    ? "text-emerald-300"
                    : "text-emerald-400/40 group-hover:text-emerald-300 group-hover:translate-x-0.5"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer: Language Toggle + Logout Button */}
      <div className="p-3 border-t border-emerald-800/30 bg-[#00241b]/90 space-y-2 relative z-10">
        {/* Language Toggle (Bangla / English) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-between w-full px-3 py-2 rounded-2xl bg-[#00382b]/90 hover:bg-[#014837] text-emerald-100/90 hover:text-white text-xs font-bold transition-all border border-emerald-600/30 shadow-sm group"
          title={`Switch to ${language === "en" ? "Bangla" : "English"}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/15 text-[#34d399] border border-emerald-400/20">
              <Globe className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </div>
            <span>Language / ভাষা</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-[#34d399] text-[11px] font-black border border-emerald-400/30">
            <span>{language === "en" ? "বাং BN" : "Eng EN"}</span>
          </div>
        </button>

        {/* Logout Button */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all border border-rose-500/25 shadow-sm group"
          title="Sign out of platform session"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-500/15 text-rose-300 border border-rose-400/20 group-hover:scale-105 transition-transform">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span>Logout / সাইন আউট</span>
        </Link>
      </div>
    </aside>
  );
};
