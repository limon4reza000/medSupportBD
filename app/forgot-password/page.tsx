"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Phone,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return;
    setIsSent(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Forgot Password Card (Pure White Card) */}
      <div className="w-full max-w-md premium-card p-8 space-y-6">
        
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#025540] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Reset Account Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your registered official email or mobile to receive an OTP verification code.
          </p>
        </div>

        {isSent ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <div className="font-bold">Verification OTP Sent!</div>
            <p className="text-[11px] text-slate-600">
              We have dispatched a 6-digit security code to <strong>{emailOrPhone}</strong>.
            </p>
            <div className="pt-2">
              <Link href="/login" className="font-bold text-emerald-800 hover:underline">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700">Registered Email / Mobile:</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="pharmacy@gmail.com or 01711XXXXXX"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Send Recovery Code</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <Link href="/login" className="font-bold text-emerald-700 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
