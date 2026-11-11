"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Building2,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/domain";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = UserRole.PHARMACY_OWNER,
  onSuccess,
}) => {
  const { sendOtp, loginWithOtp, loginWithPassword } = useAuth();

  const [step, setStep] = useState<"phone" | "otp" | "password">("phone");
  const [phone, setPhone] = useState("01711409821");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Detect Bangladeshi Mobile Operator Carrier
  const getCarrierInfo = (num: string) => {
    const clean = num.replace(/[\s-]/g, "");
    if (clean.startsWith("017") || clean.startsWith("013")) {
      return { name: "Grameenphone", color: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    if (clean.startsWith("019") || clean.startsWith("014")) {
      return { name: "Banglalink", color: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    if (clean.startsWith("018")) {
      return { name: "Robi Axiata", color: "bg-red-100 text-red-700 border-red-200" };
    }
    if (clean.startsWith("016")) {
      return { name: "Airtel", color: "bg-rose-100 text-rose-700 border-rose-200" };
    }
    if (clean.startsWith("015")) {
      return { name: "Teletalk", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    }
    return null;
  };

  const carrier = getCarrierInfo(phone);

  // Timer countdown for resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "otp" && cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, cooldown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setError(null);
      setIsSuccess(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setCooldown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleRequestOtp = async () => {
    setError(null);
    setIsLoading(true);
    const res = await sendOtp(phone, "phone");
    setIsLoading(false);

    if (res.isLocked) {
      setIsLocked(true);
      setError(res.error || "Account locked. Please wait.");
      return;
    }

    if (res.success) {
      setDemoCode(res.demoCode || null);
      setCooldown(res.cooldownSeconds || 60);
      setCanResend(false);
      setStep("otp");
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } else {
      setError(res.error || "Failed to dispatch verification code.");
    }
  };

  // Handle OTP digit inputs with auto-advance and backspace
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (index === 5 && value) {
      const fullCode = newDigits.slice(0, 5).join("") + value.slice(-1);
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const split = pasted.split("");
      setOtpDigits(split);
      verifyCode(pasted);
    }
  };

  const verifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const res = await loginWithOtp(phone, code, selectedRole);
    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } else {
      if (res.isLocked) {
        setIsLocked(true);
      }
      setError(res.error || "Invalid verification code.");
    }
  };

  const handlePasswordLogin = async () => {
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const res = await loginWithPassword(phone, password, selectedRole);
    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-teal-100">
              DGDA Verified Pharmacy Gateway
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {step === "otp" ? "Enter Verification Code" : "Sign in to MedGo"}
          </h2>
          <p className="text-xs text-teal-50 mt-1">
            {step === "otp"
              ? `We sent a 6-digit OTP code to ${phone}`
              : "Access wholesale medicine procurement and company credit facilities"}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Authentication Verified!</h3>
              <p className="text-xs text-slate-500">Welcome to MedGo Pharmaceutical Network.</p>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Demo Code Helper */}
              {demoCode && step === "otp" && (
                <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Demo Verification Code:</span>
                  </div>
                  <button
                    onClick={() => {
                      const split = demoCode.split("");
                      setOtpDigits(split);
                      verifyCode(demoCode);
                    }}
                    className="font-mono font-bold text-sm bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 hover:bg-emerald-200 cursor-pointer"
                  >
                    {demoCode} (Click to fill)
                  </button>
                </div>
              )}

              {/* STEP 1: Phone / Role Selection */}
              {step === "phone" && (
                <div className="space-y-4">
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { role: UserRole.PHARMACY_OWNER, label: "Pharmacy Owner", icon: Building2 },
                        { role: UserRole.RETAIL_PHARMACY, label: "Staff / Chemist", icon: UserCheck },
                        { role: UserRole.SALES_REP, label: "MPO / Sales", icon: Smartphone },
                      ].map((item) => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setSelectedRole(item.role)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            selectedRole === item.role
                              ? "bg-teal-50/80 border-teal-600 text-teal-800 font-bold shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <item.icon className="w-4 h-4 text-teal-600" />
                          <span className="text-[11px] leading-tight">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Input with Carrier Detection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
                      {carrier && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${carrier.color}`}>
                          {carrier.name}
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
                        +880
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01711409821"
                        className="w-full pl-16 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Enter 11-digit Bangladeshi mobile number registered with your DGDA Drug License.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleRequestOtp}
                    disabled={isLoading || isLocked}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send 6-Digit OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Switch to Password */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setStep("password")}
                      className="text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors cursor-pointer"
                    >
                      Or sign in with Corporate Password
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: OTP Entry */}
              {step === "otp" && (
                <div className="space-y-4">
                  {/* 6-box OTP input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputsRef.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          onPaste={idx === 0 ? handlePaste : undefined}
                          className="w-11 h-13 text-center text-xl font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Timer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <button
                      onClick={() => setStep("phone")}
                      className="hover:text-teal-700 font-medium transition-colors cursor-pointer"
                    >
                      Change Number
                    </button>
                    <div>
                      {canResend ? (
                        <button
                          onClick={handleRequestOtp}
                          className="text-teal-700 hover:text-teal-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend Code</span>
                        </button>
                      ) : (
                        <span>Resend code in {cooldown}s</span>
                      )}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={() => verifyCode()}
                    disabled={isLoading || isLocked}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 3: Password Login */}
              {step === "password" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number or Corporate Email
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01711409821 or name@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <button
                    onClick={handlePasswordLogin}
                    disabled={isLoading}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      onClick={() => setStep("phone")}
                      className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
                    >
                      ← Back to Mobile OTP Login
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
