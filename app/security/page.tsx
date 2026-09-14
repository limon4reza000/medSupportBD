"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  LogOut,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Check,
  Plus,
  ChevronRight,
  UserCheck,
  Cpu,
  MessageSquare,
  Mail,
  Phone,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

// Types
interface DeviceSession {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  name: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  loginDate: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ActivityLog {
  id: string;
  event: string;
  type: "SUCCESS" | "WARNING" | "DANGER" | "INFO";
  device: string;
  location: string;
  ip: string;
  timestamp: string;
}

export default function SecurityCenterPage() {
  const { currentUser, currentPharmacy } = useApp();

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [logoutOtherDevicesOnPassChange, setLogoutOtherDevicesOnPassChange] = useState(true);

  // Active Sessions State
  const [devices, setDevices] = useState<DeviceSession[]>([
    {
      id: "dev-01",
      deviceType: "desktop",
      name: "Chrome on Windows 11",
      browser: "Chrome 128.0",
      os: "Windows 11 Enterprise",
      location: "Dhaka, Bangladesh",
      ip: "202.181.16.19",
      loginDate: "2026-09-14 08:30 AM",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "dev-02",
      deviceType: "mobile",
      name: "iPhone 15 Pro (Safari)",
      browser: "Mobile Safari 17.5",
      os: "iOS 17.5.1",
      location: "Chittagong, Bangladesh",
      ip: "103.112.54.12",
      loginDate: "2026-09-14 06:15 PM",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "dev-03",
      deviceType: "desktop",
      name: "MacBook Pro (Chrome)",
      browser: "Chrome 127.0",
      os: "macOS Sonoma 14.5",
      location: "Dhaka, Bangladesh",
      ip: "119.30.38.100",
      loginDate: "2026-09-13 04:15 PM",
      lastActive: "Yesterday",
      isCurrent: false,
    },
    {
      id: "dev-04",
      deviceType: "tablet",
      name: "Android Tablet (MedSupply App)",
      browser: "MedSupply Native Client",
      os: "Android 14",
      location: "Sylhet, Bangladesh",
      ip: "27.147.198.5",
      loginDate: "2026-09-11 10:00 AM",
      lastActive: "3 days ago",
      isCurrent: false,
    },
  ]);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [selected2FAMethod, setSelected2FAMethod] = useState<"SMS" | "AUTHENTICATOR" | "EMAIL">("SMS");
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Security Alert Toggles State
  const [alerts, setAlerts] = useState({
    newDeviceLogin: true,
    passwordChange: true,
    suspiciousActivity: true,
    multipleFailedLogins: true,
    channelEmail: true,
    channelSMS: true,
    channelPush: true,
  });

  // Login Activity Timeline
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "log-1",
      event: "Successful Login",
      type: "SUCCESS",
      device: "Chrome • Windows 11",
      location: "Dhaka, Bangladesh",
      ip: "202.181.16.19",
      timestamp: "Today, 09:42 PM",
    },
    {
      id: "log-2",
      event: "New Device Login Approved",
      type: "INFO",
      device: "iPhone 15 Pro • Safari",
      location: "Chittagong, Bangladesh",
      ip: "103.112.54.12",
      timestamp: "Today, 06:15 PM",
    },
    {
      id: "log-3",
      event: "Password Changed Successfully",
      type: "SUCCESS",
      device: "Chrome • Windows 11",
      location: "Dhaka, Bangladesh",
      ip: "202.181.16.19",
      timestamp: "Yesterday, 08:15 PM",
    },
    {
      id: "log-4",
      event: "Failed Login Attempt Blocked",
      type: "DANGER",
      device: "Unknown Client",
      location: "Moscow, Russia",
      ip: "185.220.101.5",
      timestamp: "Sep 12, 10:20 AM",
    },
    {
      id: "log-5",
      event: "2FA Verification Completed (SMS OTP)",
      type: "SUCCESS",
      device: "Chrome • Windows 11",
      location: "Dhaka, Bangladesh",
      ip: "202.181.16.19",
      timestamp: "Sep 10, 11:00 AM",
    },
  ]);

  // Connected Apps
  const [connectedApps, setConnectedApps] = useState([
    { id: "app-1", name: "Teletalk Enterprise SMS Gateway", type: "SMS Dispatch API", connectedDate: "2026-01-15", status: "Active" },
    { id: "app-[#a]", name: "QuickBooks ERP Synchronization", type: "Accounting Webhook", connectedDate: "2026-03-20", status: "Active" },
    { id: "app-[#b]", name: "MedSupply Public API Key", type: "REST API Access", connectedDate: "2026-05-10", status: "Active" },
  ]);

  // Password Requirements Check
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-[#a]-z0-9]/.test(newPassword);

  const reqCount = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const passwordStrengthScore = Math.min(100, reqCount * 20);

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: "Not Entered", color: "bg-slate-200 text-slate-500" };
    if (reqCount <= 2) return { label: "Weak", color: "bg-rose-500 text-white" };
    if (reqCount === 3 || reqCount === 4) return { label: "Medium", color: "bg-amber-500 text-white" };
    return { label: "Strong & Secure", color: "bg-emerald-600 text-white" };
  };

  // Actions
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }
    if (reqCount < 5) {
      showToast("Please satisfy all password security requirements.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match.", "error");
      return;
    }

    if (logoutOtherDevicesOnPassChange) {
      setDevices((prev) => prev.filter((d) => d.isCurrent));
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password changed successfully! Security confirmation sent via Email & SMS.");
  };

  const handleRemoveDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    showToast("Device session terminated and removed successfully!");
  };

  const handleRevokeAllOtherDevices = () => {
    setDevices((prev) => prev.filter((d) => d.isCurrent));
    showToast("Successfully logged out from all other 3 devices!");
  };

  const handleRevokeApp = (id: string) => {
    setConnectedApps((prev) => prev.filter((a) => a.id !== id));
    showToast("Integration API access revoked successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xl border transition-all animate-in slide-in-from-top ${
            toastMessage.type === "success"
              ? "bg-emerald-900 text-white border-emerald-500"
              : "bg-rose-900 text-white border-rose-500"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-80">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* HEADER SECTION & SUMMARY CARDS                                      */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <span>Security & Login Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Manage your password, multi-factor authentication, active devices, and account protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="px-4 py-2 rounded-xl bg-[#014232] hover:bg-[#025540] border border-emerald-500/30 text-emerald-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            <span>System Settings</span>
          </Link>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Password Status */}
        <div className="premium-card p-5 flex flex-col justify-between space-y-4 text-slate-900 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Password Protection</div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">Password Status: <span className="text-emerald-700">Healthy</span></div>
            <div className="text-xs text-slate-500 mt-1">Last changed 45 days ago (Sep 2026)</div>
          </div>

          <a
            href="#change-password"
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 text-xs font-bold transition-colors text-center block"
          >
            Change Password
          </a>
        </div>

        {/* Card 2: Active Sessions */}
        <div className="premium-card p-5 flex flex-col justify-between space-y-4 text-slate-900 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Active Devices</div>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800">
              <Laptop className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">
              {devices.length} Devices Currently Logged In
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Current: Chrome on Windows 11 (Dhaka)
            </div>
          </div>

          <a
            href="#active-devices"
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-950 text-xs font-bold transition-colors text-center block"
          >
            Manage Devices ({devices.length})
          </a>
        </div>

        {/* Card 3: Two-Factor Authentication */}
        <div className="premium-card p-5 flex flex-col justify-between space-y-4 text-slate-900 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Two-Factor Authentication</div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">2FA Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                is2FAEnabled ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800"
              }`}>
                {is2FAEnabled ? "ENABLED (SMS OTP)" : "DISABLED"}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Extra security verification code via SMS & Email</div>
          </div>

          <a
            href="#two-factor-auth"
            className="w-full py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-colors text-center block"
          >
            {is2FAEnabled ? "Configure 2FA" : "Setup 2FA Now"}
          </a>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 1. CHANGE PASSWORD SECTION                                          */}
      {/* =================================================================== */}
      <div id="change-password" className="premium-card p-6 text-slate-900 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Change Account Password</h2>
              <p className="text-xs text-slate-500">Create a strong password with at least 8 characters, numbers, and special symbols.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            {/* Current Password */}
            <div>
              <label className="font-bold text-slate-700">Current Password:</label>
              <div className="relative mt-1.5">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="font-bold text-slate-700">New Password:</label>
              <div className="relative mt-1.5">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create new password..."
                  className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-bold text-slate-700">Confirm New Password:</label>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Password Strength Evaluation:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${getStrengthLabel().color}`}>
                  {getStrengthLabel().label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrengthScore <= 40
                      ? "bg-rose-500"
                      : passwordStrengthScore <= 80
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${passwordStrengthScore}%` }}
                />
              </div>

              {/* Requirements List Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                <div className={`flex items-center gap-1 font-semibold ${hasMinLen ? "text-emerald-700" : "text-slate-400"}`}>
                  {hasMinLen ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Min 8 chars</span>
                </div>

                <div className={`flex items-center gap-1 font-semibold ${hasUpper ? "text-emerald-700" : "text-slate-400"}`}>
                  {hasUpper ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Uppercase (A-Z)</span>
                </div>

                <div className={`flex items-center gap-1 font-semibold ${hasLower ? "text-emerald-700" : "text-slate-400"}`}>
                  {hasLower ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Lowercase (a-z)</span>
                </div>

                <div className={`flex items-center gap-1 font-semibold ${hasNumber ? "text-emerald-700" : "text-slate-400"}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Number (0-9)</span>
                </div>

                <div className={`flex items-center gap-1 font-semibold ${hasSpecial ? "text-emerald-700" : "text-slate-400"}`}>
                  {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Special (!@#$)</span>
                </div>
              </div>
            </div>
          )}

          {/* Post-Change Security Behavior Options */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-emerald-950">Security Action After Password Update:</div>
              <p className="text-[11px] text-slate-600">Automatically logout all other devices and send instant Email & SMS notifications.</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900 shrink-0">
              <input
                type="checkbox"
                checked={logoutOtherDevicesOnPassChange}
                onChange={(e) => setLogoutOtherDevicesOnPassChange(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
              <span>Logout All Other Devices</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save New Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>

      {/* =================================================================== */}
      {/* 2. ACTIVE DEVICES MANAGEMENT ("Where you're logged in")             */}
      {/* =================================================================== */}
      <div id="active-devices" className="premium-card p-6 text-slate-900 space-y-5">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-emerald-700" />
              <span>Where You're Logged In</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              You are currently logged in on <strong className="text-slate-900 font-bold">{devices.length} active devices</strong>.
            </p>
          </div>

          {devices.length > 1 && (
            <button
              onClick={handleRevokeAllOtherDevices}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout All Other Devices</span>
            </button>
          )}
        </div>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => {
            const isDesktop = device.deviceType === "desktop";
            const isMobile = device.deviceType === "mobile";
            const DeviceIcon = isDesktop ? Laptop : isMobile ? Smartphone : Tablet;

            return (
              <div
                key={device.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  device.isCurrent
                    ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${device.isCurrent ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                      <DeviceIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{device.name}</span>
                        {device.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-700 text-white uppercase tracking-wider">
                            CURRENT DEVICE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{device.browser} • {device.os}</div>
                    </div>
                  </div>
                </div>

                {/* Device Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100/80">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Location</span>
                    <div className="font-semibold text-slate-800 truncate">{device.location}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">IP Address</span>
                    <div className="font-mono text-slate-800 truncate">{device.ip}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Login Date</span>
                    <div className="text-slate-700 truncate">{device.loginDate}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Last Active</span>
                    <div className="font-semibold text-emerald-800 truncate">{device.lastActive}</div>
                  </div>
                </div>

                {/* Actions */}
                {!device.isCurrent && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Device Session</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. LOGIN HISTORY & ACTIVITY TIMELINE                                */}
      {/* =================================================================== */}
      <div className="premium-card p-6 text-slate-900 space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>Login & Security Activity Log</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Recent account security events, logins, failed attempts, and password changes.</p>
          </div>

          <button
            onClick={() => showToast("Security logs refreshed!")}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3">
          {activityLogs.map((log) => {
            const isDanger = log.type === "DANGER";
            const isInfo = log.type === "INFO";

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isDanger
                        ? "bg-rose-100 text-rose-700"
                        : isInfo
                        ? "bg-teal-100 text-teal-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isDanger ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{log.event}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isDanger
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : isInfo
                            ? "bg-teal-100 text-teal-800 border border-teal-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {log.type}
                      </span>
                    </div>

                    <div className="text-slate-600 mt-0.5">
                      {log.device} • <span className="font-medium text-slate-800">{log.location}</span> (IP: {log.ip})
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 shrink-0">
                  {log.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. TWO-FACTOR AUTHENTICATION & RECOVERY CODES                      */}
      {/* =================================================================== */}
      <div id="two-factor-auth" className="premium-card p-6 text-slate-900 space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Two-Factor Authentication (2FA)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of defense by requiring an OTP code in addition to your password.</p>
          </div>

          <button
            onClick={() => {
              setIs2FAEnabled(!is2FAEnabled);
              showToast(is2FAEnabled ? "Two-Factor Authentication disabled." : "Two-Factor Authentication enabled!");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              is2FAEnabled
                ? "bg-emerald-800 text-white hover:bg-emerald-900"
                : "bg-rose-600 text-white hover:bg-rose-700"
            }`}
          >
            {is2FAEnabled ? "2FA ENABLED" : "ENABLE 2FA NOW"}
          </button>
        </div>

        {/* 2FA Methods Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Method 1: SMS OTP */}
          <div
            onClick={() => setSelected2FAMethod("SMS")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selected2FAMethod === "SMS"
                ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Phone className="w-5 h-5 text-emerald-700" />
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">PRIMARY</span>
            </div>
            <div className="font-bold text-slate-900">SMS OTP Verification</div>
            <div className="text-[11px] text-slate-500 mt-1">Receive 6-digit passcode via SMS to {currentPharmacy.phone}</div>
          </div>

          {/* Method 2: Authenticator App */}
          <div
            onClick={() => setSelected2FAMethod("AUTHENTICATOR")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selected2FAMethod === "AUTHENTICATOR"
                ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5 text-teal-700" />
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800">CONNECTED</span>
            </div>
            <div className="font-bold text-slate-900">Authenticator App</div>
            <div className="text-[11px] text-slate-500 mt-1">Google Authenticator, Authy, or Microsoft Authenticator</div>
          </div>

          {/* Method 3: Email Verification */}
          <div
            onClick={() => setSelected2FAMethod("EMAIL")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selected2FAMethod === "EMAIL"
                ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-slate-600" />
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">BACKUP</span>
            </div>
            <div className="font-bold text-slate-900">Email Verification</div>
            <div className="text-[11px] text-slate-500 mt-1">Receive backup authorization links to {currentUser.email}</div>
          </div>

        </div>

        {/* Emergency Backup Codes Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-900">Emergency Backup Recovery Codes</div>
            <div className="text-[11px] text-slate-500">10 one-time use codes for emergency access when phone is lost.</div>
          </div>

          <button
            onClick={() => {
              setShowBackupCodes(!showBackupCodes);
              showToast("Backup recovery codes generated!");
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{showBackupCodes ? "Hide Backup Codes" : "Generate Backup Codes"}</span>
          </button>
        </div>

        {showBackupCodes && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 animate-in fade-in">
            <div className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
              10 One-Time Emergency Backup Codes (Keep Secret):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-emerald-200 font-bold pt-1">
              <div className="p-2 bg-slate-800 rounded-lg">8941-2093</div>
              <div className="p-2 bg-slate-800 rounded-lg">4410-9821</div>
              <div className="p-2 bg-slate-800 rounded-lg">7712-4091</div>
              <div className="p-2 bg-slate-800 rounded-lg">3320-1194</div>
              <div className="p-2 bg-slate-800 rounded-lg">5592-8810</div>
              <div className="p-2 bg-slate-800 rounded-lg">9012-6631</div>
              <div className="p-2 bg-slate-800 rounded-lg">1184-7720</div>
              <div className="p-2 bg-slate-800 rounded-lg">6632-4419</div>
              <div className="p-2 bg-slate-800 rounded-lg">2281-9034</div>
              <div className="p-2 bg-slate-800 rounded-lg">5049-3381</div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 5. SECURITY ALERTS & NOTIFICATIONS                                  */}
      {/* =================================================================== */}
      <div className="premium-card p-6 text-slate-900 space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
            <span>Security Alerts & Notifications</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Control when and how MedSupply alerts you of security events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">New Device Login Alert</div>
              <p className="text-[11px] text-slate-500">Alert when a new browser or phone logs into account.</p>
            </div>
            <input
              type="checkbox"
              checked={alerts.newDeviceLogin}
              onChange={(e) => setAlerts({ ...alerts, newDeviceLogin: e.target.checked })}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Password Change Alert</div>
              <p className="text-[11px] text-slate-500">Instant notification whenever account password is updated.</p>
            </div>
            <input
              type="checkbox"
              checked={alerts.passwordChange}
              onChange={(e) => setAlerts({ ...alerts, passwordChange: e.target.checked })}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Suspicious Activity Warning</div>
              <p className="text-[11px] text-slate-500">Notify if logins originate from unexpected foreign IPs.</p>
            </div>
            <input
              type="checkbox"
              checked={alerts.suspiciousActivity}
              onChange={(e) => setAlerts({ ...alerts, suspiciousActivity: e.target.checked })}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Multiple Failed Login Alerts</div>
              <p className="text-[11px] text-slate-500">Lock account after 5 consecutive wrong password attempts.</p>
            </div>
            <input
              type="checkbox"
              checked={alerts.multipleFailedLogins}
              onChange={(e) => setAlerts({ ...alerts, multipleFailedLogins: e.target.checked })}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
          </div>

        </div>

        <button
          onClick={() => showToast("Security alert preferences saved!")}
          className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Alert Preferences</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 6. CONNECTED APPLICATIONS & ERP API INTEGRATIONS                   */}
      {/* =================================================================== */}
      <div className="premium-card p-6 text-slate-900 space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <span>Connected Integrations & API Access</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Third-party ERP software, SMS gateways, and webhook connectors.</p>
          </div>
        </div>

        <div className="space-y-3">
          {connectedApps.map((app) => (
            <div
              key={app.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{app.name}</div>
                  <div className="text-[11px] text-slate-500">{app.type} • Connected since {app.connectedDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {app.status}
                </span>
                <button
                  onClick={() => handleRevokeApp(app.id)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 7. ACCOUNT RECOVERY                                                 */}
      {/* =================================================================== */}
      <div className="premium-card p-6 text-slate-900 space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-700" />
            <span>Account Emergency Recovery</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure emergency email and phone number for password recovery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700">Backup Recovery Email:</label>
            <input
              type="email"
              defaultValue="recovery.greencare@gmail.com"
              className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700">Backup Recovery Phone Number:</label>
            <input
              type="text"
              defaultValue="+880 1819-998877"
              className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>

        <button
          onClick={() => showToast("Emergency recovery contact information saved!")}
          className="px-6 py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Recovery Information</span>
        </button>
      </div>

    </div>
  );
}
