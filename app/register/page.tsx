"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Package,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Registration Card (Pure White Card) */}
      <div className="w-full max-w-xl premium-card p-8 space-y-6">
        
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#025540] text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Pharmacy Onboarding Registration
          </h1>
          <p className="text-xs text-slate-500">
            Apply for revolving credit line & direct pharmaceutical depot supply
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="font-bold text-base text-slate-900">Application Submitted!</h3>
            <p className="text-xs text-slate-600">
              Your Drug License & TIN are being verified with DGDA records. Redirecting to terminal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Pharmacy Trade Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Med Care"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Proprietor / Pharmacist Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. M. A. Karim"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Drug License Number:</label>
                <input
                  type="text"
                  required
                  placeholder="DL-DHK-2024-XXXXX"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Contact Mobile Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 17XX-XXXXXX"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700">Shop Physical Address & Thana:</label>
                <input
                  type="text"
                  required
                  placeholder="Shop #, Road #, Thana, District"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Requested Credit Limit (৳):</label>
                <input
                  type="number"
                  defaultValue={50000}
                  step={10000}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Official Email:</label>
                <input
                  type="email"
                  required
                  placeholder="pharmacy@gmail.com"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95 mt-4"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit for Verification & Onboarding</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Sign In to your Account
          </Link>
        </div>

      </div>

    </div>
  );
}
