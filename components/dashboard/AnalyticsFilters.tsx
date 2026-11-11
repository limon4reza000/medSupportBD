"use client";

import React from "react";
import {
  Calendar,
  Layers,
  Building2,
  RotateCcw,
  Check,
} from "lucide-react";

export const TOP_45_COMPANIES = [
  "Square Pharmaceuticals PLC",
  "Incepta Pharmaceuticals Ltd.",
  "Opsonin Pharma Limited",
  "Drug International Ltd.",
  "Advanced Chemical Industries PLC.",
  "Renata PLC",
  "The ACME Laboratories Ltd.",
  "Beximco Pharmaceuticals Ltd.",
  "Aristopharma Limited",
  "Popular Pharmaceuticals PLC",
  "Eskayef Pharmaceuticals Ltd.",
  "Unimed Unihealth Pharmaceuticals Ltd.",
  "Healthcare Pharmaceuticals Ltd.",
  "Beacon Pharmaceuticals PLC",
  "General Pharmaceuticals Ltd.",
  "Techno Drugs Ltd.",
  "Ibn Sina Pharmaceutical Ind. Ltd.",
  "Navana Pharmaceuticals Ltd.",
  "Globe Pharmaceuticals Ltd.",
  "Albion Laboratories Ltd.",
  "Biopharma Ltd.",
  "Orion Pharma Ltd.",
  "Synovia Pharma PLC.",
  "Ziska Pharmaceuticals Ltd.",
  "Delta Pharma PLC.",
  "G. A. Company Ltd.",
  "Kemiko Pharmaceuticals Ltd.",
  "Pacific Pharmaceuticals Ltd.",
  "Chemist Laboratories Ltd.",
  "Everest Pharmaceuticals Ltd.",
  "Jayson Pharmaceuticals Ltd.",
  "Apex Pharma Ltd.",
  "Asiatic Laboratories Ltd.",
  "Jenphar Bangladesh Ltd.",
  "Pharmasia Ltd.",
  "Euro Pharma Ltd.",
  "NIPRO JMI Pharma Limited",
  "EDCL (Dhaka)",
  "Gonoshasthaya Pharmaceuticals Ltd.",
  "Nevian Lifescience PLC",
  "Radiant Pharmaceuticals Ltd.",
  "Sharif Pharmaceuticals Ltd.",
  "Silva Pharmaceuticals Ltd.",
  "Nuvista Pharma Ltd.",
  "SMC Enterprise Ltd.",
];

export interface AnalyticsFiltersProps {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  periodLabel?: string;
  onOpenCustomModal: () => void;
  onResetFilters: () => void;
}

export function AnalyticsFilters({
  selectedPeriod,
  onSelectPeriod,
  selectedType,
  onSelectType,
  selectedCompany,
  onSelectCompany,
  periodLabel,
  onOpenCustomModal,
  onResetFilters,
}: AnalyticsFiltersProps) {
  const isFiltered =
    selectedPeriod !== "monthly" ||
    selectedType !== "purchase" ||
    selectedCompany !== "all";

  const periodOptions = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "custom", label: "Custom 📅" },
  ];

  const typeOptions = [
    { id: "purchase", label: "Purchase" },
    { id: "sales", label: "Sales" },
    { id: "company_purchase", label: "Company-wise Purchase" },
    { id: "company_sales", label: "Company-wise Sales" },
    { id: "medicine_purchase", label: "Medicine-wise Purchase" },
    { id: "medicine_sales", label: "Medicine-wise Sales" },
  ];

  return (
    <div
      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-3"
      data-testid="analytics-filters-section"
    >
      {/* Top Header: Period summary and Reset action */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          <span>Date Range:</span>
        </span>
        <div className="flex items-center space-x-2">
          {periodLabel && (
            <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {periodLabel}
            </span>
          )}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              data-testid="reset-filters-btn"
              className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center space-x-1 transition-colors bg-slate-100 hover:bg-rose-50 px-2 py-0.5 rounded-md border border-slate-200"
              title="Reset all filters to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Range Pills */}
      <div
        className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs"
        data-testid="period-filter-pills"
      >
        {periodOptions.map((p) => {
          const isSelected = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (p.id === "custom") {
                  onOpenCustomModal();
                }
                onSelectPeriod(p.id);
              }}
              data-testid={`period-pill-${p.id}`}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${
                isSelected
                  ? "bg-[#139485] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Analytics Type Filter */}
      <div className="space-y-1.5 pt-1.5 border-t border-slate-100" data-testid="analytics-type-section">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Analytics Type:</span>
          </span>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100 capitalize">
            {selectedType.replace(/_/g, " ")}
          </span>
        </div>
        <div
          className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs"
          data-testid="type-filter-pills"
        >
          {typeOptions.map((t) => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectType(t.id)}
                data-testid={`type-pill-${t.id}`}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all text-[11px] ${
                  isSelected
                    ? "bg-teal-700 text-white shadow-sm font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Filter Dropdown */}
      <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-100 text-xs" data-testid="company-filter-section">
        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <select
          value={selectedCompany}
          onChange={(e) => onSelectCompany(e.target.value)}
          data-testid="company-select-dropdown"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
        >
          <option value="all">All Companies ({TOP_45_COMPANIES.length} Licensed)</option>
          {TOP_45_COMPANIES.map((comp) => {
            const shortCode = comp.split(" ")[0];
            return (
              <option key={comp} value={shortCode}>
                {comp}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

