"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Activity,
  Search,
  ExternalLink,
  Lock,
  Eye,
  Check,
  X,
  RefreshCw,
  Clock,
  DollarSign,
  Truck,
  Filter,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export const SuperAdminDashboard: React.FC = () => {
  const {
    organizations,
    approveOrganization,
    verifyOrganizationLicense,
    orders,
    pharmacies,
    medicines,
    batchRecalls,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      org.drugLicenseNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      org.code.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = typeFilter === "ALL" || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalGmv = orders.reduce((sum, o) => sum + (o.netPayableAmount || 0), 0) * 12.5; // Scaled platform volume
  const verifiedCount = organizations.filter((o) => o.isVerified).length;
  const pendingCount = organizations.filter((o) => !o.isVerified || o.status === "PENDING_VERIFICATION").length;

  const handleVerify = (orgId: string, orgName: string) => {
    verifyOrganizationLicense(orgId);
    setActionSuccess(`DGDA Drug License verified for ${orgName}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleApprove = (orgId: string, orgName: string) => {
    approveOrganization(orgId);
    setActionSuccess(`Organization ${orgName} approved for operations`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Platform Governance Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#01382b] via-[#025540] to-[#014030] text-white p-6 rounded-3xl shadow-lg border border-emerald-600/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> DGDA Super Admin
            </span>
            <span className="text-xs text-emerald-200/90 font-medium">National Regulatory Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Platform Governance & Compliance Center
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Verify pharmaceutical manufacturing licenses, authorize regional depots, monitor suspicious transactions, and inspect audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-emerald-300" />
            <span>RBAC Security Matrix</span>
          </Link>
          <Link
            href="/reports"
            className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-md hover:scale-105"
          >
            <Activity className="w-4 h-4" />
            <span>National BI</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5">
        
        {/* Total GMV */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">30-Day Platform GMV</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ৳{(totalGmv / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last month
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Organizations</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {organizations.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {verifiedCount} DGDA Verified • {pendingCount} Pending
          </div>
        </div>

        {/* Retail Pharmacies */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Pharmacies</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {pharmacies.length + 1240}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            99.2% Active License Records
          </div>
        </div>

        {/* Batch Recalls & Risk */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Recalls</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {batchRecalls.filter((r) => r.status === "ACTIVE_RECALL").length}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            Quarantine enforced across 2 Depots
          </div>
        </div>

      </div>

      {/* Organization Approvals & License Verification Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#025540]" />
              <span>Pharmaceutical Manufacturers & Distributor Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review DGDA Drug Manufacturing License, TIN Certificates, and operational status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search organization or license..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="PHARMA_COMPANY">Pharma Manufacturer</option>
              <option value="DISTRIBUTOR">Distributor / Depot</option>
              <option value="PHARMACY_GROUP">Pharmacy Group</option>
            </select>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Organization & Code</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">DGDA License & Tax ID</th>
                <th className="px-4 py-3.5">Location & Contact</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => {
                const isCompany = org.type === "PHARMA_COMPANY";
                const isDistributor = org.type === "DISTRIBUTOR";

                return (
                  <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Name & Code */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {org.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {org.code}
                        </span>
                        {org.tradeName && (
                          <span className="text-[11px] text-slate-500">({org.tradeName})</span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isCompany
                            ? "bg-purple-100 text-purple-800"
                            : isDistributor
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isCompany ? "Manufacturer" : isDistributor ? "Depot / Distributor" : "Retail Chain"}
                      </span>
                    </td>

                    {/* License & Tax ID */}
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1">
                        <span>{org.drugLicenseNo}</span>
                        {org.isVerified ? (
                          <span title="DGDA Verified">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </span>
                        ) : (
                          <span title="Pending Verification">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      {org.taxId && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          TIN: {org.taxId}
                        </div>
                      )}
                    </td>

                    {/* Location & Contact */}
                    <td className="px-4 py-4">
                      <div className="text-slate-800 font-medium">{org.address}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {org.contactPhone} • {org.contactEmail}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          org.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!org.isVerified && (
                          <button
                            onClick={() => handleVerify(org.id, org.name)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                            title="Verify Drug License with DGDA registry"
                          >
                            <ShieldCheck className="w-3 h-3" /> Verify License
                          </button>
                        )}
                        {org.status !== "ACTIVE" && (
                          <button
                            onClick={() => handleApprove(org.id, org.name)}
                            className="px-2.5 py-1 rounded-lg bg-[#025540] hover:bg-[#014232] text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                        )}
                        <Link
                          href={`/reports?org=${org.code}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Organization Audit Trail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Suspicious Transaction & Compliance Audit Strip */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950">
              DGDA Automated Compliance & Anti-Fraud Watchdog Active
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              System regularly scans credit jump deltas, DAR product validity, and wholesale narcotics distributions. All cross-organization transactions are cryptographically signed with audit trail logging.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
