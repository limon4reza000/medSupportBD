"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutGrid,
  ShoppingCart,
  ShoppingBag,
  Clock,
  Receipt,
  Tag,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  Bell,
  Settings,
  Building2,
  LogOut,
  Layers,
  Truck,
  FileText,
  DollarSign,
  ChevronRight,
  LucideIcon,
  Camera,
  Pill,
  Globe,
  Headphones,
  User,
  BarChart3,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

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

interface DrawerMenuItem {
  label: string;
  href: string;
  icon: LucideIcon | React.FC<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface DrawerMenuGroup {
  title: string;
  items: DrawerMenuItem[];
}

export const HamburgerDrawer: React.FC = () => {
  const pathname = usePathname();
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    currentPharmacy,
    currentUser,
    updateUserAvatar,
    cartItemCount,
    orders,
    notifications,
    language,
    setLanguage,
  } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateUserAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const activeOrdersCount = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  ).length;

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileNavOpen]);

  if (!isMobileNavOpen) return null;

  const closeDrawer = () => setIsMobileNavOpen(false);

  const menuGroups: DrawerMenuGroup[] = [
    {
      title: "Pharmacy Operations (POS & Stock)",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutGrid },
        { label: "Sales POS", href: "/pos", icon: ShoppingCart },
        { label: "Medicine Stock", href: "/inventory", icon: MedicineStockIcon },
        { label: "Company Orders", href: "/distributor-orders", icon: Truck },
        { label: "Customer Due", href: "/customer-due", icon: User },
        { label: "Staff & Payroll", href: "/employees", icon: Users },
        { label: "Reports & BI", href: "/reports", icon: BarChart3 },
        { label: "Expenses", href: "/expenses", icon: DollarSign },
        { label: "MR Portal", href: "/mr-portal", icon: MRPortalIcon },
      ],
    },
    {
      title: "B2B Depot Procurement",
      items: [
        { label: "41,000+ Medicine List", href: "/medicines", icon: Pill, highlight: true },
        { label: "Products Catalog", href: "/products", icon: Layers },
        { label: "My Orders", href: "/my-orders", icon: Clock, badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : undefined },
        { label: "Order History", href: "/order-history", icon: FileText },
        { label: "B2B Cart", href: "/cart", icon: ShoppingBag, badge: cartItemCount > 0 ? `${cartItemCount}` : undefined },
        { label: "Trade Offers", href: "/trade-offers", icon: Tag },
        { label: "Transactions Ledger", href: "/transactions", icon: Receipt },
      ],
    },
    {
      title: "AI Procurement Tools",
      items: [
        { label: "AI Order (Slip Parser)", href: "/ai-order", icon: Sparkles, highlight: true },
        { label: "AI Insights (Forecaster)", href: "/ai-insights", icon: TrendingUp },
      ],
    },
    {
      title: "System & Administration",
      items: [
        { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "Security Center", href: "/security", icon: ShieldCheck },
        { label: "Help & Support", href: "/support", icon: Headphones },
      ],
    },
  ];

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer Panel (Right Side Slide-In with dark emerald theme) */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#00382b] via-[#002b21] to-[#00221a] h-full shadow-2xl flex flex-col z-50 text-white animate-in slide-in-from-right duration-250 border-l border-emerald-900/40">
        
        {/* Header with User Profile Section */}
        <div className="p-4 bg-gradient-to-b from-[#014838] to-[#00382b] text-white border-b border-emerald-600/20 relative">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/sidebar-logo.png"
                alt="Green Care"
                className="w-9 h-9 rounded-xl object-contain shrink-0 shadow-md"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white">
                  {currentPharmacy?.tradeName || "Green Care Pharmacy"}
                </span>
                <span className="text-[10px] font-semibold text-emerald-300/80">
                  Pharmacy & Med Store
                </span>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="mt-3 flex items-center gap-3">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload photo"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-400 shadow-md group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="truncate flex-1">
              <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-200/80 truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span className="truncate">{currentPharmacy.tradeName}</span>
              </div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/50">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-2xl text-[13px] transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#01543e] via-[#026c52] to-[#014837] text-white border border-emerald-400/30 shadow-[0_4px_16px_rgba(2,108,82,0.35)]"
                          : item.highlight
                          ? "bg-[#014232]/50 text-emerald-100 hover:bg-[#014837] border border-emerald-500/20"
                          : "text-emerald-100/80 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-[#34d399] shadow-[0_0_12px_#34d399]" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? "bg-emerald-500/25 border border-emerald-400/30 text-[#34d399]"
                              : "bg-[#00382b]/90 border border-emerald-500/15 text-[#34d399] group-hover:bg-[#014837] group-hover:border-emerald-400/30"
                          }`}
                        >
                          <Icon className="w-4 h-4 stroke-[2]" />
                        </div>
                        <span className={`truncate ${isActive ? "font-bold text-white" : "font-medium"}`}>
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981] text-emerald-950">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isActive
                              ? "text-emerald-300"
                              : "text-emerald-400/40 group-hover:text-emerald-300 group-hover:translate-x-0.5"
                          }`}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out & Language Toggle Footer */}
        {/* CRITICAL: Language button is directly above Sign Out button */}
        <div className="p-3.5 border-t border-emerald-800/30 bg-[#00241b] space-y-2">
          {/* Language Toggle Button (English / বাংলা) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-[#00382b] hover:bg-[#014837] text-emerald-100 hover:text-white text-xs font-bold transition-all border border-emerald-600/30 shadow-sm group"
            title={`Switch to ${language === "en" ? "Bangla" : "English"}`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#34d399] group-hover:rotate-12 transition-transform" />
              <span>Language / ভাষা</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-[#34d399] text-[11px] font-black border border-emerald-400/30">
              <span>{language === "en" ? "বাং BN" : "Eng EN"}</span>
            </div>
          </button>

          {/* Sign Out Button */}
          <Link
            href="/login"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-colors border border-rose-500/30 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
