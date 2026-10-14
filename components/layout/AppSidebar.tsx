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
  Smartphone,
  MapPin,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

// Custom SVG matching the 3-connected-nodes icon for Medicine Stock
const MedicineStockIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
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
const MRPortalIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
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
  const { currentPharmacy, language, setLanguage, currentUser, setIsGetAppOpen } = useApp();

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
          { label: "Nearby Depots (Map)", href: "/distributors", icon: MapPin },
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
    <aside className="hidden lg:flex flex-col w-[275px] shrink-0 h-screen sticky top-0 bg-white text-slate-800 border-r border-slate-200/80 select-none z-30 overflow-y-auto scrollbar-none relative">
      {/* Brand Header with Large Prominent Logo */}
      <div className="px-5 pt-6 pb-4 mb-1">
        <Link href="/" className="flex items-center group" title="MedGo Home">
          <img
            src="/images/medgo-logo.png"
            alt="MedGo"
            className="h-12 sm:h-14 w-auto max-w-[245px] object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
          />
        </Link>
      </div>

      {/* Primary Navigation List (Larger Icons & Text) */}
      <div className="flex-1 px-3.5 py-2 space-y-1.5 overflow-y-auto scrollbar-none relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-[#eff6ff] text-[#0080ff] font-extrabold shadow-2xs border border-blue-100"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-[#0080ff] stroke-[2.5]" : "text-slate-400 group-hover:text-slate-700 stroke-[2.2]"
                  }`}
                />
                <span className="text-[15px] sm:text-[15.5px] truncate tracking-tight">{item.label}</span>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-[#0080ff]" : "text-slate-300 group-hover:text-slate-500"
                }`}
              />
            </Link>
          );
        })}

        {/* Section Divider */}
        <div className="my-2.5 mx-1 border-t border-slate-200/80" />

        {/* Secondary Nav Items */}
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-[#eff6ff] text-[#0080ff] font-extrabold shadow-2xs border border-blue-100"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-[#0080ff] stroke-[2.5]" : "text-slate-400 group-hover:text-slate-700 stroke-[2.2]"
                  }`}
                />
                <span className="text-[15px] sm:text-[15.5px] truncate tracking-tight">{item.label}</span>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-[#0080ff]" : "text-slate-300 group-hover:text-slate-500"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer: Mobile App + Language Toggle + Logout Button */}
      <div className="p-3.5 border-t border-slate-200/80 bg-white space-y-2 relative z-10">
        {/* Get Mobile App Button */}
        <button
          onClick={() => setIsGetAppOpen(true)}
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#0080ff] hover:bg-[#006fe6] text-white text-sm font-bold transition-all shadow-xs group active:scale-95 cursor-pointer"
          title="Install MedSupplyBD App (PWA / Android APK)"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-100" />
            <span>Get Mobile App</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white text-[#006fe6] text-[11px] font-black uppercase tracking-wider">
            APK &bull; iOS
          </span>
        </button>

        {/* Language Toggle (Bangla / English) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold transition-all border border-slate-200/80 shadow-2xs group cursor-pointer"
          title={`Switch to ${language === "en" ? "Bangla" : "English"}`}
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-slate-500" />
            <span>Language / ভাষা</span>
          </div>
          <div className="flex items-center px-2.5 py-0.5 rounded bg-blue-50 text-[#0080ff] border border-blue-200 text-xs font-black">
            <span>{language === "en" ? "BN" : "EN"}</span>
          </div>
        </button>

        {/* Logout Button */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-600 text-sm font-bold transition-all border border-rose-200/70 shadow-2xs group"
          title="Sign out of platform session"
        >
          <LogOut className="w-4.5 h-4.5 text-rose-500" />
          <span>Logout / সাইন আউট</span>
        </Link>
      </div>
    </aside>
  );
};
