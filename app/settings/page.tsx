"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoFefoAllocation, setAutoFefoAllocation] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>System & Procurement Preferences</span>
        </h1>
        <p className="text-xs text-emerald-100/80 mt-0.5">
          Configure real-time dispatch alerts, FEFO auto-allocation horizons, and security policies.
        </p>
      </div>

      {isSaved && (
        <div className="premium-card p-4 border-emerald-300 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Settings Options (Pure White Card) */}
      <div className="premium-card p-6 space-y-6">
        
        {/* Section 1: Order & Allocation Rules */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Automated Warehouse & FEFO Allocation Rules
          </h2>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
            <div>
              <div className="font-bold text-xs text-slate-900">Enforce Strict FEFO Allocation</div>
              <p className="text-[11px] text-slate-500">Automatically reserve stock from nearest expiration batch lot first.</p>
            </div>
            <input
              type="checkbox"
              checked={autoFefoAllocation}
              onChange={(e) => setAutoFefoAllocation(e.target.checked)}
              className="w-4 h-4 accent-emerald-700"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
            <div>
              <div className="font-bold text-xs text-slate-900">Near-Expiry Threshold Warning</div>
              <p className="text-[11px] text-slate-500">Flag lots expiring within 90 days with amber priority badges.</p>
            </div>
            <span className="font-mono font-bold text-xs text-slate-900 bg-white px-3 py-1 rounded-lg border">90 Days</span>
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Notification & SMS Dispatch Alerts
          </h2>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
            <div>
              <div className="font-bold text-xs text-slate-900">SMS Dispatch Updates to Pharmacy Mobile</div>
              <p className="text-[11px] text-slate-500">Send instant SMS whenever orders are dispatched with courier tracking.</p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-700"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
            <div>
              <div className="font-bold text-xs text-slate-900">Email Invoices & Daily Ledger Statements</div>
              <p className="text-[11px] text-slate-500">Deliver digital PDF tax invoices and daily closing ledger balance.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-700"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>

      </div>

    </div>
  );
}
