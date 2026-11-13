import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { TransactionType } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const body = await req.json();
    const { amount, paymentMethod, notes } = body;

    const invoice = db.getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: `Invoice '${invoiceId}' not found.` },
        { status: 404 }
      );
    }

    const payAmount = Number(amount) || invoice.dueAmount;
    if (payAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (payAmount > invoice.dueAmount) {
      return NextResponse.json(
        { success: false, error: `Payment amount (৳${payAmount}) exceeds invoice due amount (৳${invoice.dueAmount}).` },
        { status: 422 }
      );
    }

    // 1. Update invoice
    db.payInvoice(invoice.id, payAmount);

    // 2. Update pharmacy balance & ledger
    const pharmacy = db.getPharmacy(invoice.pharmacyId);
    if (pharmacy) {
      const prevBal = pharmacy.currentBalance;
      const newBal = db.updatePharmacyBalance(pharmacy.id, -payAmount);
      db.addLedgerEntry({
        id: `ledg-pay-${Date.now()}`,
        pharmacyId: pharmacy.id,
        orderId: invoice.orderId,
        transactionType: TransactionType.PAYMENT_CREDIT,
        amount: payAmount,
        previousBalance: prevBal,
        newBalance: newBal,
        referenceNumber: `REC-${invoice.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        notes: notes || `Settlement for invoice ${invoice.invoiceNumber} via ${paymentMethod || "bKash"}`,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Emit notification
    db.addNotification({
      id: `notif-${Date.now()}`,
      pharmacyId: invoice.pharmacyId,
      title: "Invoice Payment Received",
      message: `৳${payAmount.toLocaleString()} paid against ${invoice.invoiceNumber}. Available credit increased.`,
      type: "CREDIT_ALERT",
      metadata: { invoiceId: invoice.id, amount: payAmount },
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ৳${payAmount.toLocaleString()} successful.`,
      invoice: db.getInvoice(invoice.id),
      pharmacyBalance: pharmacy ? pharmacy.currentBalance : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment." },
      { status: 500 }
    );
  }
}
