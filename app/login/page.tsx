"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUserRole } = useApp();

  const [email, setEmail] = useState("greencare.pharm@gmail.com");
  const [password, setPassword] = useState("••••••••••••");
  const [role, setRole] = useState<UserRole>(UserRole.PHARMACY_OWNER);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCurrentUserRole(role);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Login Card (Pure White Card) */}
      <div className="w-full max-w-md premium-card p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#025540] text-white flex items-center justify-center mx-auto shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sign In to MedSupply<span className="text-emerald-700">BD</span>
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise B2B Pharmaceutical Order Cutting & Distribution
          </p>
        </div>

        {/* Demo Fast Role Select */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Role to Authenticate:
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setRole(UserRole.PHARMACY_OWNER);
                setEmail("greencare.pharm@gmail.com");
              }}
              className={`p-2 rounded-lg font-semibold transition-all ${
                role === UserRole.PHARMACY_OWNER
                  ? "bg-[#025540] text-white"
                  : "bg-white border text-slate-700 hover:bg-slate-100"
              }`}
            >
              Pharmacy Owner
            </button>
            <button
              type="button"
              onClick={() => {
                setRole(UserRole.SALES_REP);
                setEmail("tariqul.sr@medsupplybd.com");
              }}
              className={`p-2 rounded-lg font-semibold transition-all ${
                role === UserRole.SALES_REP
                  ? "bg-[#025540] text-white"
                  : "bg-white border text-slate-700 hover:bg-slate-100"
              }`}
            >
              Sales Rep (SR/MPO)
            </button>
            <button
              type="button"
              onClick={() => {
                setRole(UserRole.DEPOT_MANAGER);
                setEmail("kamrul.depot@medsupplybd.com");
              }}
              className={`p-2 rounded-lg font-semibold transition-all ${
                role === UserRole.DEPOT_MANAGER
                  ? "bg-[#025540] text-white"
                  : "bg-white border text-slate-700 hover:bg-slate-100"
              }`}
            >
              Depot Manager
            </button>
            <button
              type="button"
              onClick={() => {
                setRole(UserRole.ADMIN);
                setEmail("admin@medsupplybd.com");
              }}
              className={`p-2 rounded-lg font-semibold transition-all ${
                role === UserRole.ADMIN
                  ? "bg-[#025540] text-white"
                  : "bg-white border text-slate-700 hover:bg-slate-100"
              }`}
            >
              System Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700">Official Email:</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Password:</label>
              <Link href="/forgot-password" className="text-emerald-700 hover:underline font-semibold text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          New Pharmacy Retailer?{" "}
          <Link href="/register" className="font-bold text-emerald-700 hover:underline">
            Register for B2B Supply Line
          </Link>
        </div>

      </div>

    </div>
  );
}
