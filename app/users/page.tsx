"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Search,
  Lock,
  CheckCircle2,
  Key,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export default function UsersRbacPage() {
  const { currentUser, setCurrentUserRole } = useApp();

  const users = [
    { id: "usr-01", name: "Dr. Rafiqul Islam", email: "greencare.pharm@gmail.com", role: UserRole.PHARMACY_OWNER, organization: "Green Care Pharmacy", status: "ACTIVE" },
    { id: "usr-02", name: "Tariqul Anam", email: "tariqul.sr@medsupplybd.com", role: UserRole.SALES_REP, organization: "Dhaka Central Route", status: "ACTIVE" },
    { id: "usr-03", name: "Kamrul Hasan", email: "kamrul.depot@medsupplybd.com", role: UserRole.DEPOT_MANAGER, organization: "Dhaka Central Depot", status: "ACTIVE" },
    { id: "usr-04", name: "System Admin", email: "admin@medsupplybd.com", role: UserRole.ADMIN, organization: "Headquarters", status: "ACTIVE" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <span>User Management & RBAC Permissions</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Role-Based Access Control matrix for Admins, Depot Managers, Sales Reps, and Pharmacy Owners.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto hover:scale-105"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security Permissions Matrix</span>
        </Link>
      </div>

      {/* Users Table (Pure White Card) */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User Name & Email</th>
                <th className="py-3 px-4">Role Designation</th>
                <th className="py-3 px-4">Territory / Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Switch Live Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{u.organization}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setCurrentUserRole(u.role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentUser.role === u.role
                          ? "bg-emerald-700 text-white"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {currentUser.role === u.role ? "Current Session" : "Simulate Role"}
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
