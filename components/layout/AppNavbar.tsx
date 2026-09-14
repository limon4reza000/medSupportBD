"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Bell,
  Sparkles,
  Zap,
  Menu,
  ChevronDown,
  Building2,
  ShieldCheck,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export const AppNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentPharmacy,
    pharmacies,
    setSelectedPharmacyId,
    cartItemCount,
    cartTotalAmount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    currentUser,
    setCurrentUserRole,
    setIsSearchOpen,
    setIsQuickOrderOpen,
    setIsMobileNavOpen,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPharmacyDropdownOpen, setIsPharmacyDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const pharmRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (pharmRef.current && !pharmRef.current.contains(e.target as Node)) {
        setIsPharmacyDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#014232]/95 backdrop-blur-md border-b border-[#10b981]/25 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* LEFT: Hamburger & Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hamburger Button (Mobile / Tablet) */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open mobile navigation"
              className="lg:hidden p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#036b51]/60 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center text-[#01382a] shadow-md group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    MedSupply<span className="text-emerald-400">BD</span>
                  </span>
                  <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    B2B Pharma
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-emerald-200/70 font-medium">
                  Order Cutting & Inventory OS
                </span>
              </div>
            </Link>

            {/* Pharmacy Selector (Desktop & Tablet) */}
            <div className="hidden md:block relative ml-2" ref={pharmRef}>
              <button
                onClick={() => setIsPharmacyDropdownOpen(!isPharmacyDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#025540] border border-emerald-500/30 text-xs text-white hover:border-emerald-400/60 transition-colors shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                <div className="text-left max-w-[150px] lg:max-w-[190px] truncate">
                  <div className="font-semibold truncate">{currentPharmacy.tradeName}</div>
                  <div className="text-[10px] text-emerald-300/80">
                    Limit: ৳{(currentPharmacy.creditLimit / 1000).toFixed(0)}k
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-emerald-300" />
              </button>

              {isPharmacyDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Pharmacy
                  </div>
                  {pharmacies.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPharmacyId(p.id);
                        setIsPharmacyDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        p.id === currentPharmacy.id
                          ? "bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold truncate text-slate-900">{p.tradeName}</div>
                        <div className="text-[10px] text-slate-500">{p.thana}, {p.district}</div>
                      </div>
                      <div className="text-right pl-2">
                        <div className="text-[10px] font-mono font-bold text-emerald-700">
                          ৳{(p.creditLimit - p.currentBalance).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400">Avail Credit</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Global Search Bar (Cmd + K) */}
          <div className="flex-1 max-w-md mx-3 lg:mx-6 hidden sm:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#025540]/80 hover:bg-[#036b51] border border-emerald-500/30 text-emerald-100/70 hover:text-white transition-all shadow-inner group text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-emerald-300 group-hover:text-emerald-200" />
                <span className="truncate">Search medicines, generics, brands, SKUs...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#01382a] border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-semibold">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* RIGHT: Quick Order, AI Order, Notifications, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search medicines"
              className="sm:hidden p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-[#036b51]/60 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Order Button */}
            <button
              onClick={() => setIsQuickOrderOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#01382a] font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Quick Order</span>
            </button>

            {/* AI Order Shortcut */}
            <Link
              href="/ai-order"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                pathname === "/ai-order"
                  ? "bg-teal-400/20 text-teal-200 border-teal-300/40"
                  : "bg-[#025540] hover:bg-[#036b51] text-teal-200 border-teal-500/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>AI Slip Parser</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#036b51]/60 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-700" />
                      <span>Notifications</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {unreadNotifs.length} new
                      </span>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) {
                              setIsNotificationsOpen(false);
                              router.push(n.link);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors border ${
                            !n.isRead
                              ? "bg-emerald-50/70 border-emerald-200 font-medium"
                              : "bg-slate-50 border-slate-100 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                    >
                      View All Notifications <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-white transition-all shadow-sm group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 text-[#01382a] font-black text-[10px] rounded-full flex items-center justify-center shadow-md">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[10px] text-emerald-200/80 leading-none">Cart</span>
                <span className="text-xs font-bold font-mono text-emerald-300 leading-tight">
                  ৳{cartTotalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-[#036b51]/60 transition-colors border border-transparent hover:border-emerald-500/30"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-400/50"
                />
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {currentUser.role.replace("_", " ")}
                    </span>
                  </div>

                  {/* Role Switcher for Demo / Testing */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/70 rounded-xl my-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Demo Role Switcher
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        onClick={() => setCurrentUserRole(UserRole.PHARMACY_OWNER)}
                        className={`p-1.5 rounded-lg text-left transition-colors ${
                          currentUser.role === UserRole.PHARMACY_OWNER
                            ? "bg-emerald-700 text-white font-bold"
                            : "bg-white text-slate-700 border hover:bg-slate-100"
                        }`}
                      >
                        Pharmacy
                      </button>
                      <button
                        onClick={() => setCurrentUserRole(UserRole.SALES_REP)}
                        className={`p-1.5 rounded-lg text-left transition-colors ${
                          currentUser.role === UserRole.SALES_REP
                            ? "bg-emerald-700 text-white font-bold"
                            : "bg-white text-slate-700 border hover:bg-slate-100"
                        }`}
                      >
                        SR/MPO
                      </button>
                      <button
                        onClick={() => setCurrentUserRole(UserRole.DEPOT_MANAGER)}
                        className={`p-1.5 rounded-lg text-left transition-colors ${
                          currentUser.role === UserRole.DEPOT_MANAGER
                            ? "bg-emerald-700 text-white font-bold"
                            : "bg-white text-slate-700 border hover:bg-slate-100"
                        }`}
                      >
                        Depot Mgr
                      </button>
                      <button
                        onClick={() => setCurrentUserRole(UserRole.ADMIN)}
                        className={`p-1.5 rounded-lg text-left transition-colors ${
                          currentUser.role === UserRole.ADMIN
                            ? "bg-emerald-700 text-white font-bold"
                            : "bg-white text-slate-700 border hover:bg-slate-100"
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {/* Profile Links */}
                  <div className="space-y-0.5 text-xs py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/credit"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Pharmacy Credit & Terms</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/support"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
