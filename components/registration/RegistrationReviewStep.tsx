"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  FileText,
  User,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { UserRole, IRegistrationDocument } from "@/types/domain";

interface RegistrationReviewStepProps {
  formData: any;
  documents: IRegistrationDocument[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const RegistrationReviewStep: React.FC<RegistrationReviewStepProps> = ({
  formData,
  documents,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const [declared, setDeclared] = useState(false);

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case UserRole.PHARMACY_OWNER:
        return "Pharmacy Owner (Credit Line & Wholesale)";
      case UserRole.RETAIL_PHARMACY:
        return "Retail Pharmacy Dispensary & POS";
      case UserRole.PHARMA_COMPANY:
        return "Pharmaceutical Manufacturer HQ";
      case UserRole.DISTRIBUTOR:
        return "Authorized Distributor & Logistics Depot";
      case UserRole.SALES_REP:
        return "Medical Promotion Officer (MPO / SR)";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-[#4F46E5] border border-indigo-200">
          <BadgeCheck className="w-3.5 h-3.5" />
          Step 3: Review & Final Submission
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Verify Application Credentials
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Please review all submitted information before submitting to DGDA regulatory verification and depot authorization.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header Summary Pill */}
        <div className="p-5 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
              Selected Role:
            </div>
            <div className="text-base sm:text-lg font-black mt-0.5">
              {getRoleTitle(formData.role)}
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
            Pre-Submission Audit
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs">
          
          {/* Section 1: Business Identity */}
          <div className="space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#4F46E5]" />
              Business / Organization Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              {formData.shopName && (
                <div>
                  <span className="text-slate-500 block">Pharmacy / Shop Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.shopName}</span>
                </div>
              )}
              {formData.companyName && (
                <div>
                  <span className="text-slate-500 block">Company Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.companyName}</span>
                </div>
              )}
              {formData.distributorName && (
                <div>
                  <span className="text-slate-500 block">Distributor / Depot:</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.distributorName}</span>
                </div>
              )}
              {formData.employeeId && (
                <div>
                  <span className="text-slate-500 block">Official Employee ID:</span>
                  <span className="font-mono font-black text-indigo-700 text-sm">{formData.employeeId}</span>
                </div>
              )}
              {formData.affiliatedCompany && (
                <div>
                  <span className="text-slate-500 block">Affiliated Manufacturer:</span>
                  <span className="font-bold text-slate-900">{formData.affiliatedCompany}</span>
                </div>
              )}
              {(formData.ownerName || formData.authorizedPersonName) && (
                <div>
                  <span className="text-slate-500 block">Proprietor / Authorized Person:</span>
                  <span className="font-bold text-slate-900">{formData.ownerName || formData.authorizedPersonName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Contact Verification */}
          <div className="space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#4F46E5]" />
              Contact & 2FA Verification Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              {formData.phone && (
                <div>
                  <span className="text-slate-500 block">Mobile Number:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-900">{formData.phone}</span>
                    {formData.isPhoneVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <CheckCircle2 className="w-3 h-3" /> OTP Verified
                      </span>
                    )}
                  </div>
                </div>
              )}
              {formData.email && (
                <div>
                  <span className="text-slate-500 block">Official Email:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-slate-900">{formData.email}</span>
                    {formData.isEmailVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Legal & DGDA Identifiers */}
          <div className="space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
              Regulatory Licenses & Tax Identifiers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              {formData.tradeLicenseNo && (
                <div>
                  <span className="text-slate-500 block">Trade License:</span>
                  <span className="font-mono font-bold text-slate-900">{formData.tradeLicenseNo}</span>
                </div>
              )}
              {formData.tinNumber && (
                <div>
                  <span className="text-slate-500 block">TIN / e-TIN:</span>
                  <span className="font-mono font-bold text-slate-900">{formData.tinNumber}</span>
                </div>
              )}
              {formData.nidNumber && (
                <div>
                  <span className="text-slate-500 block">National ID (NID):</span>
                  <span className="font-mono font-bold text-slate-900">{formData.nidNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Physical Location & GPS Coordinates */}
          {(formData.address || formData.latitude) && (
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#4F46E5]" />
                Registered Geo-Location
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">{formData.address}</div>
                {formData.latitude && formData.longitude && (
                  <div className="font-mono text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-indigo-700">
                      GPS: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                    </span>
                    <span>• Locked for territory depot delivery routing</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Uploaded Verification Documents */}
          <div className="space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
              Attached Supporting Documents ({documents.length})
            </h4>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-200 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{doc.fileName}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{doc.type.replace(/_/g, " ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-center italic">
                No physical file attachments provided (direct e-TIN / digital license validation selected).
              </div>
            )}
          </div>

          {/* Declaration Checkbox */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#4F46E5] focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-800 font-medium leading-relaxed">
                I solemnly affirm and declare that the Trade License, TIN, NID, and business credentials submitted are authentic, up-to-date, and comply with the Directorate General of Drug Administration (DGDA) Bangladesh laws.
              </span>
            </label>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={!declared || isSubmitting}
              className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg ${
                declared && !isSubmitting
                  ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/25 active:scale-95 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting Application..." : "Confirm & Submit Application"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
