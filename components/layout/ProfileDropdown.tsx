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
  X,
  ShieldCheck,
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

  const dropdownMenuItems = [
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Security & Login", href: "/security", icon: ShieldCheck },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Transactions", href: "/transactions", icon: Receipt },
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
      {/* MINIMAL SAAS AVATAR TRIGGER (Clean, Soft Hover, No Border Highlight)  */}
      {/* =================================================================== */}
      <button
        onClick={handleAvatarClick}
        aria-label="User profile menu"
        className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-white/10 transition-all duration-200 group focus:outline-none ring-0 border-none select-none"
      >
        {/* Subtle Container */}
        <div className="relative p-0.5 rounded-xl sm:rounded-2xl">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />

          {/* Small Floating Circular Camera Button at Bottom-Right */}
          <span
            onClick={triggerFileInput}
            title="Upload profile photo"
            className="absolute -bottom-1 -right-1 p-1 bg-white text-emerald-950 rounded-full shadow-md transition-transform duration-200 hover:scale-110 cursor-pointer flex items-center justify-center border border-slate-100"
          >
            <Camera className="w-3 h-3 stroke-[2.2] text-[#014232]" />
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-emerald-200/70 group-hover:text-white hidden sm:block transition-colors duration-200 ml-0.5" />
      </button>

      {/* =================================================================== */}
      {/* DESKTOP PREMIUM PROFILE DROPDOWN MENU                               */}
      {/* =================================================================== */}
      {isOpen && (
        <div className="hidden sm:block absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
          
          {/* Header Section: User Name, Role, Pharmacy Name */}
          <div className="px-1 pb-3 mb-2 border-b border-slate-100 flex items-start gap-3">
            {/* Clickable Header Avatar */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={triggerFileInput}
              title="Click to upload photo"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover transition-opacity duration-150 group-hover:opacity-85"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-white text-emerald-950 rounded-full shadow-md border border-slate-100">
                <Camera className="w-3 h-3 text-[#014232]" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-900 truncate leading-snug">
                {currentUser.name}
              </h3>

              <div className="text-xs font-semibold text-emerald-800 mt-0.5 truncate">
                {currentUser.role.replace("_", " ")}
              </div>

              <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                <Building2 className="w-3 h-3 text-emerald-700 shrink-0" />
                <span className="truncate">{currentPharmacy.tradeName}</span>
              </div>
            </div>
          </div>

          {/* Upload Success Alert */}
          {uploadSuccess && (
            <div className="my-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Photo updated successfully!</span>
            </div>
          )}

          {/* Navigation Menu Links */}
          <div className="space-y-0.5 py-1">
            {dropdownMenuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#025540] text-white font-bold"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-700"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Role Switcher for Demo */}
          <div className="pt-2 border-t border-slate-100 my-1">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Switch Role
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

          {/* Logout */}
          <div className="pt-2 mt-1 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Link>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* MOBILE SHEET MENU                                                   */}
      {/* =================================================================== */}
      {isMobileSheetOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileSheetOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 z-50 animate-in slide-in-from-bottom duration-250 text-slate-900">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-700" />
                <span>Account Profile</span>
              </h2>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div
                className="relative cursor-pointer shrink-0"
                onClick={triggerFileInput}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-white text-emerald-950 rounded-full shadow-md border border-slate-100">
                  <Camera className="w-3.5 h-3.5 text-[#014232]" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</h3>
                <p className="text-xs text-emerald-800 font-semibold truncate">{currentUser.role.replace("_", " ")}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>{currentPharmacy.tradeName}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              {dropdownMenuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsMobileSheetOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <Icon className="w-4 h-4 text-emerald-700" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsMobileSheetOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200"
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
