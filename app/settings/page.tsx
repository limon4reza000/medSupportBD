"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Building2,
  ShoppingCart,
  Layers,
  CreditCard,
  Sparkles,
  Bell,
  Palette,
  Cpu,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Key,
  Users,
  Clock,
  Truck,
  AlertTriangle,
  FileCheck,
  Database,
  Download,
  Search,
  Check,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  MessageSquare,
  Activity,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function SettingsPage() {
  const { currentUser, currentPharmacy, updateUserProfile, updateUserAvatar } = useApp();
  const [activeTab, setActiveTab] = useState<string>("account");
  const [activeSubSection, setActiveSubSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState("Settings updated successfully!");

  // Dynamic Toggles State
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [strictFefo, setStrictFefo] = useState(true);
  const [nearExpiryThreshold, setNearExpiryThreshold] = useState("90");
  const [autoReorder, setAutoReorder] = useState(true);
  const [aiSlipParser, setAiSlipParser] = useState(true);
  const [aiForecasting, setAiForecasting] = useState(true);
  const [aiConfidence, setAiConfidence] = useState("HIGH");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [themeMode, setThemeMode] = useState("surgical-green");
  const [language, setLanguage] = useState("en");

  const handleSave = (msg = "Settings saved successfully!") => {
    setSavedMessage(msg);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const navCategories = [
    {
      id: "account",
      label: "Account",
      icon: User,
      description: "Profile, Security, Login & Connected Devices",
      subItems: ["Profile Information", "Security", "Login Activity", "Connected Devices", "Privacy"],
    },
    {
      id: "organization",
      label: "Pharmacy / Organization",
      icon: Building2,
      description: "Pharmacy Credentials, Branches & Staff",
      subItems: ["Pharmacy Profile", "Branch Management", "Business Information", "Staff & Permissions"],
    },
    {
      id: "procurement",
      label: "Orders & Procurement",
      icon: ShoppingCart,
      description: "Ordering Rules, Delivery & Auto Reorder",
      subItems: ["Order Preferences", "Delivery Settings", "Approval Rules", "Auto Reorder Settings"],
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Layers,
      description: "FEFO Rules, Expiry Alerts & Batch Traceability",
      subItems: ["FEFO Settings", "Expiry Alert Rules", "Stock Alert Settings", "Batch Visibility"],
    },
    {
      id: "finance",
      label: "Finance",
      icon: CreditCard,
      description: "Credit Headroom, Invoicing & Ledger Rules",
      subItems: ["Credit Settings", "Invoice Preferences", "Payment Notifications", "Transaction Preferences"],
    },
    {
      id: "ai",
      label: "AI Settings",
      icon: Sparkles,
      description: "OCR Slip Parser, Demand Forecasting & Thresholds",
      subItems: ["AI Slip Parser", "AI Forecasting", "Reorder Suggestions", "AI Confidence Level"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "SMS, WhatsApp & In-App Alerts",
      subItems: ["Order Alerts", "Dispatch Alerts", "Payment Alerts", "Stock Alerts", "Marketing Alerts"],
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Theme Colors, Language & Layout",
      subItems: ["Theme", "Language", "Dashboard Layout"],
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: Cpu,
      description: "SMS Gateways, WhatsApp API & Webhooks",
      subItems: ["SMS Gateway", "WhatsApp", "Accounting Software", "API Access"],
    },
    {
      id: "audit",
      label: "Audit & Activity",
      icon: FileText,
      description: "System Activity Logs & Data Export",
      subItems: ["Account Activity", "System Logs", "Data Export"],
    },
  ];

  const filteredCategories = navCategories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.label.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.subItems.some((item) => item.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* Settings Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-emerald-400" />
            <span>MedSupply BD System Settings</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Enterprise administration control center — Manage account, pharmacy licenses, FEFO rules, AI engines & security.
          </p>
        </div>

        {/* Global Settings Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search settings (e.g. FEFO, SMS, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#014232] border border-emerald-500/30 text-white placeholder-emerald-200/60 text-xs focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Global Toast Alert */}
      {isSaved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main 2-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: 10-Category Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-3 space-y-1 text-slate-900">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Settings Workspace
          </div>

          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isCurrent = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setActiveSubSection("");
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${
                    isCurrent
                      ? "bg-[#025540] text-white shadow-md font-bold"
                      : "hover:bg-emerald-50/70 text-slate-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isCurrent ? "text-emerald-300" : "text-emerald-700"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate flex items-center justify-between">
                      <span>{cat.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCurrent ? "rotate-90 text-emerald-300" : "opacity-0 group-hover:opacity-100"}`} />
                    </div>
                    <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? "text-emerald-100/80" : "text-slate-500"}`}>
                      {cat.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Settings Panel Content */}
        <div className="lg:col-span-3 premium-card p-6 space-y-6 text-slate-900">
          
          {/* =================================================================== */}
          {/* TAB 1: ACCOUNT SETTINGS                                             */}
          {/* =================================================================== */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-700" />
                    <span>Account & Security Settings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage user credentials, two-factor authentication, and connected devices.</p>
                </div>
              </div>

              {/* Section: Profile Information */}
              <div id="profile-info" className="space-y-4 pb-6 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">1. Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700">User Full Name:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.name}
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Email Address:</label>
                    <input
                      type="email"
                      defaultValue={currentUser.email}
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Security & 2FA */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">2. Security & Authentication</h3>
                
                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Two-Factor Authentication (2FA)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Require an SMS OTP code on every new login attempt.</p>
                  </div>
                  <button
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      twoFactorAuth ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {twoFactorAuth ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              </div>

              {/* Section: Connected Devices */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">3. Active Login Sessions & Connected Devices</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-emerald-700" />
                      <div>
                        <div className="font-bold text-slate-900">Chrome on Windows (Current Session)</div>
                        <div className="text-[10px] text-slate-500">Dhaka, Bangladesh • IP: 202.181.16.19</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE NOW
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="font-bold text-slate-900">MedSupply BD Mobile App (Android)</div>
                        <div className="text-[10px] text-slate-500">Dhaka, Bangladesh • Last active 2 hours ago</div>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-rose-600 hover:underline">Revoke Session</button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSave("Account security settings updated!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Account Settings</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: PHARMACY / ORGANIZATION                                      */}
          {/* =================================================================== */}
          {activeTab === "organization" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span>Pharmacy & Organization Master Settings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage Drug Licensing, registered pharmacy branches, TIN/BIN certificate, and staff permissions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Registered Pharmacy Trade Name:</label>
                  <input
                    type="text"
                    defaultValue={currentPharmacy.tradeName}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">DGDA Drug License Number:</label>
                  <input
                    type="text"
                    defaultValue={currentPharmacy.drugLicenseNo}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Owner / Lead Pharmacist:</label>
                  <input
                    type="text"
                    defaultValue={currentPharmacy.ownerName}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Tax Identification Number (TIN):</label>
                  <input
                    type="text"
                    defaultValue="TIN-8899-0012-BD"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Staff Member Permissions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Authorized Staff & Permissions</h3>
                  <button className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Staff Member
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-slate-100 p-2.5 font-bold text-slate-700">
                    <div>Staff Name</div>
                    <div>Designated Role</div>
                    <div>Permissions</div>
                    <div>Status</div>
                  </div>
                  <div className="grid grid-cols-4 p-2.5 border-t border-slate-100 items-center">
                    <div className="font-bold text-slate-900">Dr. Rafiqul Islam</div>
                    <div className="text-emerald-700 font-semibold">Pharmacy Owner</div>
                    <div>Full Admin Rights</div>
                    <div><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span></div>
                  </div>
                  <div className="grid grid-cols-4 p-2.5 border-t border-slate-100 items-center">
                    <div className="font-bold text-slate-900">Kamrul Hasan</div>
                    <div className="text-teal-700 font-semibold">Lead Dispenser</div>
                    <div>Orders & Cart Only</div>
                    <div><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSave("Pharmacy organization profile saved!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Organization Details</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: ORDERS & PROCUREMENT                                         */}
          {/* =================================================================== */}
          {activeTab === "procurement" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-700" />
                  <span>Orders & Procurement Rules</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Define order cutting rules, preferred delivery schedules, and purchase order approval limits.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Automatic Reorder Trigger</div>
                    <p className="text-[11px] text-slate-500">Automatically add fast-moving essential medicines to draft cart when stock drops below 14 days buffer.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReorder}
                    onChange={(e) => setAutoReorder(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Purchase Order (PO) Approval Threshold</div>
                    <p className="text-[11px] text-slate-500">Require pharmacy owner approval for any order exceeding this limit.</p>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    ৳50,000.00
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Preferred Depot Delivery Window</div>
                    <p className="text-[11px] text-slate-500">Target delivery shift for daily order dispatches.</p>
                  </div>
                  <select className="p-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-900">
                    <option>Same Day Evening Shift (4:00 PM - 7:00 PM)</option>
                    <option>Next Day Morning Shift (10:00 AM - 1:00 PM)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleSave("Procurement preferences saved!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Procurement Rules</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: INVENTORY & FEFO                                             */}
          {/* =================================================================== */}
          {activeTab === "inventory" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>FEFO & Batch Inventory Rules</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure First-Expiry-First-Out (FEFO) automated allocation horizons and batch visibility.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Enforce Strict FEFO Allocation Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Automatically reserve and bill stock from the nearest expiring batch lot to prevent dead stock accumulation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictFefo}
                    onChange={(e) => setStrictFefo(e.target.checked)}
                    className="w-5 h-5 accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Near-Expiry Warning Threshold</div>
                    <p className="text-[11px] text-slate-500">Flag lots expiring within this horizon with amber priority badges across order screens.</p>
                  </div>
                  <select
                    value={nearExpiryThreshold}
                    onChange={(e) => setNearExpiryThreshold(e.target.value)}
                    className="p-2 rounded-lg bg-white border border-slate-200 font-bold text-slate-900"
                  >
                    <option value="30">30 Days Horizon</option>
                    <option value="60">60 Days Horizon</option>
                    <option value="90">90 Days Horizon (Recommended)</option>
                    <option value="120">120 Days Horizon</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleSave("FEFO inventory policies updated!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Inventory Rules</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 5: FINANCE & CREDIT                                             */}
          {/* =================================================================== */}
          {activeTab === "finance" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                  <span>Finance, Credit & Ledger Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage credit limits, automated payment notifications, and tax invoice preferences.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 space-y-1">
                  <div className="text-slate-500 font-medium">Assigned Credit Limit:</div>
                  <div className="text-xl font-mono font-black text-emerald-800">৳120,000.00</div>
                  <div className="text-[10px] text-slate-400">Set by Dhaka Central Depot Finance Committee</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 space-y-1">
                  <div className="text-slate-500 font-medium">Current Payment Terms:</div>
                  <div className="text-xl font-bold text-slate-900">Net 30-Day Credit</div>
                  <div className="text-[10px] text-emerald-700 font-bold">Standard DGDA Compliant Credit Terms</div>
                </div>
              </div>

              <button
                onClick={() => handleSave("Finance preferences updated!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Finance Settings</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 6: AI SETTINGS                                                  */}
          {/* =================================================================== */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>AI Engine & OCR Slip Parser Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure OCR image scanning thresholds, predictive demand forecasters, and confidence levels.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>AI Slip Parser (OCR Hand-written Scan)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">Automatically extract medicine names and quantities from uploaded photo slips.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiSlipParser}
                    onChange={(e) => setAiSlipParser(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">AI Confidence Level Requirement</div>
                    <p className="text-[11px] text-slate-500">Minimum AI confidence score before auto-adding items to order matrix.</p>
                  </div>
                  <select
                    value={aiConfidence}
                    onChange={(e) => setAiConfidence(e.target.value)}
                    className="p-2 rounded-lg bg-white border border-slate-200 font-bold text-slate-900"
                  >
                    <option value="HIGH">High (90%+ Accuracy Required)</option>
                    <option value="MEDIUM">Medium (80%+ Accuracy)</option>
                    <option value="LOW">Low (Prompt for manual review)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleSave("AI Engine configurations updated!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save AI Engine Settings</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 7: NOTIFICATIONS                                                */}
          {/* =================================================================== */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-700" />
                  <span>Notification & Dispatch Alerts</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Control SMS, WhatsApp, and email alerts for dispatch, credit, and near-expiry stock.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900">SMS Courier Dispatch Alerts</div>
                    <p className="text-[11px] text-slate-500">Send real-time SMS to pharmacy mobile when depot driver leaves with order.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900">WhatsApp Business Notifications</div>
                    <p className="text-[11px] text-slate-500">Receive digital invoices, batch expiry alerts, and promo schemes on WhatsApp.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave("Notification alerts preferences saved!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 8: APPEARANCE                                                   */}
          {/* =================================================================== */}
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-700" />
                  <span>Appearance & Localization</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize application color theme, language, and table density.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Application Theme:</label>
                  <select
                    value={themeMode}
                    onChange={(e) => setThemeMode(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="surgical-green">Surgical Green #025540 (Default)</option>
                    <option value="dark-emerald">Dark Emerald SaaS Mode</option>
                    <option value="system">System Default Theme</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">System Language:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="en">English (UK / Global)</option>
                    <option value="bn">বাংলা (Bengali Healthcare)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleSave("Appearance settings saved!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Appearance</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 9: INTEGRATIONS                                                 */}
          {/* =================================================================== */}
          {activeTab === "integrations" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-700" />
                  <span>Integrations & Developer API Keys</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Connect SMS gateways, WhatsApp APIs, accounting ERP software, and webhooks.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="font-bold text-slate-900">Teletalk Enterprise SMS Gateway</div>
                      <div className="text-[11px] text-slate-500">Connected • API Status: 99.99% Uptime</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    CONNECTED
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-bold text-slate-900">MedSupply Public API Key</div>
                      <div className="font-mono text-[10px] text-slate-500">med_live_pk_99482710398471...</div>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 text-xs">
                    Copy Key
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleSave("Integration configurations saved!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Integrations</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 10: AUDIT & ACTIVITY                                            */}
          {/* =================================================================== */}
          {activeTab === "audit" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <span>Audit Logs & System Activity</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Immutable system audit trail, user activity logs, and catalog data export.</p>
                </div>
                <button
                  onClick={() => handleSave("Medicine catalog export initiated (CSV)!")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Catalog (CSV)</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Order #ORD-2026-0914-01 Created</div>
                      <div className="text-[10px] text-slate-500">Executed by Dr. Rafiqul Islam • 10 mins ago</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    SUCCESS
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">FEFO Batch Lot BN-2024-NAPA-01 Billed</div>
                      <div className="text-[10px] text-slate-500">Automated allocation engine • Expiry: 2026-11-30</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    FEFO ALLOCATED
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">User Profile Settings Updated</div>
                      <div className="text-[10px] text-slate-500">Executed by System Admin • Today, 08:30 AM</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    AUDITED
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSave("Audit log report generated!")}
                className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Audit Log Preferences</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
