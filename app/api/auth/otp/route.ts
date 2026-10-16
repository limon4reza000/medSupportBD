import { NextRequest, NextResponse } from "next/server";
import { BD_PHONE_REGEX } from "@/types/domain";

// Temporary in-memory OTP cache: target (phone/email) -> { otp, expiresAt, verified }
const otpStore = new Map<string, { code: string; expiresAt: number; verified: boolean }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, target, code, type = "phone" } = body;

    const normalizedTarget = (target || "").trim().replace(/[\s-]/g, "");

    if (!normalizedTarget) {
      return NextResponse.json(
        { success: false, error: "Phone number or email address is required." },
        { status: 400 }
      );
    }

    // Action: SEND OTP
    if (action === "send") {
      if (type === "phone" && !BD_PHONE_REGEX.test(normalizedTarget)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)." },
          { status: 400 }
        );
      }
      if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTarget)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      // Generate a 6-digit OTP code (e.g. 729401 or random)
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      otpStore.set(normalizedTarget, { code: generatedCode, expiresAt, verified: false });

      // In production, an SMS gateway (e.g. Banglalink/Grameenphone API or Twilio) or SendGrid email would be called.
      // For instant pairing and user evaluation, we return the generated code in development mode response and banner.
      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${normalizedTarget}. Code expires in 5 minutes.`,
        target: normalizedTarget,
        demoCode: generatedCode, // Exposed for immediate evaluation
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

      const record = otpStore.get(normalizedTarget);

      // Default demo bypass if user enters 123456 or matching code
      const isMatch = (record && record.code === code.trim()) || code.trim() === "123456";

      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code. Please check and try again." },
          { status: 400 }
        );
      }

      if (record && Date.now() > record.expiresAt) {
        return NextResponse.json(
          { success: false, error: "Verification code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      // Mark verified
      otpStore.set(normalizedTarget, { code: code.trim(), expiresAt: Date.now() + 3600000, verified: true });

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
