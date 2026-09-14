"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Settings,
  Receipt,
  LogOut,
  ChevronDown,
  Building2,
  Camera,
  Upload,
  CheckCircle2,
  Package,
  Phone,
  Mail,
  ShieldCheck,
  X,
  Sparkles,
  CircleCheck,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export const ProfileDropdown: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, currentPharmacy, setCurrentUserRole, updateUserAvatar } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateUserAvatar(result);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (window.innerWidth < 640) {
      setIsMobileSheetOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const quickActions = [
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Pharmacy Profile", href: `/pharmacies/${currentPharmacy.id || "pharm-01"}`, icon: Building2 },
    { label: "My Orders", href: "/my-orders", icon: Package },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Account Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden File Input for Direct Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* =================================================================== */}
      {/* AVATAR TRIGGER BUTTON (Desktop: 48x48px, Mobile: 40x40px)            */}
      {/* =================================================================== */}
      <button
        onClick={handleAvatarClick}
        aria-label="User profile menu"
        className="flex items-center gap-2 p-0.5 rounded-2xl hover:ring-2 hover:ring-emerald-400/60 transition-all group relative focus:outline-none"
      >
        {/* Avatar Ring Frame matching spec */}
        <div className="relative p-0.5 bg-[#a3e6cd]/25 border-2 border-[#a3e6cd] rounded-xl sm:rounded-2xl shadow-sm group-hover:border-[#34d399] transition-all">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover group-hover:scale-105 transition-transform"
          />

          {/* Active Online Indicator (Green Dot) */}
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 ring-2 ring-white rounded-full flex items-center justify-center shadow-sm"
            title="Online Active"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </span>

          {/* Floating Camera Button (Bottom-Right, White Background with Soft Shadow) */}
          <span
            onClick={triggerFileInput}
            title="Upload new profile picture"
            className="absolute -bottom-1.5 -right-1.5 p-1 bg-white hover:bg-emerald-50 text-[#014232] rounded-lg ring-2 ring-emerald-500/40 shadow-md transition-transform hover:scale-115 cursor-pointer flex items-center justify-center"
          >
            <Camera className="w-3 h-3 stroke-[2.5]" />
          </span>
        </div>

        <ChevronDown className="w-4 h-4 text-emerald-200/80 group-hover:text-white hidden sm:block transition-colors" />
      </button>

      {/* =================================================================== */}
      {/* DESKTOP PREMIUM PROFILE DROPDOWN CARD                               */}
      {/* =================================================================== */}
      {isOpen && (
        <div className="hidden sm:block absolute right-0 mt-3 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
          
          {/* Top Section: Large Avatar, Name, Role Badge, Active Status */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            {/* Large Avatar Container */}
            <div
              className="relative group cursor-pointer shrink-0 p-0.5 bg-[#a3e6cd]/30 border-2 border-[#a3e6cd] rounded-2xl"
              onClick={triggerFileInput}
              title="Click to upload new photo"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-xl object-cover group-hover:opacity-85 transition-opacity"
              />
              <span className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-white text-[#014232] rounded-xl border-2 border-slate-100 shadow-md hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-black text-base text-slate-900 truncate leading-snug">
                  {currentUser.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentUser.role.replace("_", " ")}
                </span>

                {/* Online Status */}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>

              <button
                type="button"
                onClick={triggerFileInput}
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 mt-1.5 hover:underline"
              >
                <Upload className="w-3 h-3" />
                <span>Upload New Photo</span>
              </button>
            </div>
          </div>

          {/* Upload Success Toast */}
          {uploadSuccess && (
            <div className="my-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Profile photo updated successfully!</span>
            </div>
          )}

          {/* User Information Card */}
          <div className="my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              User & Identity Record
            </div>
            
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500 font-medium">Organization:</span>
              <strong className="text-slate-900 font-bold truncate max-w-[170px]">
                {currentPharmacy.tradeName}
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500 font-medium">Phone Number:</span>
              <span className="font-mono text-slate-900 font-semibold">{currentPharmacy.phone}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500 font-medium">Email:</span>
              <span className="text-slate-900 font-semibold truncate max-w-[170px]">{currentUser.email}</span>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="space-y-1 my-2">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quick Actions
            </div>
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              const isActive = pathname === action.href;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#025540] text-white font-bold shadow-sm"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-950"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-700"}`} />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Role Switcher for Demo */}
          <div className="pt-2 border-t border-slate-100 my-2">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Switch Demo Role
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => setCurrentUserRole(UserRole.PHARMACY_OWNER)}
                className={`p-1.5 rounded-lg text-left transition-colors ${
                  currentUser.role === UserRole.PHARMACY_OWNER
                    ? "bg-[#025540] text-white font-bold"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Pharmacy Owner
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.SALES_REP)}
                className={`p-1.5 rounded-lg text-left transition-colors ${
                  currentUser.role === UserRole.SALES_REP
                    ? "bg-[#025540] text-white font-bold"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                SR / MPO
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.DEPOT_MANAGER)}
                className={`p-1.5 rounded-lg text-left transition-colors ${
                  currentUser.role === UserRole.DEPOT_MANAGER
                    ? "bg-[#025540] text-white font-bold"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Depot Manager
              </button>
              <button
                onClick={() => setCurrentUserRole(UserRole.ADMIN)}
                className={`p-1.5 rounded-lg text-left transition-colors ${
                  currentUser.role === UserRole.ADMIN
                    ? "bg-[#025540] text-white font-bold"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Link>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* MOBILE FULL-WIDTH BOTTOM SHEET PANEL                                 */}
      {/* =================================================================== */}
      {isMobileSheetOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileSheetOpen(false)}
          />

          {/* Sheet Panel */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 z-50 animate-in slide-in-from-bottom duration-250 text-slate-900 max-h-[85vh] overflow-y-auto">
            {/* Pull Tab Bar */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-700" />
                <span>Executive Profile</span>
              </h2>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Header Info */}
            <div className="mt-4 flex items-center gap-4 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
              <div
                className="relative cursor-pointer shrink-0 p-0.5 bg-[#a3e6cd] rounded-2xl"
                onClick={triggerFileInput}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <span className="absolute -bottom-1 -right-1 p-1.5 bg-white text-[#014232] rounded-xl border border-slate-200 shadow-md">
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-base text-slate-900 truncate">{currentUser.name}</h3>
                <p className="text-xs text-slate-600 truncate">{currentPharmacy.tradeName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-700 text-white">
                    {currentUser.role.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Information List */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-900 font-bold">{currentPharmacy.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-900 font-semibold truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Mobile Quick Navigation */}
            <div className="mt-4 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Navigation Shortcuts
              </div>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    href={action.href}
                    onClick={() => setIsMobileSheetOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-emerald-700" />
                      <span>{action.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Logout */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsMobileSheetOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
