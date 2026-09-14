import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";
import { CreditLedgerEngine } from "@/services/creditLedgerEngine";
import { PackagingEngine } from "@/services/packagingEngine";
import { StockLockEngine } from "@/services/stockLockEngine";
import {
  CheckoutPayload,
  CheckoutResponseData,
  OrderStatus,
  TransactionType,
} from "@/types/domain";

export async function POST(req: NextRequest) {
  let lockToken = "";

  try {
    const body: CheckoutPayload = await req.json();
    const { pharmacyId, depotId, salesRepId, items, deliveryNotes } = body;

    // 1. Validation of request parameters
    if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid checkout payload. Must include pharmacyId and at least one item." },
        { status: 400 }
      );
    }

    const pharmacy = db.getPharmacy(pharmacyId);
    if (!pharmacy) {
      return NextResponse.json(
        { error: `Pharmacy with ID '${pharmacyId}' not found.` },
        { status: 404 }
      );
    }

    lockToken = StockLockEngine.generateLockToken();

    // 2. Pre-calculation & Optimistic Stock Locking Phase
    let totalGross = 0;
    let totalDiscount = 0;
    let totalVat = 0;
    let totalNetPayable = 0;
    let totalBilledLoosePieces = 0;
    let totalBonusLoosePieces = 0;

    interface CalculatedItem {
      medicine: (typeof db.medicines)[0];
      tradeCalc: ReturnType<typeof PackagingEngine.evaluateTradeAndBonus>;
      totalLooseRequired: number;
    }

    const calculatedItems: CalculatedItem[] = [];

    for (const item of items) {
      const medicine = db.getMedicine(item.medicineId);
      if (!medicine) {
        StockLockEngine.releaseLock(lockToken);
        return NextResponse.json(
          { error: `Medicine ID '${item.medicineId}' does not exist in catalog.` },
          { status: 400 }
        );
      }

      const activeOffer = db.getOfferForMedicine(medicine.id);
      const tradeCalc = PackagingEngine.evaluateTradeAndBonus(
        medicine,
        item.orderedUnit,
        item.orderedQty,
        activeOffer
      );

      const totalLooseRequired = tradeCalc.looseUnitsBilled + tradeCalc.bonusLooseUnits;

      // Check current available stock in depot
      const batches = db.getBatchesForMedicine(medicine.id);
      const availableStock = BatchFifoEngine.getTotalAvailableStock(batches);

      // Attempt optimistic lock
      const lockResult = StockLockEngine.acquireLock(
        medicine.id,
        totalLooseRequired,
        availableStock,
        180000, // 3 minutes TTL
        lockToken
      );

      if (!lockResult.success) {
        StockLockEngine.releaseLock(lockToken);
        return NextResponse.json(
          {
            error: `Stock locking failed for ${medicine.brandName}: ${lockResult.error}`,
            insufficientStock: true,
            medicineId: medicine.id,
            brandName: medicine.brandName,
          },
          { status: 409 }
        );
      }

      totalGross += tradeCalc.grossPrice;
      totalDiscount += tradeCalc.discountAmount;
      totalVat += tradeCalc.vatAmount;
      totalNetPayable += tradeCalc.netItemTotal;
      totalBilledLoosePieces += tradeCalc.looseUnitsBilled;
      totalBonusLoosePieces += tradeCalc.bonusLooseUnits;

      calculatedItems.push({
        medicine,
        tradeCalc,
        totalLooseRequired,
      });
    }

    // 3. Credit & Ledger Risk Assessment Phase
    const creditAudit = CreditLedgerEngine.auditPharmacyCredit(
      pharmacy,
      totalNetPayable,
      "2026-08-20" // simulated oldest unpaid invoice timestamp
    );

    if (!creditAudit.isApproved) {
      // Release acquired locks immediately
      StockLockEngine.releaseLock(lockToken);

      return NextResponse.json(
        {
          error: "Checkout Blocked by Credit Risk Policy",
          details: creditAudit.rejectionReason,
          creditAudit,
        },
        { status: 403 }
      );
    }

    // 4. Atomic FIFO Allocation & Inventory Deduction Phase
    // In SQL/Prisma: executed inside `await prisma.$transaction(async (tx) => { ... })`
    const allocatedItemsBreakdown = [];
    const timestamp = Date.now();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const orderId = `ord-${timestamp}`;

    for (const item of calculatedItems) {
      const batches = db.getBatchesForMedicine(item.medicine.id);
      const fifoResult = BatchFifoEngine.allocateFifoStock(
        item.medicine.id,
        item.medicine.brandName,
        batches,
        item.totalLooseRequired
      );

      if (!fifoResult.isFullyAllocated) {
        StockLockEngine.releaseLock(lockToken);
        return NextResponse.json(
          {
            error: `Insufficient batch allocation for ${item.medicine.brandName}. Shortage: ${fifoResult.shortageUnits} pieces.`,
          },
          { status: 409 }
        );
      }

      // Deduct stock from each allocated batch
      for (const alloc of fifoResult.allocations) {
        db.updateBatchStock(alloc.batchId, alloc.piecesAllocated);
      }

      allocatedItemsBreakdown.push({
        medicineId: item.medicine.id,
        brandName: item.medicine.brandName,
        orderedQty: item.tradeCalc.orderedQty,
        orderedUnit: item.tradeCalc.orderedUnit,
        looseUnitsBilled: item.tradeCalc.looseUnitsBilled,
        bonusLooseUnits: item.tradeCalc.bonusLooseUnits,
        netItemTotal: item.tradeCalc.netItemTotal,
        batchBreakdown: fifoResult.allocations,
      });
    }

    // 5. Update Pharmacy Ledger & Debit Outstanding Balance
    const previousBalance = pharmacy.currentBalance;
    const newBalance = db.updatePharmacyBalance(pharmacy.id, totalNetPayable);

    const ledgerTxId = `LEDG-${timestamp}`;
    db.addLedgerEntry({
      id: ledgerTxId,
      pharmacyId: pharmacy.id,
      orderId,
      transactionType: TransactionType.INVOICE_DEBIT,
      amount: totalNetPayable,
      previousBalance,
      newBalance,
      referenceNumber: `INV-${orderNumber}`,
      notes: `Order Cut confirmed via B2B Gateway (${calculatedItems.length} line items)`,
      createdAt: new Date().toISOString(),
    });

    // 6. Record Order in Database
    const createdOrder = {
      id: orderId,
      orderNumber,
      pharmacyId: pharmacy.id,
      depotId: depotId || "depot-dhk-01",
      placedById: salesRepId || "user-sr-01",
      status: OrderStatus.ALLOCATED,
      grossAmount: totalGross,
      tradeDiscountAmount: totalDiscount,
      vatAmount: totalVat,
      netPayableAmount: totalNetPayable,
      totalLoosePieces: totalBilledLoosePieces,
      totalBonusPieces: totalBonusLoosePieces,
      deliveryNotes: deliveryNotes || "Priority Dispatch",
      createdAt: new Date().toISOString(),
      items: allocatedItemsBreakdown,
    };

    db.addOrder(createdOrder);

    // 7. Release optimistic stock locks upon successful transaction commit
    StockLockEngine.releaseLock(lockToken);

    // 8. Return structured confirmation payload
    const responsePayload: CheckoutResponseData = {
      orderId,
      orderNumber,
      status: OrderStatus.ALLOCATED,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.tradeName,
      totalItems: calculatedItems.length,
      totalLoosePieces: totalBilledLoosePieces,
      totalBonusPieces: totalBonusLoosePieces,
      grossAmount: Number(totalGross.toFixed(2)),
      tradeDiscountAmount: Number(totalDiscount.toFixed(2)),
      vatAmount: Number(totalVat.toFixed(2)),
      netPayableAmount: Number(totalNetPayable.toFixed(2)),
      allocatedItems: allocatedItemsBreakdown,
      creditSnapshot: {
        creditLimit: pharmacy.creditLimit,
        previousBalance,
        newBalance,
        availableCreditRemaining: Number((pharmacy.creditLimit - newBalance).toFixed(2)),
      },
      ledgerTxId,
    };

    return NextResponse.json({
      success: true,
      message: `Order #${orderNumber} cut successfully with FIFO batch allocation and ledger debit.`,
      data: responsePayload,
    });
  } catch (error: any) {
    if (lockToken) {
      StockLockEngine.releaseLock(lockToken);
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during order checkout.",
      },
      { status: 500 }
    );
  }
}
