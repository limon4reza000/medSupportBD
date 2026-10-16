"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Package,
  Search,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { UserRole, RegistrationStatus, IRegistrationDocument } from "@/types/domain";
import { RoleSelectionCards } from "@/components/registration/RoleSelectionCards";
import { RoleRegistrationForm } from "@/components/registration/RoleRegistrationForm";
import { RegistrationReviewStep } from "@/components/registration/RegistrationReviewStep";
import { RegistrationStatusCard } from "@/components/registration/RegistrationStatusCard";

type RegistrationStep = "SELECT_ROLE" | "FILL_FORM" | "REVIEW" | "STATUS_VIEW";

export default function RegisterPage() {
  const [step, setStep] = useState<RegistrationStep>("SELECT_ROLE");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(UserRole.PHARMACY_OWNER);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [attachedDocuments, setAttachedDocuments] = useState<IRegistrationDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Status view state
  const [trackingInfo, setTrackingInfo] = useState<{
    trackingNumber: string;
    status: RegistrationStatus;
    entityName: string;
    role: UserRole;
    submittedAt: string;
  } | null>(null);

  // Status Lookup Bar State
  const [lookupQuery, setLookupQuery] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Handle proceed from role select to form
  const handleProceedToForm = () => {
    if (selectedRole) {
      setStep("FILL_FORM");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle proceed from form to review
  const handleProceedToReview = (data: any, docs: IRegistrationDocument[]) => {
    setSubmittedData(data);
    setAttachedDocuments(docs);
    setStep("REVIEW");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit official application to backend API
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...submittedData,
        documents: attachedDocuments,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit registration application.");
      }

      setTrackingInfo({
        trackingNumber: data.trackingNumber,
        status: data.status || RegistrationStatus.PENDING_VERIFICATION,
        entityName: data.entityName,
        role: data.role,
        submittedAt: data.submittedAt,
      });

      setStep("STATUS_VIEW");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setServerError(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check application status lookup
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const isPhone = /^\d{9,15}$/.test(lookupQuery.replace(/[\s-]/g, ""));
      const param = isPhone ? `phone=${encodeURIComponent(lookupQuery)}` : `tracking=${encodeURIComponent(lookupQuery)}`;

      const res = await fetch(`/api/auth/register?${param}`);
      const data = await res.json();

      if (!res.ok || !data.found) {
        throw new Error(data.message || data.error || "No application found for this ID or Phone.");
      }

      const app = data.application;
      setTrackingInfo({
        trackingNumber: app.trackingNumber,
        status: app.status,
        entityName: app.shopName || app.companyName || app.distributorName || app.ownerName || "Applicant",
        role: app.role,
        submittedAt: app.createdAt,
      });

      setStep("STATUS_VIEW");
    } catch (err: any) {
      setLookupError(err.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleReset = () => {
    setStep("SELECT_ROLE");
    setSubmittedData(null);
    setAttachedDocuments([]);
    setTrackingInfo(null);
    setServerError(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Status Lookup Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Link href="/" className="hover:text-[#4F46E5] transition-colors">
            MedSupplyBD
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-700 font-extrabold">Enterprise Registration</span>
        </div>

        {/* Existing Application Status Quick Lookup */}
        <form onSubmit={handleLookup} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Check Status: REG-2026-XXXX or Phone"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] bg-slate-50"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isLookingUp}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 active:scale-95"
          >
            {isLookingUp ? "Checking..." : "Track Status"}
          </button>
        </form>
      </div>

      {lookupError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{lookupError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLookupError(null)}
            className="text-rose-500 hover:text-rose-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stepper Progress Bar (Only during registration steps) */}
      {step !== "STATUS_VIEW" && (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div
              className={`p-2 rounded-xl transition-all font-bold ${
                step === "SELECT_ROLE"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              1. Select Role
            </div>
            <div
              className={`p-2 rounded-xl transition-all font-bold ${
                step === "FILL_FORM"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              2. Entity Credentials
            </div>
            <div
              className={`p-2 rounded-xl transition-all font-bold ${
                step === "REVIEW"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              3. Review & Submit
            </div>
          </div>
        </div>
      )}

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs font-bold text-rose-800 space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-black text-sm">Submission Error:</span>
          </div>
          <p className="pl-7">{serverError}</p>
        </div>
      )}

      {/* STEP 1: ROLE SELECTION CARDS */}
      {step === "SELECT_ROLE" && (
        <RoleSelectionCards
          selectedRole={selectedRole}
          onSelectRole={(r) => setSelectedRole(r)}
          onProceed={handleProceedToForm}
        />
      )}

      {/* STEP 2: ROLE SPECIFIC FORM */}
      {step === "FILL_FORM" && selectedRole && (
        <RoleRegistrationForm
          role={selectedRole}
          onBackToRoles={() => setStep("SELECT_ROLE")}
          onProceedToReview={handleProceedToReview}
        />
      )}

      {/* STEP 3: REVIEW & SUBMIT */}
      {step === "REVIEW" && submittedData && (
        <RegistrationReviewStep
          formData={submittedData}
          documents={attachedDocuments}
          onBack={() => setStep("FILL_FORM")}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* STEP 4: REGISTRATION STATUS VIEW */}
      {step === "STATUS_VIEW" && trackingInfo && (
        <RegistrationStatusCard
          trackingNumber={trackingInfo.trackingNumber}
          initialStatus={trackingInfo.status}
          entityName={trackingInfo.entityName}
          role={trackingInfo.role}
          submittedAt={trackingInfo.submittedAt}
          onReset={handleReset}
        />
      )}

      {/* Bottom Footer Callout */}
      <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
        <p>
          Already have an authorized enterprise account?{" "}
          <Link href="/login" className="font-bold text-[#4F46E5] hover:underline">
            Sign In to your Terminal
          </Link>
        </p>
        <p className="text-[11px] text-slate-400">
          MedSupplyBD • DGDA Regulatory Compliant B2B Pharmaceutical Logistics & Wholesale Supply Chain
        </p>
      </div>

    </div>
  );
}
