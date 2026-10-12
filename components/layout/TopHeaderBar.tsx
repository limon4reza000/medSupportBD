"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Store,
  Menu,
  ShieldCheck,
  Factory,
  Truck,
  Briefcase,
  ChevronDown,
  Check,
  User,
  Settings,
  LogOut,
  Camera,
  MapPin,
  Grip,
  ScanLine,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export const TopHeaderBar: React.FC = () => {
  const {
    setIsSearchOpen,
    setIsMobileNavOpen,
    setIsGetAppOpen,
    currentPharmacy,
    notifications,
    currentUser,
    setCurrentUserRole,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 1;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!mobileDropdownRef.current || !mobileDropdownRef.current.contains(target))
      ) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rolesConfig: {
    role: UserRole;
    label: string;
    org: string;
    icon: React.ElementType;
    badgeColor: string;
    description: string;
  }[] = [
    {
      role: UserRole.SUPER_ADMIN,
      label: "Super Admin",
      org: "DGDA Regulatory Authority",
      icon: ShieldCheck,
      badgeColor: "bg-emerald-600 text-white",
      description: "DGDA Oversight, Platform Governance & Audit",
    },
    {
      role: UserRole.PHARMA_COMPANY,
      label: "Pharmaceutical Company",
      org: "Square Pharmaceuticals PLC",
      icon: Factory,
      badgeColor: "bg-purple-600 text-white",
      description: "National Catalog Master, Schemes & Recalls",
    },
    {
      role: UserRole.DISTRIBUTOR,
      label: "Distributor / Depot",
      org: "Dhaka Central Pharma Depot",
      icon: Truck,
      badgeColor: "bg-blue-600 text-white",
      description: "Warehouse FEFO, Bulk Orders, Invoicing & Fleet",
    },
    {
      role: UserRole.SALES_REP,
      label: "MPO / Sales Rep",
      org: "Dhanmondi Route (SR-104)",
      icon: Briefcase,
      badgeColor: "bg-amber-600 text-white",
      description: "Field Order Cutting Terminal & Daily Visits",
    },
    {
      role: UserRole.PHARMACY_OWNER,
      label: "Pharmacy Owner",
      org: currentPharmacy?.tradeName || "Green Care Pharmacy",
      icon: Store,
      badgeColor: "bg-[#025540] text-white",
      description: "Wholesale Procurement, Credit & Retail POS",
    },
  ];

  const currentRoleConfig =
    rolesConfig.find((r) => r.role === currentUser.role) ||
    rolesConfig[rolesConfig.length - 1];
  const CurrentIcon = currentRoleConfig.icon;

  const handleSelectRole = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all relative overflow-hidden">
      {/* Subtle decorative mint wave accents on mobile edges matching mockup */}
      <div className="lg:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-emerald-100/50 to-transparent pointer-events-none" />
      <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-emerald-100/50 to-transparent pointer-events-none" />

      {/* =================================================================== */}
      {/* 1. MOBILE TOP NAVBAR (Exact Match to User Mockup UI)                */}
      {/* =================================================================== */}
      <div className="lg:hidden flex flex-col w-full relative z-10">
        
        {/* Row 1: Left (Menu + Logo) | Right (Role Pill + Bell + Avatar + 9-Dot) */}
        <div className="flex items-center justify-between w-full gap-1.5">
          
          {/* Left: Hamburger Button + MedSupplyBD Full Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-1.5 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-90 transition-transform cursor-pointer"
              aria-label="Open Navigation Drawer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>

            <Link href="/" className="flex items-center group" title="MedSupplyBD Home">
              <img
                src="/images/medsupplybd-logo.png"
                alt="MedSupplyBD"
                className="h-7 sm:h-8 w-auto max-w-[125px] sm:max-w-[150px] object-contain drop-shadow-2xs group-hover:scale-102 transition-transform"
              />
            </Link>
          </div>

          {/* Right: Role Pill | Notification Bell | User Avatar | 9-Dot Grip Launcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Role Indicator Pill (🟢 Pharmacy Owner ⌵) */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/90 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Switch Operational Persona"
              >
                <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0 animate-pulse" />
                <span className="text-slate-800 font-bold truncate max-w-[85px] xs:max-w-none text-[11px] sm:text-xs">
                  {currentRoleConfig.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {/* Mobile Role Switcher Floating Menu */}
              {isRoleDropdownOpen && (
                <div className="fixed left-3 right-3 top-16 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Switch Operational Persona
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        Select a pharmaceutical role:
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRoleDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5 py-2 max-h-[60vh] overflow-y-auto">
                    {rolesConfig.map((item) => {
                      const Icon = item.icon;
                      const isSelected = currentUser.role === item.role;

                      return (
                        <button
                          key={item.role}
                          onClick={() => handleSelectRole(item.role)}
                          className={`w-full text-left p-2.5 rounded-2xl flex items-start gap-3 transition-all ${
                            isSelected
                              ? "bg-[#0080ff] text-white shadow-md"
                              : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : `${item.badgeColor} text-white`
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm">{item.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`text-xs truncate ${isSelected ? "text-blue-100 font-semibold" : "text-slate-600 font-medium"}`}>
                              {item.org}
                            </div>
                            <div className={`text-xs mt-0.5 ${isSelected ? "text-blue-100/90" : "text-slate-500"}`}>
                              {item.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell (Circular button with red badge count) */}
            <Link
              href="/notifications"
              className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-2xs active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#ef4444] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : 4}
              </span>
            </Link>

            {/* User Profile Avatar with Green Dot & Down Chevron */}
            <Link
              href="/profile"
              className="flex items-center gap-0.5 p-0.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer group"
              title={`Profile: ${currentUser.name}`}
            >
              <div className="relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-1.5 ring-emerald-400/80 shrink-0 shadow-2xs">
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#10b981] ring-1.5 ring-white" />
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>

            {/* 9-Dot Grip / App Launcher Icon Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="All Modules & Features"
              aria-label="Open App Launcher"
            >
              <Grip className="w-4.5 h-4.5 text-slate-800 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Row 2: Full-Width Search Bar with Magnifier & ScanLine Icon */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="relative w-full mt-2 sm:mt-2.5 flex items-center justify-between bg-white hover:bg-slate-50/80 cursor-pointer border border-slate-200/90 hover:border-emerald-500 focus-within:border-emerald-500 rounded-full px-3.5 sm:px-4 py-2 shadow-2xs hover:shadow-xs transition-all group"
          title="Search medicine, brand, manufacturer..."
        >
          <div className="flex items-center flex-1 min-w-0 mr-2">
            <Search className="w-4.5 h-4.5 text-emerald-600 mr-2.5 shrink-0 group-hover:scale-110 transition-transform" />
            <input
              type="text"
              readOnly
              placeholder="Search medicine, brand, manufacturer..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none cursor-pointer font-medium truncate"
            />
          </div>

          {/* Barcode/QR Scanner Icon inside soft green rounded box */}
          <div
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-100 transition-colors"
            title="Scan Medicine Barcode or Prescription"
          >
            <ScanLine className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DESKTOP NAVBAR LAYOUT (Full Screen View)                         */}
      {/* =================================================================== */}
      <div className="hidden lg:flex items-center justify-between gap-3 sm:gap-4 w-full">
        
        {/* Left: Global Search Input */}
        <div className="flex items-center flex-1 w-full min-w-0 gap-2">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative flex-1 w-full flex items-center bg-slate-100/90 hover:bg-white cursor-pointer border-2 border-slate-200 hover:border-[#0080ff] focus-within:border-[#0080ff] focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl px-4 py-2.5 shadow-2xs hover:shadow-md transition-all group"
            title="Search medicine"
          >
            <Search className="w-5 h-5 text-slate-600 group-hover:text-[#0080ff] transition-colors mr-3 shrink-0" />
            <input
              type="text"
              readOnly
              placeholder="Search medicine"
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-600 outline-none cursor-pointer font-semibold truncate"
            />
          </div>
        </div>

        {/* Right: Nearby Depots | Role Switcher | Notifications Bell | User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Nearby Depots & Map Finder Link */}
          <Link
            href="/distributors"
            id="nearby-distributors-header-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-blue-50 text-slate-800 border border-slate-200/90 hover:border-blue-300 font-bold text-sm shadow-xs hover:shadow-md transition-all active:scale-95 group"
            title="Discover nearby authorized pharmaceutical depots & medicine stock on map"
          >
            <MapPin className="w-4 h-4 text-[#0080ff] group-hover:scale-110 transition-transform" />
            <span className="font-extrabold">Nearby Depots</span>
          </Link>
          
          {/* Interactive B2B Role Switcher Pill for Desktop */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white hover:bg-blue-50/60 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group"
              title="Click to switch role (Super Admin, Pharma, Distributor, MPO, Pharmacy)"
            >
              <div className={`w-8 h-8 rounded-xl ${currentRoleConfig.badgeColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left min-w-0 max-w-[170px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#0080ff] transition-colors leading-tight truncate">
                    {currentRoleConfig.label}
                  </span>
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0080ff]">
                    Switch
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium leading-tight truncate">
                  {currentUser.organizationName || currentRoleConfig.org}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors ml-0.5" />
            </button>

            {/* Role Switcher Floating Menu for Desktop */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Switch Operational Persona
                  </div>
                  <div className="text-sm text-slate-600 mt-0.5 font-medium">
                    Test the complete multi-tenant B2B pharmaceutical workflow:
                  </div>
                </div>

                <div className="space-y-1.5 py-2">
                  {rolesConfig.map((item) => {
                    const Icon = item.icon;
                    const isSelected = currentUser.role === item.role;

                    return (
                      <button
                        key={item.role}
                        onClick={() => handleSelectRole(item.role)}
                        className={`w-full text-left p-2.5 rounded-2xl flex items-start gap-3 transition-all ${
                          isSelected
                            ? "bg-[#0080ff] text-white shadow-md"
                            : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : `${item.badgeColor} text-white`
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{item.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className={`text-xs truncate ${isSelected ? "text-blue-100 font-semibold" : "text-slate-600 font-medium"}`}>
                            {item.org}
                          </div>
                          <div className={`text-xs mt-0.5 ${isSelected ? "text-blue-100/90" : "text-slate-500"}`}>
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 px-3 py-1 text-xs sm:text-[13px] text-slate-600 flex items-center justify-between font-medium">
                  <span>Current: <strong>{currentUser.name}</strong></span>
                  <Link href="/profile" onClick={() => setIsRoleDropdownOpen(false)} className="text-[#0080ff] font-bold hover:underline">
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell for Desktop */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 transition-all shadow-xs flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Avatar with Name & Admin Badge for Desktop */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all"
            title="My Profile - Mahfuzul Islam"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1.5 ring-emerald-400/80 shrink-0 shadow-xs">
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left pr-1.5 min-w-0">
              <span className="text-sm font-bold text-slate-900 leading-tight truncate">
                {currentUser.name || "Mahfuzul Islam"}
              </span>
              <span className="text-xs text-slate-500 font-semibold leading-tight truncate">
                Admin
              </span>
            </div>
          </Link>

        </div>

      </div>
    </header>
  );
};
