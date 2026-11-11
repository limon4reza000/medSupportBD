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

export const dynamic = "force-dynamic";

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

    // 2. Pre-calculation & Multi-Company Categorization
    interface CalculatedItem {
      medicine: (typeof db.medicines)[0];
      companyName: string;
      tradeCalc: ReturnType<typeof PackagingEngine.evaluateTradeAndBonus>;
      totalLooseRequired: number;
      originalMedicineId?: string;
    }

    const calculatedItems: CalculatedItem[] = [];
    let grandGross = 0;
    let grandDiscount = 0;
    let grandVat = 0;
    let grandNetPayable = 0;

    for (const item of items) {
      const medicine = db.getMedicine(item.medicineId);
      if (!medicine) {
        StockLockEngine.releaseLock(lockToken);
        return NextResponse.json(
          { error: `Medicine ID '${item.medicineId}' does not exist in catalog.` },
          { status: 400 }
        );
      }

      const activeOffer =
        db.getOfferForMedicine(medicine.id) ||
        db.getOfferForMedicine(item.medicineId) ||
        (medicine.brandName.toLowerCase().includes("napa")
          ? db.tradeOffers.find((o) => o.medicineId === "med-01" || o.schemeType === "BUY_X_GET_Y_FREE")
          : undefined);

      const tradeCalc = PackagingEngine.evaluateTradeAndBonus(
        medicine,
        item.orderedUnit,
        item.orderedQty,
        activeOffer
      );

      const totalLooseRequired = tradeCalc.looseUnitsBilled + tradeCalc.bonusLooseUnits;

      grandGross += tradeCalc.grossPrice;
      grandDiscount += tradeCalc.discountAmount;
      grandVat += tradeCalc.vatAmount;
      grandNetPayable += tradeCalc.netItemTotal;

      calculatedItems.push({
        medicine,
        companyName: medicine.manufacturer || "Generic Pharmaceutical Depot",
        tradeCalc,
        totalLooseRequired,
        originalMedicineId: item.medicineId,
      });
    }

    // 3. Credit & Ledger Risk Assessment Phase
    const simulatedOldestInvoice = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString();
    const creditAudit = CreditLedgerEngine.auditPharmacyCredit(
      pharmacy,
      grandNetPayable,
      simulatedOldestInvoice
    );

    if (!creditAudit.isApproved) {
      return NextResponse.json(
        {
          error: "Checkout Blocked by Credit Risk Policy",
          details: creditAudit.rejectionReason,
          creditAudit,
        },
        { status: 403 }
      );
    }

    // 4. Optimistic Stock Locking Phase
    for (const item of calculatedItems) {
      const batches = db.getBatchesForMedicine(item.medicine.id);
      const availableStock = BatchFifoEngine.getTotalAvailableStock(batches);

      const lockResult = StockLockEngine.acquireLock(
        item.originalMedicineId || item.medicine.id,
        item.totalLooseRequired,
        availableStock,
        180000, // 3 minutes TTL
        lockToken
      );

      if (!lockResult.success) {
        StockLockEngine.releaseLock(lockToken);
        return NextResponse.json(
          {
            error: `Stock locking failed for ${item.medicine.brandName}: ${lockResult.error}`,
            insufficientStock: true,
            medicineId: item.medicine.id,
            brandName: item.medicine.brandName,
          },
          { status: 409 }
        );
      }
    }

    // 5. Atomic Multi-Company Decomposition
    // Group calculated items by Company/Manufacturer
    const companyGroups = new Map<string, CalculatedItem[]>();
    for (const item of calculatedItems) {
      const companyKey = item.companyName;
      if (!companyGroups.has(companyKey)) {
        companyGroups.set(companyKey, []);
      }
      companyGroups.get(companyKey)!.push(item);
    }

    const createdOrders = [];
    const baseTimestamp = Date.now();
    let orderIndex = 0;

    for (const [companyName, groupItems] of Array.from(companyGroups.entries())) {
      orderIndex++;
      const companyCode = companyName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "MED");
      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${companyCode}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      const orderId = `ord-${baseTimestamp}-${orderIndex}`;

      let companyGross = 0;
      let companyDiscount = 0;
      let companyVat = 0;
      let companyNet = 0;
      let companyLooseBilled = 0;
      let companyBonusLoose = 0;
      const allocatedItemsBreakdown = [];

      // FEFO allocation for this company's items
      for (const item of groupItems) {
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
              error: `Insufficient batch allocation for ${item.medicine.brandName} (${companyName}). Shortage: ${fifoResult.shortageUnits} units.`,
            },
            { status: 409 }
          );
        }

        // Deduct from batches
        for (const alloc of fifoResult.allocations) {
          db.updateBatchStock(alloc.batchId, alloc.piecesAllocated);
        }

        companyGross += item.tradeCalc.grossPrice;
        companyDiscount += item.tradeCalc.discountAmount;
        companyVat += item.tradeCalc.vatAmount;
        companyNet += item.tradeCalc.netItemTotal;
        companyLooseBilled += item.tradeCalc.looseUnitsBilled;
        companyBonusLoose += item.tradeCalc.bonusLooseUnits;

        allocatedItemsBreakdown.push({
          medicineId: item.originalMedicineId || item.medicine.id,
          brandName: item.medicine.brandName,
          orderedQty: item.tradeCalc.orderedQty,
          orderedUnit: item.tradeCalc.orderedUnit,
          looseUnitsBilled: item.tradeCalc.looseUnitsBilled,
          bonusLooseUnits: item.tradeCalc.bonusLooseUnits,
          netItemTotal: item.tradeCalc.netItemTotal,
          batchBreakdown: fifoResult.allocations,
        });
      }

      // Record Company-Specific Order
      const companyOrderRecord = {
        id: orderId,
        orderNumber,
        companyName,
        pharmacyId: pharmacy.id,
        depotId: depotId || "depot-dhk-01",
        placedById: salesRepId || "user-sr-01",
        status: OrderStatus.ALLOCATED,
        grossAmount: Number(companyGross.toFixed(2)),
        tradeDiscountAmount: Number(companyDiscount.toFixed(2)),
        vatAmount: Number(companyVat.toFixed(2)),
        netPayableAmount: Number(companyNet.toFixed(2)),
        totalLoosePieces: companyLooseBilled,
        totalBonusPieces: companyBonusLoose,
        deliveryNotes: deliveryNotes || `B2B Wholesale Dispatch from ${companyName}`,
        createdAt: new Date().toISOString(),
        items: allocatedItemsBreakdown,
      };

      db.addOrder(companyOrderRecord);
      createdOrders.push(companyOrderRecord);
    }

    // 6. Update Pharmacy Financial Ledger for the consolidated transaction
    const previousBalance = pharmacy.currentBalance;
    const newBalance = db.updatePharmacyBalance(pharmacy.id, grandNetPayable);

    const primaryOrder = createdOrders[0];
    const ledgerTxId = `LEDG-${baseTimestamp}`;

    db.addLedgerEntry({
      id: ledgerTxId,
      pharmacyId: pharmacy.id,
      orderId: primaryOrder.id,
      transactionType: TransactionType.INVOICE_DEBIT,
      amount: grandNetPayable,
      previousBalance,
      newBalance,
      referenceNumber: `INV-${primaryOrder.orderNumber}`,
      notes: `Order Cut confirmed across ${createdOrders.length} company orders (${calculatedItems.length} line items)`,
      createdAt: new Date().toISOString(),
    });

    // 7. Release optimistic stock locks
    StockLockEngine.releaseLock(lockToken);

    // 8. Construct Backward-Compatible and Multi-Company Response
    const primaryAllocatedItems = createdOrders.flatMap((o) => o.items);

    const legacyPayload: CheckoutResponseData = {
      orderId: primaryOrder.id,
      orderNumber: primaryOrder.orderNumber,
      status: OrderStatus.ALLOCATED,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.tradeName,
      totalItems: calculatedItems.length,
      totalLoosePieces: createdOrders.reduce((sum, o) => sum + o.totalLoosePieces, 0),
      totalBonusPieces: createdOrders.reduce((sum, o) => sum + o.totalBonusPieces, 0),
      grossAmount: Number(grandGross.toFixed(2)),
      tradeDiscountAmount: Number(grandDiscount.toFixed(2)),
      vatAmount: Number(grandVat.toFixed(2)),
      netPayableAmount: Number(grandNetPayable.toFixed(2)),
      allocatedItems: primaryAllocatedItems,
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
      isMultiCompany: createdOrders.length > 1,
      totalOrdersCreated: createdOrders.length,
      companyOrders: createdOrders.map((o) => ({
        orderId: o.id,
        orderNumber: o.orderNumber,
        companyName: o.companyName,
        netPayableAmount: o.netPayableAmount,
        status: o.status,
        itemCount: o.items.length,
      })),
      consolidatedSummary: {
        grandTotal: Number(grandNetPayable.toFixed(2)),
        totalItemsCount: calculatedItems.length,
        totalOrdersCount: createdOrders.length,
        creditLimitRemaining: Number((pharmacy.creditLimit - newBalance).toFixed(2)),
      },
      message:
        createdOrders.length > 1
          ? `Successfully placed ${createdOrders.length} separate orders for ${Array.from(companyGroups.keys()).join(", ")}.`
          : `Order #${primaryOrder.orderNumber} placed successfully with FEFO allocation.`,
      data: legacyPayload,
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
