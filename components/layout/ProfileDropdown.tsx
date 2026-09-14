"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export const ProfileDropdown: React.FC = () => {
  const { currentUser, currentPharmacy, setCurrentUserRole, updateUserAvatar } = useApp();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden File Input for Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Avatar Button Only */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User profile menu"
          className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-emerald-400/60 transition-all group relative"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-emerald-400/50 group-hover:scale-105 transition-transform"
          />
          
          {/* Quick Camera Overlay Badge */}
          <span
            onClick={triggerFileInput}
            title="Upload profile picture directly"
            className="absolute bottom-0 right-0 p-1 bg-[#025540] hover:bg-[#036b51] text-white rounded-full ring-2 ring-white shadow-md transition-transform hover:scale-125 cursor-pointer"
          >
            <Camera className="w-2.5 h-2.5" />
          </span>

          <ChevronDown className="w-3.5 h-3.5 text-emerald-200/80 group-hover:text-white hidden sm:block transition-colors ml-1" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
          
          {/* User & Pharmacy Header with Quick Avatar Upload */}
          <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1 flex items-start gap-3">
            
            {/* Clickable Header Avatar */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={triggerFileInput}
              title="Click to upload new photo"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/40 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-emerald-700 shrink-0" />
                <span className="truncate">{currentPharmacy.tradeName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentUser.role.replace("_", " ")}
                </span>
                
                {/* Direct Upload Link Button inside Dropdown Header */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                >
                  <Upload className="w-2.5 h-2.5" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

          </div>

          {/* Upload Success Toast inside Dropdown */}
          {uploadSuccess && (
            <div className="p-2 mb-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Photo updated successfully!</span>
            </div>
          )}

          {/* Quick Role Switcher for Demo */}
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Switch Demo Role
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] px-1 mb-2">
            <button
              onClick={() => setCurrentUserRole(UserRole.PHARMACY_OWNER)}
              className={`p-1.5 rounded-lg text-left transition-colors ${
                currentUser.role === UserRole.PHARMACY_OWNER
                  ? "bg-[#025540] text-white font-bold"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Pharmacy
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
              Depot Mgr
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

          <div className="border-t border-slate-100 my-1" />

          {/* Menu Items */}
          <div className="space-y-0.5 text-xs font-medium">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>My Profile Settings</span>
            </Link>

            <button
              onClick={triggerFileInput}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/70 font-semibold transition-colors text-left"
            >
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>Upload New Profile Photo</span>
            </button>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Account Settings</span>
            </Link>

            <Link
              href="/transactions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              <Receipt className="w-4 h-4 text-emerald-700" />
              <span>Transactions & Ledger</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="pt-1.5 mt-1 border-t border-slate-100">
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
    </div>
  );
};
