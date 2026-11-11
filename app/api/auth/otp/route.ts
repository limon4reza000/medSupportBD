import { NextRequest, NextResponse } from "next/server";
import { BD_PHONE_REGEX } from "@/types/domain";
import {
  normalizeTarget,
  checkLockout,
  checkSendRateLimit,
  recordOtpSend,
  verifyOtpCode,
} from "@/lib/auth/otpStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, target, code, type = "phone" } = body;

    const normalized = normalizeTarget(target, type);

    if (!normalized) {
      return NextResponse.json(
        { success: false, error: "Phone number or email address is required." },
        { status: 400 }
      );
    }

    // Action: SEND OTP
    if (action === "send") {
      if (type === "phone" && !BD_PHONE_REGEX.test(normalized)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)." },
          { status: 400 }
        );
      }
      if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      // Check account lockout
      const lockout = checkLockout(normalized);
      if (lockout.isLocked) {
        return NextResponse.json(
          {
            success: false,
            error: `Account temporarily locked due to multiple failed verification attempts. Please wait ${lockout.minutesRemaining} minute(s).`,
            isLocked: true,
          },
          { status: 429 }
        );
      }

      // Check send rate limit (maximum 3 sends per hour)
      const rateLimit = checkSendRateLimit(normalized);
      if (rateLimit.isRateLimited) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded. Maximum 3 OTP requests per hour. Please wait before requesting another code.",
            cooldownSeconds: rateLimit.cooldownSeconds,
          },
          { status: 429 }
        );
      }

      // Generate a 6-digit OTP code (e.g. 412736)
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      recordOtpSend(normalized, generatedCode, 5 * 60 * 1000); // 5 minutes TTL

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${normalized}. Code expires in 5 minutes.`,
        target: normalized,
        cooldownSeconds: 60,
        demoCode: generatedCode,
      });
    }

    // Action: VERIFY OTP
    if (action === "verify") {
      if (!code || code.trim().length !== 6) {
        return NextResponse.json(
          { success: false, error: "Please enter the 6-digit verification code." },
          { status: 400 }
        );
      }

      const verification = verifyOtpCode(normalized, code);

      if (!verification.success) {
        return NextResponse.json(
          {
            success: false,
            error: verification.error,
            remainingAttempts: verification.remainingAttempts,
            isLocked: verification.isLocked,
          },
          { status: verification.isLocked ? 429 : 401 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: `${type === "phone" ? "Mobile number" : "Email address"} verified successfully!`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported action. Use 'send' or 'verify'." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process OTP." },
      { status: 500 }
    );
  }
}
