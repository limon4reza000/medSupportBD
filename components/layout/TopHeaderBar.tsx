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
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export const TopHeaderBar: React.FC = () => {
  const {
    setIsSearchOpen,
    setIsMobileNavOpen,
    currentPharmacy,
    notifications,
    currentUser,
    setCurrentUserRole,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 1;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
    <header className="sticky top-0 z-30 w-full bg-[#f1f5f3]/95 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
        
        {/* Left: Global Search Input */}
        <div className="flex items-center flex-1 w-full min-w-0">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative flex-1 w-full flex items-center bg-white hover:bg-slate-50/90 cursor-pointer border border-slate-200/90 hover:border-emerald-500 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs hover:shadow-md transition-all group"
            title="Search medicine (Brand or Generic)"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-emerald-600 transition-colors mr-2.5 sm:mr-3 shrink-0" />
            <input
              type="text"
              readOnly
              placeholder="Search 41,300+ medicines, manufacturers, generics..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder-slate-400 outline-none cursor-pointer font-medium truncate"
            />
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Role Switcher | Notifications Bell | Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Interactive B2B Role Switcher Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group"
              title="Click to switch role (Super Admin, Pharma, Distributor, MPO, Pharmacy)"
            >
              <div className={`w-8 h-8 rounded-xl ${currentRoleConfig.badgeColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[170px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-tight truncate">
                    {currentRoleConfig.label}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    Switch
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium leading-tight truncate">
                  {currentUser.organizationName || currentRoleConfig.org}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors ml-0.5" />
            </button>

            {/* Role Switcher Floating Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Switch Operational Persona
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 font-medium">
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
                            ? "bg-[#025540] text-white shadow-md"
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
                            <span className="font-bold text-xs">{item.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                          </div>
                          <div className={`text-[11px] truncate ${isSelected ? "text-emerald-100" : "text-slate-500 font-medium"}`}>
                            {item.org}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-200/80" : "text-slate-400"}`}>
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 px-3 py-1 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Current: <strong>{currentUser.name}</strong></span>
                  <Link href="/profile" onClick={() => setIsRoleDropdownOpen(false)} className="text-emerald-700 font-bold hover:underline">
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
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

          {/* User Profile Avatar */}
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all"
            title="My Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-xl object-cover"
            />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 transition-all shadow-xs flex items-center justify-center shrink-0 active:scale-95"
            aria-label="Open Navigation Drawer"
            title="Open Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

        </div>

      </div>
    </header>
  );
};
