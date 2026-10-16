"use client";

import React, { useState } from "react";
import {
  Building2,
  Store,
  Factory,
  Truck,
  UserCheck,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Mail,
  FileText,
  CreditCard,
  Building,
} from "lucide-react";
import {
  UserRole,
  IRegistrationDocument,
  BD_PHONE_REGEX,
  BD_NID_REGEX,
  BD_TIN_REGEX,
} from "@/types/domain";
import { LocationPickerModal } from "./LocationPickerModal";
import { DocumentUploadBox } from "./DocumentUploadBox";
import { OtpVerificationModal } from "./OtpVerificationModal";

interface RoleRegistrationFormProps {
  role: UserRole;
  onBackToRoles: () => void;
  onProceedToReview: (data: any, documents: IRegistrationDocument[]) => void;
}

const PHARMA_COMPANIES = [
  "Square Pharmaceuticals PLC",
  "Beximco Pharmaceuticals Ltd.",
  "Incepta Pharmaceuticals Ltd.",
  "Renata PLC",
  "ACI Healthcare Limited",
  "Eskayef Pharmaceuticals Ltd.",
  "Opsonin Pharma Limited",
  "Aristopharma Ltd.",
  "Healthcare Pharmaceuticals Ltd.",
  "Popular Pharmaceuticals Ltd.",
];

export const RoleRegistrationForm: React.FC<RoleRegistrationFormProps> = ({
  role,
  onBackToRoles,
  onProceedToReview,
}) => {
  // Form State
  const [formData, setFormData] = useState<any>({
    role,
    shopName: "",
    companyName: "",
    distributorName: "",
    ownerName: "",
    authorizedPersonName: "",
    phone: "",
    email: "",
    nidNumber: "",
    tradeLicenseNo: "",
    tinNumber: "",
    address: "",
    latitude: 23.7465,
    longitude: 90.376,
    thana: "Dhanmondi",
    district: "Dhaka",
    employeeId: "",
    affiliatedCompany: "Square Pharmaceuticals PLC",
    designatedTerritory: "",
    serviceArea: ["Dhaka Central", "Dhanmondi", "Mohammadpur"],
    authorizedPharmaCompanies: ["Square Pharmaceuticals PLC", "Beximco Pharmaceuticals Ltd."],
    isPhoneVerified: false,
    isEmailVerified: false,
  });

  // Attached Documents
  const [documents, setDocuments] = useState<IRegistrationDocument[]>([]);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpTargetType, setOtpTargetType] = useState<"phone" | "email">("phone");

  // Inline Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for field
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleDocumentChange = (type: IRegistrationDocument["type"], doc: IRegistrationDocument | null) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.type !== type);
      return doc ? [...filtered, doc] : filtered;
    });
  };

  const getDoc = (type: IRegistrationDocument["type"]) => {
    return documents.find((d) => d.type === type);
  };

  // Validation function before proceeding
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Pharmacy Owner & Retail Pharmacy
    if (role === UserRole.PHARMACY_OWNER || role === UserRole.RETAIL_PHARMACY) {
      if (!formData.shopName || formData.shopName.trim().length < 3) {
        newErrors.shopName = "Pharmacy / Shop Name is required (minimum 3 characters)";
      }
      if (!formData.ownerName || formData.ownerName.trim().length < 3) {
        newErrors.ownerName = "Owner's Full Name is required";
      }
      if (!formData.phone || !BD_PHONE_REGEX.test(formData.phone.replace(/[\s-]/g, ""))) {
        newErrors.phone = "Enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)";
      } else if (!formData.isPhoneVerified) {
        newErrors.phone = "Mobile number must be verified via OTP before continuing";
      }
      if (!formData.nidNumber || !BD_NID_REGEX.test(formData.nidNumber.trim())) {
        newErrors.nidNumber = "Valid NID number is mandatory (10, 13, or 17 digits)";
      }
      if (!formData.tradeLicenseNo || formData.tradeLicenseNo.trim().length < 4) {
        newErrors.tradeLicenseNo = "Trade License Number is mandatory";
      }
      if (!formData.tinNumber || formData.tinNumber.trim().length < 4) {
        newErrors.tinNumber = "TIN / e-TIN certificate number is mandatory";
      }
      if (!formData.address || formData.address.trim().length < 5) {
        newErrors.address = "Shop location & address must be provided";
      }
    }

    // 2. Pharmaceutical Company
    if (role === UserRole.PHARMA_COMPANY) {
      if (!formData.companyName || formData.companyName.trim().length < 3) {
        newErrors.companyName = "Company Name is mandatory";
      }
      if (!formData.address || formData.address.trim().length < 5) {
        newErrors.address = "Company HQ / Factory location is mandatory";
      }
      if (!formData.tradeLicenseNo || formData.tradeLicenseNo.trim().length < 4) {
        newErrors.tradeLicenseNo = "Corporate Trade License is mandatory";
      }
      if (!formData.tinNumber || formData.tinNumber.trim().length < 4) {
        newErrors.tinNumber = "Corporate e-TIN is mandatory";
      }
      if (!formData.isPhoneVerified && !formData.isEmailVerified) {
        newErrors.phone = "At least one verified official contact (Mobile OTP or Email) is required";
      }
    }

    // 3. Distributor / Depot
    if (role === UserRole.DISTRIBUTOR) {
      if (!formData.distributorName || formData.distributorName.trim().length < 3) {
        newErrors.distributorName = "Distributor / Depot Name is mandatory";
      }
      if (!formData.ownerName || formData.ownerName.trim().length < 3) {
        newErrors.ownerName = "Owner or Authorized Person's Full Name is mandatory";
      }
      if (!formData.phone || !BD_PHONE_REGEX.test(formData.phone.replace(/[\s-]/g, ""))) {
        newErrors.phone = "Valid 11-digit mobile number is required";
      } else if (!formData.isPhoneVerified) {
        newErrors.phone = "Mobile number must be verified via OTP";
      }
      if (!formData.tradeLicenseNo || formData.tradeLicenseNo.trim().length < 4) {
        newErrors.tradeLicenseNo = "Trade License Number is mandatory";
      }
      if (!formData.tinNumber || formData.tinNumber.trim().length < 4) {
        newErrors.tinNumber = "TIN / e-TIN certificate is mandatory";
      }
      if (!formData.address || formData.address.trim().length < 5) {
        newErrors.address = "Business depot physical location is mandatory";
      }
    }

    // 4. Medical Representative (MPO / SR)
    if (role === UserRole.SALES_REP) {
      if (!formData.employeeId || formData.employeeId.trim().length < 2) {
        newErrors.employeeId = "Employee ID is mandatory";
      }
      if (!formData.nidNumber || !BD_NID_REGEX.test(formData.nidNumber.trim())) {
        newErrors.nidNumber = "NID Number is mandatory (10, 13, or 17 digits)";
      }
      const hasPhone = formData.phone && BD_PHONE_REGEX.test(formData.phone.replace(/[\s-]/g, ""));
      const hasEmail = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!hasPhone && !hasEmail) {
        newErrors.phone = "At least one contact method is required: mobile number or email address";
      } else if (!formData.isPhoneVerified && !formData.isEmailVerified) {
        newErrors.phone = "Please complete OTP verification for your contact method";
      }
      if (!formData.affiliatedCompany) {
        newErrors.affiliatedCompany = "Affiliated Pharmaceutical Company is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onProceedToReview(formData, documents);
    }
  };

  const getRoleHeader = () => {
    switch (role) {
      case UserRole.PHARMACY_OWNER:
        return {
          title: "Pharmacy Owner Registration",
          desc: "Multi-branch retail group credit line & direct pharmaceutical depot supply",
          icon: Store,
        };
      case UserRole.RETAIL_PHARMACY:
        return {
          title: "Retail Pharmacy Registration",
          desc: "Independent dispensary, POS billing, and local distributor inventory access",
          icon: Building2,
        };
      case UserRole.PHARMA_COMPANY:
        return {
          title: "Pharmaceutical Company Registration",
          desc: "Manufacturer institutional supply chain, DGDA catalog, and depot operations",
          icon: Factory,
        };
      case UserRole.DISTRIBUTOR:
        return {
          title: "Distributor & Logistics Depot Registration",
          desc: "Authorized territorial distribution hub, cold chain, and retailer order fulfillment",
          icon: Truck,
        };
      case UserRole.SALES_REP:
        return {
          title: "Medical Representative (MPO / SR) Registration",
          desc: "Authorized field order cutting terminal, territory beat routes, and quota tracking",
          icon: UserCheck,
        };
      default:
        return {
          title: "Enterprise Registration",
          desc: "B2B Pharmaceutical Supply Chain Onboarding",
          icon: ShieldCheck,
        };
    }
  };

  const header = getRoleHeader();
  const HeaderIcon = header.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <HeaderIcon className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Step 2: Role-Specific Application Form
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">{header.title}</h2>
              <p className="text-xs text-white/80 mt-0.5">{header.desc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToRoles}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-indigo-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change Role
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* =============================================================== */}
          {/* 1. ROLE: PHARMACY OWNER & RETAIL PHARMACY                       */}
          {/* =============================================================== */}
          {(role === UserRole.PHARMACY_OWNER || role === UserRole.RETAIL_PHARMACY) && (
            <div className="space-y-4">
              
              {/* Row 1: Pharmacy Name & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pharmacy / Shop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => updateField("shopName", e.target.value)}
                    placeholder="e.g. Al-Madina Med Care"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.shopName ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.shopName && <p className="text-[11px] text-rose-600 mt-1">{errors.shopName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner's Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    placeholder="e.g. Dr. Mohammad Rafiqul Islam"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.ownerName ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.ownerName && <p className="text-[11px] text-rose-600 mt-1">{errors.ownerName}</p>}
                </div>
              </div>

              {/* Row 2: Mobile Number (with OTP verify trigger) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (For Order OTP & Logistics) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        updateField("phone", e.target.value);
                        updateField("isPhoneVerified", false);
                      }}
                      placeholder="01XXXXXXXXX"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                        errors.phone ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                      }`}
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!BD_PHONE_REGEX.test(formData.phone.replace(/[\s-]/g, ""))) {
                        setErrors((prev) => ({ ...prev, phone: "Enter a valid 11-digit mobile number before OTP" }));
                        return;
                      }
                      setOtpTargetType("phone");
                      setIsOtpModalOpen(true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      formData.isPhoneVerified
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-default"
                        : "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs active:scale-95"
                    }`}
                  >
                    {formData.isPhoneVerified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OTP Verified</span>
                      </>
                    ) : (
                      <span>Verify OTP *</span>
                    )}
                  </button>
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Row 3: NID Number & Trade License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NID Number (10, 13, or 17 digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nidNumber}
                    onChange={(e) => updateField("nidNumber", e.target.value)}
                    placeholder="1988269123456"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.nidNumber ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.nidNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.nidNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trade License Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNo}
                    onChange={(e) => updateField("tradeLicenseNo", e.target.value)}
                    placeholder="TRAD/DSCC/012345/2024"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.tradeLicenseNo ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.tradeLicenseNo && <p className="text-[11px] text-rose-600 mt-1">{errors.tradeLicenseNo}</p>}
                </div>
              </div>

              {/* Row 4: TIN / e-TIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TIN / e-TIN Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tinNumber}
                  onChange={(e) => updateField("tinNumber", e.target.value)}
                  placeholder="12-digit e-TIN (e.g. 782910482910)"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                    errors.tinNumber ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                  }`}
                />
                {errors.tinNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.tinNumber}</p>}
              </div>

              {/* Row 5: Shop Location (Address + Map Picker) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Shop Location & Geo-Coordinates <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#FB923C]" />
                    {formData.latitude ? "Change Pin on Map" : "Select on Map *"}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Enter Shop #, Road #, Thana, District"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                  {formData.latitude && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Verified GPS: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}</span>
                      <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">Territory Locked</span>
                    </div>
                  )}
                </div>
                {errors.address && <p className="text-[11px] text-rose-600">{errors.address}</p>}
              </div>

              {/* Row 6: Document Uploads */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-900">
                  Required Document Certifications (Camera Capture / File Upload)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DocumentUploadBox
                    label="Trade License Certificate"
                    type="TRADE_LICENSE"
                    isRequired
                    hint="Upload copy or take clear mobile photo"
                    currentDoc={getDoc("TRADE_LICENSE")}
                    onDocumentChange={(doc) => handleDocumentChange("TRADE_LICENSE", doc)}
                  />
                  <DocumentUploadBox
                    label="TIN / e-TIN Certificate"
                    type="TIN_CERTIFICATE"
                    isRequired
                    hint="Upload tax certificate or snapshot"
                    currentDoc={getDoc("TIN_CERTIFICATE")}
                    onDocumentChange={(doc) => handleDocumentChange("TIN_CERTIFICATE", doc)}
                  />
                </div>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* 2. ROLE: PHARMACEUTICAL COMPANY                                */}
          {/* =============================================================== */}
          {role === UserRole.PHARMA_COMPANY && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmaceutical Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="e.g. Square Pharmaceuticals PLC"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                    errors.companyName ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                  }`}
                />
                {errors.companyName && <p className="text-[11px] text-rose-600 mt-1">{errors.companyName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate Trade License Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNo}
                    onChange={(e) => updateField("tradeLicenseNo", e.target.value)}
                    placeholder="TRAD/CORP/00918/2024"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.tradeLicenseNo ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.tradeLicenseNo && <p className="text-[11px] text-rose-600 mt-1">{errors.tradeLicenseNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate TIN / e-TIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tinNumber}
                    onChange={(e) => updateField("tinNumber", e.target.value)}
                    placeholder="12-digit Corporate TIN"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.tinNumber ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.tinNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.tinNumber}</p>}
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Corporate HQ / Plant Location <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#FB923C]" />
                    {formData.latitude ? "Change Pin on Map" : "Select on Map *"}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Corporate HQ Address, Mohakhali, Dhaka"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
                {errors.address && <p className="text-[11px] text-rose-600">{errors.address}</p>}
              </div>

              {/* Recommended Company Fields */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900">
                  Authorized Company Representative & Contact (Must Verify at least 1)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Representative Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => updateField("ownerName", e.target.value)}
                      placeholder="e.g. Managing Director / Head of Sales"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Contact Phone
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTargetType("phone");
                          setIsOtpModalOpen(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 ${
                          formData.isPhoneVerified
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                        }`}
                      >
                        {formData.isPhoneVerified ? "Verified" : "Verify"}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Corporate Email
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="institutional.sales@pharma.com.bd"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTargetType("email");
                          setIsOtpModalOpen(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 ${
                          formData.isEmailVerified
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                        }`}
                      >
                        {formData.isEmailVerified ? "Verified" : "Verify Email"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <DocumentUploadBox
                  label="Corporate Trade License"
                  type="TRADE_LICENSE"
                  isRequired
                  currentDoc={getDoc("TRADE_LICENSE")}
                  onDocumentChange={(doc) => handleDocumentChange("TRADE_LICENSE", doc)}
                />
                <DocumentUploadBox
                  label="Corporate TIN Certificate"
                  type="TIN_CERTIFICATE"
                  isRequired
                  currentDoc={getDoc("TIN_CERTIFICATE")}
                  onDocumentChange={(doc) => handleDocumentChange("TIN_CERTIFICATE", doc)}
                />
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* 3. ROLE: DISTRIBUTOR / DEPOT                                    */}
          {/* =============================================================== */}
          {role === UserRole.DISTRIBUTOR && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Distributor / Depot Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.distributorName}
                    onChange={(e) => updateField("distributorName", e.target.value)}
                    placeholder="e.g. Dhaka Central Distribution Depot"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.distributorName ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.distributorName && <p className="text-[11px] text-rose-600 mt-1">{errors.distributorName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner or Authorized Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    placeholder="e.g. Tariqul Islam (Depot Manager)"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.ownerName ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.ownerName && <p className="text-[11px] text-rose-600 mt-1">{errors.ownerName}</p>}
                </div>
              </div>

              {/* Mobile with OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (Verified by OTP) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      updateField("phone", e.target.value);
                      updateField("isPhoneVerified", false);
                    }}
                    placeholder="01XXXXXXXXX"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.phone ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!BD_PHONE_REGEX.test(formData.phone.replace(/[\s-]/g, ""))) {
                        setErrors((prev) => ({ ...prev, phone: "Enter valid 11-digit mobile" }));
                        return;
                      }
                      setOtpTargetType("phone");
                      setIsOtpModalOpen(true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      formData.isPhoneVerified
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs"
                    }`}
                  >
                    {formData.isPhoneVerified ? "OTP Verified" : "Verify OTP *"}
                  </button>
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Trade License & TIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trade License Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNo}
                    onChange={(e) => updateField("tradeLicenseNo", e.target.value)}
                    placeholder="TRAD/DEPOT/8821/2024"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.tradeLicenseNo ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.tradeLicenseNo && <p className="text-[11px] text-rose-600 mt-1">{errors.tradeLicenseNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    TIN / e-TIN Certificate <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tinNumber}
                    onChange={(e) => updateField("tinNumber", e.target.value)}
                    placeholder="12-digit e-TIN"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.tinNumber ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.tinNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.tinNumber}</p>}
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Warehouse Depot Physical Location <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#FB923C]" />
                    {formData.latitude ? "Change Depot Pin" : "Select on Map *"}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Plot 18, Tejgaon Industrial Area, Dhaka"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
                {errors.address && <p className="text-[11px] text-rose-600">{errors.address}</p>}
              </div>

              {/* Recommended Authorized Manufacturers Multi-Select */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Authorized Pharmaceutical Companies Represented:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PHARMA_COMPANIES.slice(0, 6).map((comp) => {
                    const isSelected = formData.authorizedPharmaCompanies?.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => {
                          const current = formData.authorizedPharmaCompanies || [];
                          const updated = isSelected
                            ? current.filter((c: string) => c !== comp)
                            : [...current, comp];
                          updateField("authorizedPharmaCompanies", updated);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          isSelected
                            ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {comp.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <DocumentUploadBox
                  label="Depot Trade License"
                  type="TRADE_LICENSE"
                  isRequired
                  currentDoc={getDoc("TRADE_LICENSE")}
                  onDocumentChange={(doc) => handleDocumentChange("TRADE_LICENSE", doc)}
                />
                <DocumentUploadBox
                  label="TIN Certificate"
                  type="TIN_CERTIFICATE"
                  isRequired
                  currentDoc={getDoc("TIN_CERTIFICATE")}
                  onDocumentChange={(doc) => handleDocumentChange("TIN_CERTIFICATE", doc)}
                />
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* 4. ROLE: MEDICAL REPRESENTATIVE (MPO / SR)                      */}
          {/* =============================================================== */}
          {role === UserRole.SALES_REP && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => updateField("employeeId", e.target.value)}
                    placeholder="e.g. EMP-SQ-10492"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.employeeId ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.employeeId && <p className="text-[11px] text-rose-600 mt-1">{errors.employeeId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    National ID (NID) Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nidNumber}
                    onChange={(e) => updateField("nidNumber", e.target.value)}
                    placeholder="10, 13, or 17 digits"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5] ${
                      errors.nidNumber ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                    }`}
                  />
                  {errors.nidNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.nidNumber}</p>}
                </div>
              </div>

              {/* Affiliated Pharmaceutical Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Affiliated Pharmaceutical Manufacturer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.affiliatedCompany}
                  onChange={(e) => updateField("affiliatedCompany", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                >
                  {PHARMA_COMPANIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Your identity and employment status will be verified through this company before full access is granted.
                </p>
              </div>

              {/* Contact Verification: Mobile OR Email */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900">
                  Contact Credentials & Verification (At least 1 required) <span className="text-rose-500">*</span>
                </div>

                <div className="space-y-3">
                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number (OTP Verification Supported)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          updateField("phone", e.target.value);
                          updateField("isPhoneVerified", false);
                        }}
                        placeholder="01XXXXXXXXX"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!BD_PHONE_REGEX.test(formData.phone.replace(/[\s-]/g, ""))) {
                            setErrors((prev) => ({ ...prev, phone: "Enter valid 11-digit mobile" }));
                            return;
                          }
                          setOtpTargetType("phone");
                          setIsOtpModalOpen(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          formData.isPhoneVerified
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                        }`}
                      >
                        {formData.isPhoneVerified ? "OTP Verified" : "Verify Phone OTP"}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Gmail / Email Address (Email Verification Supported)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          updateField("email", e.target.value);
                          updateField("isEmailVerified", false);
                        }}
                        placeholder="rep.name@company.com or rep@gmail.com"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                            setErrors((prev) => ({ ...prev, phone: "Enter valid email address" }));
                            return;
                          }
                          setOtpTargetType("email");
                          setIsOtpModalOpen(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          formData.isEmailVerified
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                        }`}
                      >
                        {formData.isEmailVerified ? "Email Verified" : "Verify Email"}
                      </button>
                    </div>
                  </div>
                </div>

                {errors.phone && <p className="text-[11px] text-rose-600 font-bold">{errors.phone}</p>}
              </div>

              {/* Territory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designated Field Route / Territory
                </label>
                <input
                  type="text"
                  value={formData.designatedTerritory}
                  onChange={(e) => updateField("designatedTerritory", e.target.value)}
                  placeholder="e.g. Dhanmondi - Kalabagan - Green Road Medical Route"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* Optional Document Upload: Employee ID Card */}
              <div className="pt-2">
                <DocumentUploadBox
                  label="Official Employee ID Card / Appointment Letter"
                  type="EMPLOYEE_ID_CARD"
                  hint="Snap photo of employee ID badge or upload appointment letter"
                  currentDoc={getDoc("EMPLOYEE_ID_CARD")}
                  onDocumentChange={(doc) => handleDocumentChange("EMPLOYEE_ID_CARD", doc)}
                />
              </div>

            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBackToRoles}
              className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Role Selection</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Review Application Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <LocationPickerModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          initialAddress={formData.address}
          onConfirmLocation={(loc) => {
            updateField("address", loc.address);
            updateField("latitude", loc.latitude);
            updateField("longitude", loc.longitude);
            if (loc.thana) updateField("thana", loc.thana);
            if (loc.district) updateField("district", loc.district);
          }}
        />
      )}

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <OtpVerificationModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          target={otpTargetType === "phone" ? formData.phone : formData.email}
          type={otpTargetType}
          onVerified={() => {
            if (otpTargetType === "phone") {
              updateField("isPhoneVerified", true);
            } else {
              updateField("isEmailVerified", true);
            }
          }}
        />
      )}

    </div>
  );
};
