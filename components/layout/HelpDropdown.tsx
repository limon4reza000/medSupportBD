"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Info,
  LayoutGrid,
  BookOpen,
  Mail,
  Headphones,
  AlertTriangle,
} from "lucide-react";

// Custom Support Agent Icon matching user's requested silhouette image with headset & microphone
const SupportAgentIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    {/* Headset Arc / Headband */}
    <path
      d="M5.5 12.5A6.5 6.5 0 0 1 18.5 12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    
    {/* Head Silhouette */}
    <circle cx="12" cy="11" r="3.8" />
    
    {/* Shoulders Silhouette */}
    <path d="M4.5 20.5c0-3.3 3.4-5.5 7.5-5.5s7.5 2.2 7.5 5.5v0.5H4.5v-0.5z" />

    {/* Ear Cups */}
    <rect x="3.2" y="10" width="2.6" height="5" rx="1.3" />
    <rect x="18.2" y="10" width="2.6" height="5" rx="1.3" />

    {/* Microphone Boom */}
    <path
      d="M19 14.5c0 2-2 3.2-5 3.2h-1.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect x="11.2" y="16.7" width="2.8" height="1.8" rx="0.9" fill="currentColor" />
  </svg>
);

export const HelpDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const helpItems = [
    { label: "About MedSupply", href: "/about", icon: Info },
    { label: "Products & Features", href: "/products", icon: LayoutGrid },
    { label: "Resources", href: "/resources", icon: BookOpen },
    { label: "Contact Us", href: "/contact", icon: Mail },
    { label: "Support Center", href: "/support", icon: Headphones },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Support Agent Trigger Button with Chevron Down */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Help and Support"
        title="Explore & Support"
        className="p-1.5 sm:p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none flex items-center gap-1 group select-none"
      >
        <SupportAgentIcon className="w-6 h-6 sm:w-[26px] sm:h-[26px] text-emerald-200 group-hover:text-white transition-colors" />
        <ChevronDown
          strokeWidth={3}
          className={`w-4 h-4 text-emerald-200 group-hover:text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
          
          {/* Header Title */}
          <div className="px-2 pb-2 mb-1.5 border-b border-slate-100">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
              Explore & Support
            </h4>
          </div>

          {/* Navigation Menu Items */}
          <div className="space-y-0.5">
            {helpItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-slate-100" />

          {/* Report a Problem */}
          <Link
            href="/report-problem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Report a Problem</span>
          </Link>
        </div>
      )}
    </div>
  );
};
