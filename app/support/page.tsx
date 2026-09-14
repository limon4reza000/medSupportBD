"use client";

import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Headphones,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      q: "How does the FEFO (First Expiry First Out) stock allocation work?",
      a: "When an order is cut, MedSupply automatically queries authoritative batch lot records in MySQL and allocates items starting from the earliest expiry date that meets minimum safety standards. Expired stock is permanently quarantined.",
    },
    {
      q: "How are promotional trade scheme bonuses (10+1 free) calculated?",
      a: "When you add qualifying box/strip quantities to your cart, the PackagingEngine dynamically computes free bonus quantities. Bonus units are delivered with zero billable amount but are fully accounted for in warehouse inventory deduction.",
    },
    {
      q: "What happens if an order exceeds my pharmacy's approved credit headroom?",
      a: "The checkout terminal evaluates: Order Net Payable <= (Credit Limit - Current Outstanding). If exceeded, checkout is gated. You can immediately make a partial settlement via bKash/Bank to restore headroom.",
    },
    {
      q: "How does the AI Prescription & Slip Parser extract medicine names?",
      a: "The AI uses LLM Vision + OCR with fuzzy string matching against the DGDA catalog. Extracted items with confidence >85% are directly matched to SKUs, while ambiguous items are tagged for pharmacist review.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-400" />
          <span>24/7 Pharmaceutical Depot Helpline & FAQ</span>
        </h1>
        <p className="text-xs text-emerald-100/80 mt-0.5">
          Dedicated emergency supply support, order dispatch queries, and technical assistance.
        </p>
      </div>

      {/* Emergency Contact Cards (Pure White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="premium-card p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Emergency Depot Helpline</h3>
          <p className="text-xs text-emerald-700 font-mono font-bold">+880 1711-000222</p>
          <div className="text-[11px] text-slate-400">Available 24 Hours / 7 Days</div>
        </div>

        <div className="premium-card p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Dispute & Credit Support</h3>
          <p className="text-xs text-blue-700 font-mono font-bold">billing@medsupplybd.com</p>
          <div className="text-[11px] text-slate-400">Response within 2 hours</div>
        </div>

        <div className="premium-card p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Central Distribution Hub</h3>
          <p className="text-xs text-slate-700">Plot 12, Tejgaon I/A, Dhaka</p>
          <div className="text-[11px] text-slate-400">DGDA Lic #DL-DHK-9901</div>
        </div>
      </div>

      {/* FAQ Accordion (Pure White Card) */}
      <div className="premium-card p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide pb-3 border-b border-slate-100">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-xs text-slate-900 flex items-start gap-2">
                <span className="text-emerald-700 font-black">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 pl-4 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
