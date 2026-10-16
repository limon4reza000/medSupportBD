"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Search,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { RegistrationStatus, UserRole } from "@/types/domain";

interface RegistrationStatusCardProps {
  trackingNumber: string;
  initialStatus: RegistrationStatus;
  entityName: string;
  role: UserRole;
  submittedAt: string;
  onReset?: () => void;
}

export const RegistrationStatusCard: React.FC<RegistrationStatusCardProps> = ({
  trackingNumber,
  initialStatus,
  entityName,
  role,
  submittedAt,
  onReset,
}) => {
  const [status, setStatus] = useState<RegistrationStatus>(initialStatus);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stages = [
    {
      title: "1. Digital Submission & 2FA",
      desc: "All required licenses, NID, and OTP verified successfully.",
      isDone: true,
      current: false,
    },
    {
      title: "2. DGDA & Tax Registry Match",
      desc: "Automated verification against Directorate General of Drug Administration (DGDA) database.",
      isDone: status === RegistrationStatus.APPROVED,
      current: status === RegistrationStatus.PENDING_VERIFICATION,
    },
    {
      title: "3. Physical Premises & Geo-Audit",
      desc: "Territory field officer physical shop/depot inspection.",
      isDone: status === RegistrationStatus.APPROVED,
      current: false,
    },
    {
      title: "4. Account Approval & Credit Line",
      desc: "Official enterprise account credential issued and revolving limit activated.",
      isDone: status === RegistrationStatus.APPROVED,
      current: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
      
      {/* Interactive Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header Gradient */}
        <div
          className={`p-6 text-white text-center space-y-2 ${
            status === RegistrationStatus.APPROVED
              ? "bg-gradient-to-r from-emerald-800 to-teal-800"
              : status === RegistrationStatus.REJECTED
              ? "bg-gradient-to-r from-rose-900 to-red-800"
              : "bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA]"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto shadow-lg border border-white/20">
            {status === RegistrationStatus.APPROVED ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            ) : status === RegistrationStatus.REJECTED ? (
              <XCircle className="w-8 h-8 text-rose-300" />
            ) : (
              <Clock className="w-8 h-8 text-indigo-200 animate-pulse" />
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {status === RegistrationStatus.APPROVED
              ? "Account Approved & Verified!"
              : status === RegistrationStatus.REJECTED
              ? "Application Requires Revision"
              : "Registration Application Received"}
          </h2>

          <p className="text-xs text-white/80 max-w-md mx-auto">
            {status === RegistrationStatus.APPROVED
              ? "Your DGDA license credentials and shop premises have been officially verified. You may now sign in."
              : status === RegistrationStatus.REJECTED
              ? "Trade license expiration date or NID mismatch was identified during DGDA registry audit."
              : "Your documents and geo-location coordinates are under regulatory compliance review."}
          </p>
        </div>

        {/* Tracking Details Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Application Tracking ID:
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-base font-black text-slate-900">
                {trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title="Copy tracking ID"
              >
                {copied ? <Check className="w-4 h-4 text-[#4F46E5]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${
                status === RegistrationStatus.APPROVED
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : status === RegistrationStatus.REJECTED
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : "bg-indigo-50 text-[#4F46E5] border-indigo-200"
              }`}
            >
              {status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Verification Timeline */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              DGDA & Supply Chain Onboarding Stages
            </h4>
            <span className="text-[11px] font-bold text-slate-500">
              Est. Review: 24-48 Hours
            </span>
          </div>

          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  stage.isDone
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                    : stage.current
                    ? "bg-indigo-50/70 border-indigo-300 shadow-sm text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-600 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black mt-0.5 ${
                    stage.isDone
                      ? "bg-emerald-600 text-white"
                      : stage.current
                      ? "bg-[#4F46E5] text-white animate-pulse"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {stage.isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-bold">{stage.title}</div>
                  <div className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
                    {stage.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Demo Preview Mode (Allows User to Test All Statuses) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Interactive Verification Preview Switcher:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus(RegistrationStatus.PENDING_VERIFICATION)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                  status === RegistrationStatus.PENDING_VERIFICATION
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                ⏳ Pending
              </button>
              <button
                type="button"
                onClick={() => setStatus(RegistrationStatus.APPROVED)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                  status === RegistrationStatus.APPROVED
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                ✅ Approved
              </button>
              <button
                type="button"
                onClick={() => setStatus(RegistrationStatus.REJECTED)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                  status === RegistrationStatus.REJECTED
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                ❌ Rejected
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Register Another Entity</span>
              </button>
            )}

            {status === RegistrationStatus.APPROVED ? (
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Verified Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : status === RegistrationStatus.REJECTED ? (
              <button
                type="button"
                onClick={onReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Re-Apply with Corrected Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Explore MedSupplyBD Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
