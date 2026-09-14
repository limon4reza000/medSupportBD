"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  ShieldCheck,
  Edit2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function PharmaciesMasterPage() {
  const { pharmacies, setSelectedPharmacyId } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = pharmacies.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.tradeName.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Master Pharmacy Registry & Credit Governance</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Registered B2B retail pharmacies, verified Drug Licenses, credit ceiling limits, and billing terms.
          </p>
        </div>

        <Link
          href="/register"
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Pharmacy</span>
        </Link>
      </div>

      {/* Search Bar (Pure White Card) */}
      <div className="premium-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Pharmacy Name, Owner, or License #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Pharmacies Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Pharmacy Code & Name</th>
                <th className="py-3 px-4">Proprietor / Contact</th>
                <th className="py-3 px-4">Drug License & TIN</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4">Current Outstanding</th>
                <th className="py-3 px-4">Credit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.tradeName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.code} • {p.thana}, {p.district}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{p.ownerName}</div>
                    <div className="text-[11px] text-slate-500">{p.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <div>{p.drugLicenseNo}</div>
                    <div className="text-[10px] text-slate-400">{p.taxId || "TIN on file"}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ৳{p.creditLimit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    ৳{p.currentBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {p.isCreditBlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Blocked by Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Active Terms ({p.creditDaysLimit}d)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPharmacyId(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all"
                    >
                      Select Active
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
