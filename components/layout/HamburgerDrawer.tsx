"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Package,
  ShoppingCart,
  ShoppingBag,
  Clock,
  Receipt,
  CreditCard,
  Tag,
  Sparkles,
  TrendingUp,
  Boxes,
  Users,
  ShieldCheck,
  FileBarChart2,
  Bell,
  Settings,
  HelpCircle,
  Building2,
  LogOut,
  Layers,
  Truck,
  AlertTriangle,
  FileText,
  UserCheck,
  Briefcase,
  DollarSign,
  ChevronRight,
  Activity,
  LucideIcon,
  Camera,
  Pill,
} from "lucide-react";
import { MedSupportLogo } from "@/components/common/MedSupportLogo";
import { useApp } from "@/lib/context/AppContext";

interface DrawerMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
  } = useApp();

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
        { label: "Daily Sales (POS)", href: "/pos", icon: ShoppingCart, highlight: true },
        { label: "Medicine Database & Stock", href: "/inventory", icon: Boxes },
        { label: "Company / Distributor Orders", href: "/distributor-orders", icon: Truck },
        { label: "Customer Due Ledger", href: "/customer-due", icon: CreditCard },
        { label: "Expense Tracking", href: "/expenses", icon: DollarSign },
        { label: "Employee Management", href: "/employees", icon: Users },
        { label: "Reports & Charts", href: "/reports", icon: FileBarChart2 },
        { label: "MR Private Panel", href: "/mr-portal", icon: Briefcase },
      ],
    },
    {
      title: "B2B Depot Procurement",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Package },
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
        { label: "Settings & Backup", href: "/settings", icon: Settings },
        { label: "Security Center", href: "/security", icon: ShieldCheck },
        { label: "Support & Help", href: "/support", icon: HelpCircle },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer Panel (Right Side Slide-In) */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 text-slate-900 animate-in slide-in-from-right duration-250">
        
        {/* Header with User Profile Section */}
        <div className="p-4 bg-gradient-to-b from-[#014232] to-[#025540] text-white">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-600/30">
            <div className="flex items-center gap-[2px]">
              <MedSupportLogo className="w-12 h-12 object-contain shrink-0" />
              <span className="font-black text-lg tracking-tight">MedSupply<span className="text-emerald-300">BD</span></span>
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
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-300 shadow-md group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="truncate flex-1">
              <div className="font-bold text-sm truncate">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-200 truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-300" />
                <span className="truncate">{currentPharmacy.tradeName}</span>
              </div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-sm"
                          : item.highlight
                          ? "bg-teal-50/70 text-teal-900 hover:bg-teal-100/70 border border-teal-200/60"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? "text-emerald-700"
                              : item.highlight
                              ? "text-teal-600"
                              : "text-slate-500"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Link
            href="/login"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
