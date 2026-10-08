"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Truck,
  User,
  Users,
  BarChart3,
  DollarSign,
  Briefcase,
  Settings,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentPharmacy } = useApp();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Sales POS", href: "/pos", icon: ShoppingCart },
    { label: "Medicine Stock", href: "/inventory", icon: Boxes },
    { label: "Company Orders", href: "/distributor-orders", icon: Truck },
    { label: "Customer Due", href: "/customer-due", icon: User },
    { label: "Staff & Payroll", href: "/employees", icon: Users },
    { label: "Reports & BI", href: "/reports", icon: BarChart3 },
    { label: "Expenses", href: "/expenses", icon: DollarSign },
    { label: "MR Portal", href: "/mr-portal", icon: Briefcase },
  ];

  const secondaryNavItems = [
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/support", icon: Headphones },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#00382b] text-white border-r border-[#014232] select-none z-30 overflow-y-auto scrollbar-none">
      
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center gap-3 border-b border-emerald-900/40">
        {/* Stylized Pharmacy Icon Emblem */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-black text-lg text-white tracking-tight leading-snug truncate">
            {currentPharmacy?.tradeName || "Green Care"}
          </span>
          <span className="text-[11px] font-semibold text-emerald-300/80 tracking-wide truncate">
            Pharmacy & Med Store
          </span>
        </div>
      </div>

      {/* Primary Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? "bg-[#035944] text-white shadow-sm shadow-emerald-950/30"
                  : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? "bg-[#10B981] text-white shadow-xs"
                    : "text-emerald-300/70 group-hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Section Divider */}
        <div className="pt-4 pb-2 px-3">
          <div className="h-px bg-emerald-900/40 w-full" />
        </div>

        {/* Secondary Nav Items */}
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? "bg-[#035944] text-white shadow-sm"
                  : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-emerald-300/70">
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Promo Card: "Smarter Pharmacy Today" */}
      <div className="p-4 pt-2">
        <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-b from-[#024a3a] to-[#01382b] border border-emerald-500/20 shadow-lg group">
          {/* Ambient visual overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url('/images/sidebar-promo.jpg')` }}
          />
          <div className="relative z-10 space-y-1">
            <h4 className="font-extrabold text-sm text-white leading-tight">
              Smarter Pharmacy<br />Today
            </h4>
            <p className="text-[11px] text-emerald-200/70 font-medium leading-relaxed">
              Efficient. Profitable.<br />Always Ahead.
            </p>
            <div className="pt-2">
              <Link
                href="/ai-insights"
                className="w-7 h-7 rounded-full bg-emerald-500/30 hover:bg-[#10B981] flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 border border-emerald-400/40"
                title="Explore AI Forecasting"
              >
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};
