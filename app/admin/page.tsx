"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Check,
  X,
  UserCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export default function AdminSettingsPage() {
  const permissionsList = [
    { key: "medicine.read", label: "View Medicine Catalog & Stock" },
    { key: "medicine.create", label: "Create / Update Medicine SKU" },
    { key: "inventory.adjust", label: "Commit Physical Stock Adjustments" },
    { key: "order.create", label: "Cut & Place Orders" },
    { key: "order.approve", label: "Approve High-Value Credit Orders" },
    { key: "order.dispatch", label: "Mark Orders as Dispatched" },
    { key: "ledger.read", label: "View Financial Ledger & Statements" },
    { key: "payment.create", label: "Record Payment Collections" },
    { key: "pharmacy.credit.update", label: "Modify Pharmacy Credit Limits" },
    { key: "report.read", label: "Access Business Reports & Analytics" },
    { key: "user.manage", label: "Manage User Roles & System Security" },
  ];

  const rolePermissionMap: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: permissionsList.map((p) => p.key),
    [UserRole.DEPOT_MANAGER]: ["medicine.read", "medicine.create", "inventory.adjust", "order.approve", "order.dispatch", "report.read"],
    [UserRole.SALES_REP]: ["medicine.read", "order.create", "payment.create", "ledger.read", "report.read"],
    [UserRole.PHARMACY_OWNER]: ["medicine.read", "order.create", "ledger.read"],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Granular RBAC Security & Permission Matrix</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Defines authoritative functional boundaries for every role in the pharmaceutical supply chain.
          </p>
        </div>

        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Users</span>
        </Link>
      </div>

      {/* Permissions Matrix Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Functional Permission</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Depot Manager</th>
                <th className="py-3 px-4 text-center">Sales Rep (SR/MPO)</th>
                <th className="py-3 px-4 text-center">Pharmacy Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {permissionsList.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{perm.label}</div>
                    <div className="text-[10px] font-mono text-slate-400">{perm.key}</div>
                  </td>
                  
                  {/* ADMIN */}
                  <td className="py-3 px-4 text-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </td>

                  {/* DEPOT_MANAGER */}
                  <td className="py-3 px-4 text-center">
                    {rolePermissionMap[UserRole.DEPOT_MANAGER].includes(perm.key) ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                        <X className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </td>

                  {/* SALES_REP */}
                  <td className="py-3 px-4 text-center">
                    {rolePermissionMap[UserRole.SALES_REP].includes(perm.key) ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                        <X className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </td>

                  {/* PHARMACY_OWNER */}
                  <td className="py-3 px-4 text-center">
                    {rolePermissionMap[UserRole.PHARMACY_OWNER].includes(perm.key) ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                        <X className="w-3.5 h-3.5" />
                      </div>
                    )}
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
