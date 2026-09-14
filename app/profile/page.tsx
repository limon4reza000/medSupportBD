"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function ProfilePage() {
  const { currentUser, currentPharmacy } = useApp();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            <span>User & Pharmacy Profile Settings</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Manage authorized credentials, Drug License certificates, and notification preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: User Card (Pure White Card) */}
        <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/30"
          />
          <div>
            <h2 className="text-lg font-black text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {currentUser.role.replace("_", " ")}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Security Status:</span>
              <strong className="text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 2FA Verified
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Login:</span>
              <span className="font-mono text-slate-700">Today, 08:30 AM</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Pharmacy Master Info (Pure White Card) */}
        <div className="lg:col-span-2 premium-card p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Registered Pharmacy Credentials</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {currentPharmacy.code}
            </span>
          </div>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Profile information successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Pharmacy Trade Name:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.tradeName}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Owner / Pharmacist Name:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.ownerName}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Drug License Number:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.drugLicenseNo}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Emergency Phone:</label>
                <input
                  type="text"
                  defaultValue={currentPharmacy.phone}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700">Physical Delivery Address:</label>
                <input
                  type="text"
                  defaultValue={`${currentPharmacy.address}, ${currentPharmacy.thana}, ${currentPharmacy.district}`}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
