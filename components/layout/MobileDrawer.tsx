"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Package,
  ShoppingCart,
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
  Calendar,
  LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

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

export const MobileDrawer: React.FC = () => {
  const pathname = usePathname();
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    currentPharmacy,
    currentUser,
    cartItemCount,
    orders,
    notifications,
  } = useApp();

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
      title: "Ordering & Catalog",
      items: [
        { label: "Dashboard / Home", href: "/dashboard", icon: Package },
        { label: "All Products", href: "/products", icon: Boxes },
        { label: "Shopping Cart", href: "/cart", icon: ShoppingCart, badge: cartItemCount > 0 ? `${cartItemCount}` : undefined },
        { label: "My Orders", href: "/my-orders", icon: Clock, badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : undefined },
        { label: "Order History", href: "/order-history", icon: FileText },
      ],
    },
    {
      title: "Finance & Schemes",
      items: [
        { label: "Transactions Ledger", href: "/transactions", icon: Receipt },
        { label: "Credit Dashboard", href: "/credit", icon: CreditCard },
        { label: "Running Trade Offers", href: "/trade-offers", icon: Tag },
        { label: "Collections & Receipts", href: "/collections", icon: DollarSign },
      ],
    },
    {
      title: "AI Intelligent Tools",
      items: [
        { label: "AI Slip Parser (OCR)", href: "/ai-order", icon: Sparkles, highlight: true },
        { label: "AI Demand Forecaster", href: "/ai-insights", icon: TrendingUp },
      ],
    },
    {
      title: "Management & Staff",
      items: [
        { label: "Sales Rep (SR/MPO) Hub", href: "/sales", icon: Briefcase },
        { label: "Depot Manager Center", href: "/depot", icon: Truck },
        { label: "Inventory & Batches", href: "/inventory", icon: Layers },
        { label: "Near-Expiry Alerts", href: "/inventory/near-expiry", icon: AlertTriangle },
        { label: "Stock Movements", href: "/inventory/stock-movement", icon: Activity },
        { label: "Registered Pharmacies", href: "/pharmacies", icon: Building2 },
        { label: "Business Reports", href: "/reports", icon: FileBarChart2 },
        { label: "User Roles & RBAC", href: "/users", icon: UserCheck },
      ],
    },
    {
      title: "Account & Support",
      items: [
        { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
        { label: "My Profile", href: "/profile", icon: Users },
        { label: "Account Settings", href: "/settings", icon: Settings },
        { label: "Help & Helpline Support", href: "/support", icon: HelpCircle },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 text-slate-900 animate-in slide-in-from-left duration-250">
        
        {/* Header with User and Pharmacy Info */}
        <div className="p-4 bg-gradient-to-b from-[#014232] to-[#025540] text-white">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-600/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center text-[#01382a] font-bold">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-black text-lg tracking-tight">MedSupply<span className="text-emerald-300">BD</span></span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#036b51]/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-300"
            />
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

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Link
            href="/login"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from MedSupply</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
