import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { TransactionType } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pharmacyId = "pharm-01",
      amount,
      paymentMethod = "BKASH",
      referenceNumber,
      notes,
    } = body;

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    const pharmacy = db.getPharmacy(pharmacyId);
    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    // Process ledger credit
    const prevBal = pharmacy.currentBalance;
    const newBal = db.updatePharmacyBalance(pharmacy.id, -payAmount);
    const txId = `ledg-pay-${Date.now()}`;
    const ref = referenceNumber || `REC-${paymentMethod}-${Date.now().toString().slice(-6)}`;

    db.addLedgerEntry({
      id: txId,
      pharmacyId: pharmacy.id,
      transactionType: TransactionType.PAYMENT_CREDIT,
      amount: payAmount,
      previousBalance: prevBal,
      newBalance: newBal,
      referenceNumber: ref,
      notes: notes || `Wholesale dues settlement via ${paymentMethod}`,
      createdAt: new Date().toISOString(),
    });

    // Unblock credit if balance is below limit
    if (pharmacy.isCreditBlocked && newBal < pharmacy.creditLimit) {
      pharmacy.isCreditBlocked = false;
    }

    // Emit notification
    db.addNotification({
      id: `notif-${Date.now()}`,
      pharmacyId: pharmacy.id,
      title: "Wholesale Payment Cleared",
      message: `৳${payAmount.toLocaleString()} credited to your account via ${paymentMethod}. Reference: ${ref}.`,
      type: "CREDIT_ALERT",
      metadata: { txId, amount: payAmount, newBalance: newBal },
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ৳${payAmount.toLocaleString()} processed successfully.`,
      creditSnapshot: {
        creditLimit: pharmacy.creditLimit,
        previousBalance: prevBal,
        newBalance: newBal,
        availableCredit: Math.max(0, pharmacy.creditLimit - newBal),
        isCreditBlocked: pharmacy.isCreditBlocked,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment." },
      { status: 500 }
    );
  }
}
