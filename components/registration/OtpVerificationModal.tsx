"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Smartphone,
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
} from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: string; // phone or email
  type: "phone" | "email";
  onVerified: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  target,
  type,
  onVerified,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Send OTP when modal opens
  useEffect(() => {
    if (isOpen && target) {
      handleSendOtp();
    }
  }, [isOpen, target]);

  // 60-second countdown
  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleSendOtp = async () => {
    setError(null);
    setIsSending(true);
    setTimer(60);
    setCanResend(false);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          target,
          type,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code.");
      }
      if (data.demoCode) {
        setDemoCode(data.demoCode);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFillDemo = () => {
    const fillCode = demoCode || "729401";
    setCode(fillCode.split(""));
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of the code.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          target,
          code: fullCode,
          type,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid verification code.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="p-5 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              {type === "phone" ? (
                <Smartphone className="w-5 h-5 text-indigo-200" />
              ) : (
                <Mail className="w-5 h-5 text-indigo-200" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {type === "phone" ? "Mobile OTP Verification" : "Email Verification"}
              </h3>
              <p className="text-[11px] text-indigo-100/80">DGDA Two-Factor Credential Check</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-center">
          {isSuccess ? (
            <div className="py-6 space-y-2 animate-in zoom-in-90">
              <CheckCircle2 className="w-12 h-12 text-[#4F46E5] mx-auto animate-bounce" />
              <h4 className="font-extrabold text-base text-slate-900">Verification Successful!</h4>
              <p className="text-xs text-slate-500">Your contact credential has been cryptographically confirmed.</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-slate-600">
                  We sent a 6-digit verification code to:
                </p>
                <div className="text-sm font-black font-mono text-slate-900 mt-1">
                  {target}
                </div>
              </div>

              {/* Demo Evaluation Notice */}
              {demoCode && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Demo OTP Code: <code className="font-mono text-sm font-black text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-300">{demoCode}</code></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDemo}
                    className="text-[11px] font-black text-indigo-700 hover:underline shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-black font-mono text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-2xs"
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resend & Timer */}
              <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>Didn't receive code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className="font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSending ? "animate-spin" : ""}`} />
                    Resend Code
                  </button>
                ) : (
                  <span className="font-mono font-bold text-slate-700">
                    Resend in {timer}s
                  </span>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || code.join("").length !== 6}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  code.join("").length === 6 && !isVerifying
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white active:scale-98 shadow-indigo-500/25"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? "Verifying Token..." : "Verify & Lock Contact"}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
