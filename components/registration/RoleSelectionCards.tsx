"use client";

import React from "react";
import {
  Building2,
  Store,
  Factory,
  Truck,
  UserCheck,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { UserRole } from "@/types/domain";

interface RoleSelectionCardsProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  onProceed: () => void;
}

export const RoleSelectionCards: React.FC<RoleSelectionCardsProps> = ({
  selectedRole,
  onSelectRole,
  onProceed,
}) => {
  const roles = [
    {
      role: UserRole.PHARMACY_OWNER,
      title: "Pharmacy Owner",
      badge: "Wholesale & Credit Line",
      badgeColor: "bg-indigo-50 text-[#4F46E5] border-indigo-200",
      icon: Store,
      description:
        "For licensed retail chains & community pharmacy owners applying for revolving credit lines, direct depot delivery, and wholesale trade bonuses.",
      requiredDocs: ["Trade License", "TIN / e-TIN", "NID", "Shop Location"],
    },
    {
      role: UserRole.RETAIL_PHARMACY,
      title: "Retail Pharmacy",
      badge: "Dispensary & OTC POS",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Building2,
      description:
        "For independent retail chemists and hospital counter dispensaries needing cloud POS, batch barcode billing, and fast depot stock reordering.",
      requiredDocs: ["Trade License", "TIN / e-TIN", "NID", "Shop Location"],
    },
    {
      role: UserRole.PHARMA_COMPANY,
      title: "Pharmaceutical Company",
      badge: "Manufacturer HQ",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Factory,
      description:
        "For pharmaceutical manufacturing corporations managing national medicine portfolios (41,000+ SKUs), promotional trade offers, and depot networks.",
      requiredDocs: ["Trade License", "TIN / e-TIN", "Corporate Location", "Verified Contact"],
    },
    {
      role: UserRole.DISTRIBUTOR,
      title: "Distributor / Depot",
      badge: "Logistics & Cold-Chain",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Truck,
      description:
        "For authorized pharmaceutical distribution hubs, warehouse depots, and cold-chain logistics operators supplying local pharmacy networks.",
      requiredDocs: ["Depot Name", "Trade License", "TIN Certificate", "Warehouse GPS Location"],
    },
    {
      role: UserRole.SALES_REP,
      title: "Medical Representative (MPO / SR)",
      badge: "Field Order Cutting",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      icon: UserCheck,
      description:
        "For field medical representatives and territory sales officers taking digital pharmacy orders, managing visit quotas, and tracking delivery.",
      requiredDocs: ["Employee ID", "NID Number", "Verified Mobile / Gmail", "Affiliated Company"],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-[#4F46E5] border border-indigo-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Step 1: Choose Registration Role
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Select Your Business Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          MedSupplyBD provides dedicated onboarding workflows, DGDA compliance verification, and permissions tailored to your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.role;

          return (
            <div
              key={item.role}
              onClick={() => onSelectRole(item.role)}
              className={`relative cursor-pointer rounded-2xl sm:rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-[#4F46E5] bg-indigo-50/40 shadow-xl shadow-indigo-500/10 scale-[1.02]"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-md animate-in zoom-in-75">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/30"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Required Verification:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.requiredDocs.map((doc, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg"
                    >
                      • {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onProceed}
          disabled={!selectedRole}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg ${
            selectedRole
              ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/25 hover:scale-105 active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Continue to Role Application Form</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
