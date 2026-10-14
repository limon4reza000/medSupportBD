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
  ChevronRight,
  LucideIcon,
  Camera,
  Pill,
  Globe,
  Headphones,
  User,
  BarChart3,
  Factory,
  Smartphone,
  MapPin,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";
import { TakaIcon } from "@/components/common/TakaIcon";

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
    setCurrentUserRole,
    updateUserAvatar,
    cartItemCount,
    orders,
    notifications,
    language,
    setLanguage,
    setIsGetAppOpen,
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

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen, setIsMobileNavOpen]);

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
        { label: "Expenses", href: "/expenses", icon: TakaIcon },
        { label: "MR Portal", href: "/mr-portal", icon: MRPortalIcon },
      ],
    },
    {
      title: "B2B Depot Procurement",
      items: [
        { label: "Nearby Depots (Map)", href: "/distributors", icon: MapPin, highlight: true },
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
    <div
      className={`drawer-container fixed inset-0 z-50 flex justify-start select-none overflow-hidden ${
        isMobileNavOpen ? "is-open" : ""
      }`}
    >
      {/* Backdrop with smooth fade in/out animation */}
      <div
        className="drawer-backdrop fixed inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
        onClick={closeDrawer}
      />

      {/* Drawer Panel with 60FPS GPU-accelerated slide-in / slide-out from Left */}
      <div className="drawer-panel relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 text-slate-800 border-r border-slate-200/80">
        
        {/* Header with MedSupplyBD Brand Logo & User Profile Section */}
        <div className="p-4 sm:p-5 bg-white text-slate-800 border-b border-slate-200/80 relative">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <Link href="/" onClick={closeDrawer} className="flex items-center group" title="MedGo Home">
              <img
                src="/images/medgo-logo.png"
                alt="MedGo"
                className="h-10 sm:h-12 w-auto max-w-[210px] object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
              />
            </Link>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 active:scale-90 hover:rotate-90 cursor-pointer"
              aria-label="Close menu"
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

          {/* User Profile Info Card */}
          <div className="mt-3.5 flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload photo"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#0080ff] shadow-xs group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="truncate flex-1">
              <div className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#0080ff] shrink-0" />
                <span className="truncate">{currentPharmacy?.tradeName || "Green Care Pharmacy"}</span>
              </div>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-blue-50 text-[#0080ff] border border-blue-200">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Switch Persona
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setCurrentUserRole(UserRole.SUPER_ADMIN)}
                className={`p-2 rounded-xl text-left font-bold truncate transition-all ${
                  currentUser.role === UserRole.SUPER_ADMIN
                    ? "bg-[#0080ff] hover:bg-[#006fe6] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                Super Admin
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.PHARMA_COMPANY)}
                className={`p-2 rounded-xl text-left font-bold truncate transition-all ${
                  currentUser.role === UserRole.PHARMA_COMPANY
                    ? "bg-[#0080ff] hover:bg-[#006fe6] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                Pharma HQ
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.DISTRIBUTOR)}
                className={`p-2 rounded-xl text-left font-bold truncate transition-all ${
                  currentUser.role === UserRole.DISTRIBUTOR
                    ? "bg-[#0080ff] hover:bg-[#006fe6] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                Depot In-Charge
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.SALES_REP)}
                className={`p-2 rounded-xl text-left font-bold truncate transition-all ${
                  currentUser.role === UserRole.SALES_REP
                    ? "bg-[#0080ff] hover:bg-[#006fe6] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                MPO Terminal
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.PHARMACY_OWNER)}
                className={`col-span-2 p-2 rounded-xl text-left font-bold truncate transition-all ${
                  currentUser.role === UserRole.PHARMACY_OWNER
                    ? "bg-[#0080ff] hover:bg-[#006fe6] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                Pharmacy Owner (Retail)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-none bg-white">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
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
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-[#eff6ff] text-[#0080ff] font-semibold shadow-2xs border border-blue-100"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#0080ff] stroke-[2.5]"
                              : "text-slate-400 group-hover:text-slate-700 stroke-[2.2]"
                          }`}
                        />
                        <span className="text-[15px] sm:text-[15.5px] truncate tracking-tight">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0080ff]">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#0080ff]"
                              : "text-slate-300 group-hover:text-slate-500"
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

        {/* Bottom Footer: Mobile App + Language Toggle + Logout Button */}
        <div className="p-3.5 border-t border-slate-200/80 bg-white space-y-2 relative z-10">
          {/* Mobile App Install Button */}
          <button
            onClick={() => {
              closeDrawer();
              setIsGetAppOpen(true);
            }}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#0080ff] hover:bg-[#006fe6] text-white text-sm font-bold transition-all shadow-xs group active:scale-95 cursor-pointer"
            title="Install MedSupplyBD App (PWA / Android APK)"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-blue-100" />
              <span>Get Mobile App / অ্যাপ ডাউনলোড</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white text-[#006fe6] text-[11px] font-black uppercase tracking-wider">
              APK &bull; iOS
            </span>
          </button>

          {/* Language Toggle Button (English / বাংলা) */}
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

          {/* Sign Out Button */}
          <Link
            href="/login"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-600 text-sm font-bold transition-all border border-rose-200/70 shadow-2xs group"
            title="Sign out of platform session"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-500" />
            <span>Logout / সাইন আউট</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
