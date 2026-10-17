"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  MapPin,
  ShoppingCart,
  User,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cart, currentUser } = useApp();

  // If user is on the mobile app home, don't show double bottom nav
  if (pathname === "/" || pathname === "/mobile-prototype" || pathname === "/mobile") {
    return null;
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.orderedQty, 0);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Medicines",
      href: "/medicines",
      icon: Database,
      isActive: pathname === "/medicines",
    },
    {
      label: "Nearby Map",
      href: "/distributors",
      icon: MapPin,
      isActive: pathname === "/distributors",
      isCenter: true,
    },
    {
      label: "Orders / POS",
      href: "/pos",
      icon: ShoppingCart,
      isActive: pathname === "/pos" || pathname === "/orders",
      badge: totalCartCount > 0 ? totalCartCount : undefined,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-0.5 -mt-4 group active:scale-95 transition-transform"
                aria-label={item.label}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  item.isActive
                    ? "bg-gradient-to-tr from-[#1A56DB] to-[#059669] text-white ring-4 ring-emerald-100"
                    : "bg-gradient-to-tr from-[#1A56DB] to-[#2563EB] text-white hover:from-[#1E40AF] hover:to-[#1A56DB]"
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] font-bold ${
                  item.isActive ? "text-[#1A56DB]" : "text-slate-600"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
                item.isActive
                  ? "text-[#1A56DB] font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#059669] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                    {item.badge}
                  </span>
                )}
                {item.isActive && !item.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#059669]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
