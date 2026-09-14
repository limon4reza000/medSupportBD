"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Clock,
  Plus,
  TrendingUp,
  FileText,
  Boxes,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function SalesPharmacyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { pharmacies, orders, setIsQuickOrderOpen } = useApp();

  const pharmacy = pharmacies.find((p) => p.id === id) || pharmacies[0];
  const pharmOrders = orders.filter((o) => o.pharmacyId === pharmacy.id);
  const availableCredit = Math.max(0, pharmacy.creditLimit - pharmacy.currentBalance);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <div>
        <Link
          href="/sales/pharmacies"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pharmacies List</span>
        </Link>
      </div>

      {/* Main Profile Header Card (Pure White Card) */}
      <div className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              DGDA Licensed Pharmacy
            </span>
            <span className="text-xs text-slate-400 font-mono">Code: {pharmacy.code}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{pharmacy.tradeName}</h1>
          <div className="text-xs text-slate-500 mt-0.5">Proprietor: <strong className="text-slate-800">{pharmacy.ownerName}</strong></div>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{pharmacy.address}, {pharmacy.thana}, {pharmacy.district}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{pharmacy.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Lic: {pharmacy.drugLicenseNo}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsQuickOrderOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start md:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cut Order for {pharmacy.tradeName.split(" ")[0]}</span>
        </button>
      </div>

      {/* Credit & Performance Gauges (Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Credit Limit</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{pharmacy.creditLimit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Revolving 30-Day terms</div>
        </div>

        <div className="premium-card p-5 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Available Headroom</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            ৳{availableCredit.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Eligible for instant order dispatch</div>
        </div>

        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Outstanding</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{pharmacy.currentBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">0 Overdue Invoices</div>
        </div>
      </div>

      {/* Orders History for This Pharmacy (Pure White Card) */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Recent Orders & Invoices ({pharmOrders.length})
          </h2>
        </div>

        <div className="space-y-3">
          {pharmOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No previous orders found for this store.
            </div>
          ) : (
            pharmOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{ord.orderNumber}</div>
                  <div className="text-[11px] text-slate-500">
                    {ord.totalItems} SKUs • {ord.totalLoosePieces} pcs ({ord.totalBonusPieces} bonus pcs)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-emerald-800">
                    ৳{ord.netPayableAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">{ord.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
