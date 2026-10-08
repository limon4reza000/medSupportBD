"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Briefcase,
  Target,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  Clock,
  Phone,
  FileText,
  DollarSign,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  ChevronRight,
  Award,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { IMrVisit } from "@/types/domain";

export default function MrPortalPage() {
  const {
    pharmacies,
    orders,
    mrVisits,
    mrTarget,
    addMrVisit,
    updateMrTarget,
    currentPharmacy,
  } = useApp();

  // Privacy Lock Gate State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"VISITS" | "ORDERS" | "TARGET">("VISITS");

  // Log Visit Modal State
  const [isLogVisitOpen, setIsLogVisitOpen] = useState(false);
  const [pharmacyName, setPharmacyName] = useState(pharmacies[0]?.tradeName || "");
  const [contactPerson, setContactPerson] = useState(pharmacies[0]?.ownerName || "");
  const [contactPhone, setContactPhone] = useState(pharmacies[0]?.phone || "");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitPurpose, setVisitPurpose] = useState("Monsoon Stock Audit & Trade Scheme Briefing");
  const [visitNotes, setVisitNotes] = useState("");
  const [ordersCollectedAmount, setOrdersCollectedAmount] = useState<number>(0);

  // Target metrics calculation
  const totalTarget = mrTarget.targetAmount;
  const achieved = mrTarget.achievedAmount;
  const percentAchieved = Math.min(100, Math.round((achieved / totalTarget) * 100));
  const commissionEarned = Math.round(achieved * (mrTarget.incentiveRatePercent / 100));

  // Passcode unlock check
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" || passcode.length >= 4) {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleQuickDemoUnlock = () => {
    setIsUnlocked(true);
    setPasscodeError(false);
  };

  const handleLogVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMrVisit({
      pharmacyName,
      pharmacyAddress: "Dhaka Central Route",
      contactPerson,
      contactPhone,
      visitDate,
      purpose: visitPurpose,
      notes: visitNotes || "Stock levels inspected and trade schemes discussed.",
      ordersCollectedAmount,
      status: "COMPLETED",
    });

    if (ordersCollectedAmount > 0) {
      updateMrTarget({
        achievedAmount: mrTarget.achievedAmount + ordersCollectedAmount,
      });
    }

    setIsLogVisitOpen(false);
    setVisitNotes("");
    setOrdersCollectedAmount(0);
  };

  // ---------------------------------------------------------------------------
  // 1. LOCKED CONFIDENTIAL GATE (Hidden from staff & owners)
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-slate-950/20">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 inline-block mb-2">
              Confidential Medical Promotion Officer Workspace
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              MR / Area Manager Security Gate
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This panel contains proprietary distributor targets, commission slabs, and field visit notes. <strong>Strictly hidden from pharmacy owners and retail billing staff.</strong>
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter 4-Digit MR PIN (Default: 1234)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono text-center text-base tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              {passcodeError && (
                <span className="text-[11px] text-rose-600 font-bold block mt-1">
                  Incorrect Security Passcode. Try 1234.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#065F52] hover:bg-[#044a40] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Verify & Unlock Portal</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleQuickDemoUnlock}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
            >
              1-Click Instant Demo Unlock (PIN: 1234)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. UNLOCKED PRIVATE MR WORKSPACE
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner with Lock Security Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#044a40] p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              🔒 Private MR Mode Active
            </span>
            <span className="text-xs text-emerald-200 font-mono">Territory MPO: Tariqul Anam (SR-104)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            MR & Territory Field Manager Portal
          </h1>
          <p className="text-xs text-slate-300">
            Assigned pharmacy routes, doctor & chemist call records, collected order balances, and monthly commission targets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsLogVisitOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Pharmacy Visit</span>
          </button>

          <button
            onClick={() => setIsUnlocked(false)}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/30 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            title="Lock Portal (Hide from staff)"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* KPI Target & Incentive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Monthly Target */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {mrTarget.month} Target
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{totalTarget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dhaka Central Route Quota</div>
        </div>

        {/* Achieved Orders */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-300 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Achieved Orders Cut</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            ৳{achieved.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            {percentAchieved}% Quota Completed
          </div>
        </div>

        {/* Commission / Incentive Earned */}
        <div className="bg-white rounded-3xl p-5 border border-purple-200 shadow-sm">
          <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>Incentive Commission ({mrTarget.incentiveRatePercent}%)</span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-700 mt-1">
            ৳{commissionEarned.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Silver Tier Bonus Tier</div>
        </div>

        {/* Assigned Pharmacies */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Assigned Territory Stores
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {pharmacies.length} Pharmacies
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{mrVisits.length} Field Visits Recorded</div>
        </div>

      </div>

      {/* Target Progress Bar Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-baseline text-xs font-bold">
          <span className="text-slate-700">Monthly Target Fulfillment Gauge</span>
          <span className="font-mono text-emerald-700 text-sm">{percentAchieved}% of Quota</span>
        </div>

        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${percentAchieved}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>৳0</span>
          <span>Target: ৳{totalTarget.toLocaleString()}</span>
          <span>Overachieve Bonus (120%): ৳{(totalTarget * 1.2).toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs: Route Visits vs Orders Collected */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab("VISITS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "VISITS" ? "bg-[#065F52] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Pharmacy Route Visits ({mrVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ORDERS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "ORDERS" ? "bg-[#065F52] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Orders Collected by MR ({orders.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PHARMACY VISITS TIMELINE                                     */}
      {/* =================================================================== */}
      {activeTab === "VISITS" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Field Visits & Discussion Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Logged visits to assigned pharmacies, stock audit notes, and orders booked.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mrVisits.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{v.pharmacyName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">{v.purpose}</p>
                  <p className="text-xs text-slate-500">{v.notes}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                    <span>Contact: {v.contactPerson} ({v.contactPhone})</span>
                    <span>Visit Date: {v.visitDate}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Order Booked
                  </span>
                  <strong className="text-base font-mono font-black text-emerald-700">
                    ৳{v.ordersCollectedAmount.toLocaleString()}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ORDERS COLLECTED TABLE                                       */}
      {/* =================================================================== */}
      {activeTab === "ORDERS" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Pharmacy Client</th>
                  <th className="pb-3">Total Items</th>
                  <th className="pb-3 text-right">Order Amount (৳)</th>
                  <th className="pb-3 text-right">Estimated Commission (4.5%)</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => {
                  const comm = Math.round(ord.netPayableAmount * 0.045);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3 text-slate-500">
                        {new Date(ord.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-bold text-slate-900">{ord.pharmacyName}</td>
                      <td className="py-3 text-slate-700">{ord.totalItems} SKUs ({ord.totalLoosePieces} pcs)</td>
                      <td className="py-3 text-right font-mono font-black text-slate-900">
                        ৳{ord.netPayableAmount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        +৳{comm.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      {isLogVisitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-[#044a40] text-white flex items-center justify-between">
              <h3 className="font-black text-base">Log Field Visit to Pharmacy</h3>
              <button onClick={() => setIsLogVisitOpen(false)}>
                <Lock className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <form onSubmit={handleLogVisitSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Pharmacy</label>
                <select
                  value={pharmacyName}
                  onChange={(e) => {
                    setPharmacyName(e.target.value);
                    const p = pharmacies.find((x) => x.tradeName === e.target.value);
                    if (p) {
                      setContactPerson(p.ownerName);
                      setContactPhone(p.phone);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                >
                  {pharmacies.map((p) => (
                    <option key={p.id} value={p.tradeName}>
                      {p.tradeName} ({p.thana})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Order Booked (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={ordersCollectedAmount}
                    onChange={(e) => setOrdersCollectedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Visit Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon trade bonus presentation"
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discussion Notes</label>
                <textarea
                  rows={2}
                  placeholder="Chemist comments, doctor prescriptions, competitor discounts..."
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogVisitOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Visit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
